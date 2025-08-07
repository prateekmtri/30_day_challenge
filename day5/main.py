from fastapi import FastAPI, Request, HTTPException, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests

# Load environment variables
load_dotenv()

app = FastAPI()

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Get API key from environment
MURF_API_KEY = os.getenv("MURF_API_KEY")

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Define input model for TTS
class TextInput(BaseModel):
    text: str

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generate-tts")
async def generate_tts(input: TextInput):
    if not MURF_API_KEY:
        raise HTTPException(status_code=500, detail="Murf API key not found in environment.")
    
    try:
        # Real Murf API implementation
        from murf import Murf
        
        # Initialize Murf client
        client = Murf(api_key=MURF_API_KEY)
        
        # Generate TTS using Murf
        response = client.text_to_speech.generate(
            text=input.text,
            voice_id="en-US-natalie"
        )
        
        # Return actual audio file URL from Murf response
        return {
            "audio_url": response.audio_file,
            "message": "TTS generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Murf API Error: {str(e)}")

@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    try:
        # Generate a unique filename to avoid conflicts
        file_extension = file.filename.split('.')[-1]
        file_name = f"audio_{os.urandom(8).hex()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Get file details
        file_size = os.path.getsize(file_path)
        
        return {
            "filename": file_name,
            "content_type": file.content_type,
            "size": file_size,
            "message": "Audio uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading audio: {str(e)}")