from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from git import Repo
from pathlib import Path
import shutil
import os
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize GoogleGenerativeAI with API key
genai.configure(api_key='AIzaSyAEAh4mufNHAh_FiMwD_4nE8xng8Elll6w')

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

        print({"success": True, "combinedContent": combined_content})

    except Exception as e:
        print(e)
        # raise HTTPException(status_code=500, detail=str(e))
