from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from git import Repo
from pathlib import Path
import shutil
import os
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import tempfile
from beanie import Document, Indexed, init_beanie, Link, PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import asyncio
from dotenv import load_dotenv
from typing import List, Optional
import httpx
from bson import ObjectId
from bson.errors import InvalidId

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the database connection
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    await init_beanie(database=client.Hackthe6ix, document_models=[User, Job, Repository])
    
    yield  # This is where the FastAPI app runs
    
    client.close()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# classes for MongoDB
class User(Document):
    devpost: str
    github: str
    github_token: Optional[str] = None
    linkedin: str
    user: dict
    resumeText: str

    class Settings:
        name = "users"

class Job(Document):
    job: str
    type: str
    created: str
    location: str
    description: str
    keywords: List[str]
    applicants: List[Link[User]] = []
    status: str

    class Settings:
        name = "jobs"

class SkillInfo(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None
    score: Optional[float] = None

class FileSummary(BaseModel):
    filename: Optional[str] = None
    summary: Optional[str] = None

class TechCompetence(BaseModel):
    score: Optional[float] = None
    summary: Optional[str] = None

class Repository(Document):
    user_id: str
    job_id: str
    repo_url: str
    summary: Optional[str] = None
    ind_file_summaries: List[FileSummary] = []
    skills: List[SkillInfo] = []
    tech_competence: Optional[TechCompetence] = None

    class Settings:
        name = "repositories"


# Initialize GoogleGenerativeAI with API key
genai.configure(api_key='AIzaSyAEAh4mufNHAh_FiMwD_4nE8xng8Elll6w')

async def init_db():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    await init_beanie(database=client.your_database_name, document_models=[User, Job, Repository])


class CloneRequest(BaseModel):
    repo_url: str


def should_process_folder(path: str) -> bool:
    irrelevant_folders = [
        'node_modules', 'public', '.vscode', '.git', 'dist', 'build', 'coverage', 'logs', 'temp', 'tmp', 'cache', '.vite'
    ]
    modified_path = path.split('tempRepo')[-1] if 'tempRepo' in path else path
    return not any(folder in modified_path for folder in irrelevant_folders)


def should_process_file(file_path: str) -> bool:
    irrelevant_extensions = ['.gitignore', '.css', '.md', '.log', '.json', '.lock', '.yml', '.yaml']
    return not any(file_path.endswith(ext) for ext in irrelevant_extensions)


def list_files_recursive(dir: Path):
    for entry in dir.iterdir():
        if entry.is_dir():
            if should_process_folder(str(entry)):
                yield from list_files_recursive(entry)
        else:
            yield entry


def list_files(dir: Path):
    return [file_path for file_path in list_files_recursive(dir) if should_process_file(str(file_path))]


def get_combined_file_contents(file_paths):
    combined_content = ["Please summarize the following project based on the provided files and their content. The files are organized by name and content:"]
    for file_path in file_paths:
        try:
            with open(file_path, 'r', encoding='utf8') as file:
                content = file.read()
            combined_content.append(f"\n--- File: {file_path} ---\n{content}")
        except (UnicodeDecodeError, IOError) as e:
            print(f"Skipping file {file_path}: {e}")
    return "\n".join(combined_content)


async def store_result_in_mongodb(repo_url: str, summary: str):
    repo = Repository(repo_url=repo_url, summary=summary)
    await repo.insert()
    return str(repo.id)


async def run(prompt: str) -> str:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    return response.text


@app.post("/cloneAndProcess")
async def processor(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    repo_url = body['repoUrl']
    background_tasks.add_task(clone_and_process, repo_url)
    return {"message": "Cloning and processing started in the background."}


async def clone_and_process(repo_url: str):
    try:
        # Create a unique temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_dir = Path(temp_dir) / 'tempRepo'

            # Clone the repository
            print('Cloning...')
            Repo.clone_from(repo_url, repo_dir)

            # List all files and folders recursively
            files = list_files(repo_dir)
            
            print('files', files)

            # Get combined content of all relevant files
            combined_content = get_combined_file_contents(files)

            result = await run(combined_content)
            print(result)

            document_id = await store_result_in_mongodb(repo_url, result)
            print(f"Stored in MongoDB with ID: {document_id}")

        print({"success": True, "combinedContent": combined_content})

    except Exception as e:
        print(e)
        # raise HTTPException(status_code=500, detail=str(e))


@app.get("/begin-processing/{user_id}/{job_id}")
async def begin_processing(user_id: str, job_id: str):
    try:
        # Convert the string user_id and job_id to ObjectId
        user_object_id = ObjectId(user_id)
        job_object_id = ObjectId(job_id)
        
        # Fetch the user from the database
        user = await User.get(user_object_id)

        if not user or not user.github_token:
            raise HTTPException(status_code=404, detail="User not found or GitHub token missing")

        # Fetch the job from the database
        job = await Job.get(job_object_id)

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Make a request to the GitHub API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://api.github.com/user/repos',
                headers={
                    'Authorization': f'Bearer {user.github_token}',
                    'Accept': 'application/vnd.github.v3+json'
                },
                params={
                    'type': 'all',
                    'sort': 'full_name',
                    'per_page': 100
                }
            )

        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="GitHub authentication failed. Token may be invalid.")

        response.raise_for_status()

        # Extract repository information from the GitHub API response
        repos = [
            {
                "name": repo["name"],
                "private": repo["private"],
                "description": repo["description"],
                "url": repo["html_url"]
            }
            for repo in response.json()
        ]

        # Here you can add logic to process the repositories in the context of the job
        # For now, we're just returning the repositories

        return {"user_id": str(user_object_id), "job_id": str(job_object_id), "repositories": repos}

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID or job ID format")
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error processing repositories: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")



# @app.post("/begin-processing")
# async def begin_processing(request: Request):
#     print("Beginning processing")
#     return {"message": "Processing started in the background."}