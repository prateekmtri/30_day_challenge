from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from murf import Murf
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get API key from environment
MURF_API_KEY = os.getenv("MURF_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Initialize Murf client with API key
client = Murf(api_key=MURF_API_KEY)

# Define input model for POST request
class TextInput(BaseModel):
    text: str

@app.post("/generate-tts")
def generate_tts(input: TextInput):
    if not MURF_API_KEY:
        raise HTTPException(status_code=500, detail="Murf API key not found in environment.")

    try:
        # Generate TTS using Murf
        response = client.text_to_speech.generate(
            text=input.text,
            voice_id="en-US-natalie"
        )
        
        # Return audio file URL from response
        return {"audio_url": response.audio_file}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
