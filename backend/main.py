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
import instructor

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

@app.get("/")
async def root():
    return {"message": "Hello World"}

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
# gemini client
client = instructor.from_gemini(
    client=genai.GenerativeModel(
        model_name="models/gemini-1.5-flash-latest",
    ),
    mode=instructor.Mode.GEMINI_JSON,
)


class CloneRequest(BaseModel):
    repo_url: str


def should_process_folder(path: str) -> bool:
    irrelevant_folders = [
        'node_modules', 'public', '.vscode', '.git', 'dist', 'build', 'coverage', 'logs', 'temp', 'tmp', 'cache', '.vite', 'data'
    ]
    modified_path = path.split('tempRepo')[-1] if 'tempRepo' in path else path
    return not any(folder in modified_path for folder in irrelevant_folders)


def should_process_file(file_path: str) -> bool:
    irrelevant_extensions = ['.gitignore', '.css', '.md', '.log', '.json', '.lock', '.yml', '.yaml', '.pkl', '.pth', '.png', '.jpg']
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


async def create_repository_document(user_id: str, job_id: str, repo_url: str):
    try:
        new_repo = Repository(
            user_id=PydanticObjectId(user_id),
            job_id=PydanticObjectId(job_id),
            repo_url=repo_url
        )
        await new_repo.insert()
        return str(new_repo.id)
    except Exception as e:
        print(f"Error creating repository document: {str(e)}")
        raise


class ProcessingRequest(BaseModel):
    user_id: str
    job_id: str

class FileSummary(BaseModel):
    """
    Represents a summary of an individual file in the repository.
    """
    filename: str = Field(description="The name of the file.")
    summary: str = Field(description="A technical and qualitative summary of the file's contents and purpose.")

class SkillInfo(BaseModel):
    """
    Represents information about a specific skill identified in the repository.
    """
    name: str = Field(description="The name of the technology or framework employed by the user in this repository.")
    summary: str = Field(description="A brief description of how this skill is demonstrated in the repository.")
    score: float = Field(description="A score from 0 to 1 indicating the proficiency level in this skill based on the repository content.", ge=0, le=1)

class TechCompetence(BaseModel):
    """
    Represents an overall assessment of technical competence based on the repository.
    """
    score: float = Field(description="An overall score from 0 to 1 indicating the general technical competence of the user demonstrated in this repository.", ge=0, le=1)
    summary: str = Field(description="A brief summary of the overall technical competence demonstrated in this repository.")

class RepositoryAnalysis(BaseModel):
    """
    Analyze the given repository and provide a structured summary of its contents,
    identified skills, and an assessment of technical competence.
    
    Be thorough in your analysis, considering the complexity, quality, and variety of code in the repository.
    Do not provide specific examples from the code to support your assessments where possible.
    """
    summary: str = Field(description="A comprehensive summary of the entire repository, including its main purpose, structure, and notable features.")
    ind_file_summaries: List[FileSummary] = Field(description="Summaries of individual files in the repository.")
    skills: List[SkillInfo] = Field(description="A list of technologies and frameworks demonstrated in the repository, along with assessments of proficiency.")
    tech_competence: TechCompetence = Field(description="An overall assessment of the technical competence demonstrated in this repository.")


# get LLM response, prompt needs to be a string of the combined content of all files
async def run(prompt: str):
    print("Running LLM")
    resp = client.messages.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        response_model=RepositoryAnalysis,
    )
    return resp


# handle cloning and analysis of repo
async def handle_repo(repo, user_obj_id, job_obj_id, access_token):
    # first create repo document to store stuff

    repo_id = await create_repository_document(str(user_obj_id), str(job_obj_id), repo["url"])
    print(f"Created repository document with ID: {repo_id}")

    # then, clone the repo
    try:
        print("in try block")

        job = await Job.get(PydanticObjectId(job_obj_id))
        if not job:
            raise ValueError(f"Job with ID {job_obj_id} not found")
        job_description = job.description

        # Create a unique temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_dir = Path(temp_dir) / 'tempRepo'
            auth_url = repo["url"].replace('https://', f'https://{access_token}@')

            print(auth_url)

            # Clone the repository
            print('Cloning...')
            Repo.clone_from(auth_url, repo_dir)

            # get all the relevant files
            files = list_files(repo_dir)

            # Get combined content of all relevant files
            file_contents = get_combined_file_contents(files)

            prompt = f"""Job Description:
{job_description}

Repository Contents:
{file_contents}

Please analyze the repository contents in the context of the given job description. 
Evaluate how well the skills demonstrated in the repository match the job requirements.
"""
            
            # call run on the final string
            result = await run(prompt)

        print(result)

        repo_document = await Repository.get(PydanticObjectId(repo_id))
        if repo_document:
            repo_document.summary = result.summary
            repo_document.ind_file_summaries = result.ind_file_summaries
            repo_document.skills = result.skills
            repo_document.tech_competence = result.tech_competence

            await repo_document.save()
            print(f"Updated repository document with analysis results")
        else:
            print(f"Repository document with ID {repo_id} not found")


            # take results from run (RepositoryAnalysis) and store in repo document as necessary

    except Exception as e:
        print(f"Error cloning repository: {str(e)}")


@app.post("/spider-and-tech")
async def calc_spider_score_and_tech_comp(request: ProcessingRequest):
    try:
        # Get user_id and job_id from request body
        # body = await request.json()
        user_id = request.user_id
        job_id = request.job_id

        if not user_id or not job_id:
            raise HTTPException(status_code=400, detail="Missing user_id or job_id")

        # Get the job with job_id and extract keywords
        job = await Job.get(ObjectId(job_id))
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        keywords = job.keywords

        # Get all repository documents that have user_id and job_id
        repositories = await Repository.find(
            Repository.user_id == PydanticObjectId(user_id),
            Repository.job_id == PydanticObjectId(job_id)
        ).to_list()

        if not repositories:
            raise HTTPException(status_code=404, detail="No repositories found for this user and job")

        total_tech_competence = 0
        relevant_skills = {keyword: [] for keyword in keywords}

        for repo in repositories:
            # Add tech competence score
            if repo.tech_competence and repo.tech_competence.score is not None:
                total_tech_competence += repo.tech_competence.score

            # Add relevant skill scores
            for skill in repo.skills:
                if skill.name.lower() in [k.lower() for k in keywords]:
                    relevant_skills[skill.name.lower()].append(skill.score)

        # Calculate averages
        avg_tech_competence = total_tech_competence / len(repositories) if repositories else 0
        avg_skill_scores = {
            skill: sum(scores) / len(scores) if scores else 0
            for skill, scores in relevant_skills.items()
        }

        return {
            "average_tech_competence": avg_tech_competence,
            "average_skill_scores": avg_skill_scores
        }

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error in calc_spider_score_and_tech_comp: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# this function begins the processing of repositories
@app.post("/begin-processing")
async def begin_processing(request: ProcessingRequest): #, background_tasks: BackgroundTasks):
    try:
        # Convert the string user_id and job_id to ObjectId
        user_object_id = ObjectId(request.user_id)
        job_object_id = ObjectId(request.job_id)
        
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
        print(repos)

        if repos:

            counter = 0
            for repo in repos:
                await handle_repo(repo, user_object_id, job_object_id, user.github_token)
                counter += 1

                if counter == 5:
                    return {"message": "Dont 5", "total_repos": len(repos)}

            # call background function that initiatives cloning + analysis function
            # background_tasks.add_task(handle_repo, first_repo, user_object_id, job_object_id, user.github_token)
            
            # print("Processing queued for the first repository")

            # background_tasks.add_task(create_repository_document, request.user_id, request.job_id, first_repo["url"])

        return {"message": "Dont 5", "total_repos": len(repos)}

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID or job ID format")
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error processing repositories: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")






# @app.post("/cloneAndProcess")
# async def processor(request: Request, background_tasks: BackgroundTasks):
#     body = await request.json()
#     repo_url = body['repoUrl']
#     background_tasks.add_task(clone_and_process, repo_url)
#     return {"message": "Cloning and processing started in the background."}


# async def clone_and_process(repo_url: str):
#     try:
#         # Create a unique temporary directory
#         with tempfile.TemporaryDirectory() as temp_dir:
#             repo_dir = Path(temp_dir) / 'tempRepo'

#             # Clone the repository
#             print('Cloning...')
#             Repo.clone_from(repo_url, repo_dir)

#             # List all files and folders recursively
#             files = list_files(repo_dir)
            
#             print('files', files)

#             # Get combined content of all relevant files
#             combined_content = get_combined_file_contents(files)

#             result = await run(combined_content)
#             print(result)

#             document_id = await store_result_in_mongodb(repo_url, result)
#             print(f"Stored in MongoDB with ID: {document_id}")

#         print({"success": True, "combinedContent": combined_content})

#     except Exception as e:
#         print(e)
#         # raise HTTPException(status_code=500, detail=str(e))'




# # @app.get("/begin-processing/{user_id}/{job_id}")
# # async def begin_processing(user_id: str, job_id: str):
#     try:
#         # Convert the string user_id and job_id to ObjectId
#         user_object_id = ObjectId(user_id)
#         job_object_id = ObjectId(job_id)
        
#         # Fetch the user from the database
#         user = await User.get(user_object_id)

#         if not user or not user.github_token:
#             raise HTTPException(status_code=404, detail="User not found or GitHub token missing")

#         # Fetch the job from the database
#         job = await Job.get(job_object_id)

#         if not job:
#             raise HTTPException(status_code=404, detail="Job not found")

#         # Make a request to the GitHub API
#         async with httpx.AsyncClient() as client:
#             response = await client.get(
#                 'https://api.github.com/user/repos',
#                 headers={
#                     'Authorization': f'Bearer {user.github_token}',
#                     'Accept': 'application/vnd.github.v3+json'
#                 },
#                 params={
#                     'type': 'all',
#                     'sort': 'full_name',
#                     'per_page': 100
#                 }
#             )

#         if response.status_code == 401:
#             raise HTTPException(status_code=401, detail="GitHub authentication failed. Token may be invalid.")

#         response.raise_for_status()

#         # Extract repository information from the GitHub API response
#         repos = [
#             {
#                 "name": repo["name"],
#                 "private": repo["private"],
#                 "description": repo["description"],
#                 "url": repo["html_url"]
#             }
#             for repo in response.json()
#         ]

#         # Here you can add logic to process the repositories in the context of the job
#         # For now, we're just returning the repositories

#         return {"user_id": str(user_object_id), "job_id": str(job_object_id), "repositories": repos}

#     except InvalidId:
#         raise HTTPException(status_code=400, detail="Invalid user ID or job ID format")
#     except HTTPException as http_exc:
#         raise http_exc
#     except Exception as e:
#         print(f"Error processing repositories: {str(e)}")
#         raise HTTPException(status_code=500, detail="Internal server error")



# @app.post("/begin-processing")
# async def begin_processing(request: Request):
#     print("Beginning processing")
#     return {"message": "Processing started in the background."}