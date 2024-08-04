from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel, Field
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
    user_id: Link[User]
    job_id: Link[Job]
    repo_url: str = Field(default='')
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


async def clone_and_process():
    try:
        repo_url = "https://github.com/DevHamzaKhan/SpeedSelect"
      
        # Create a unique temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_dir = Path(temp_dir) / 'tempRepo'

            # Clone the repository
            print('Cloning...')
            Repo.clone_from(repo_url, repo_dir)

            # List all files and folders recursively
            files = list_files(repo_dir)
            
            print('files', files)

        print({"success": True, })

    except Exception as e:
        print(e)
        # raise HTTPException(status_code=500, detail=str(e))'


clone_and_process()