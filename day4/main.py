from fastapi import FastAPI, Request, HTTPException
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