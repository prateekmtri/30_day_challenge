// ======================= TTS Section =========================
const output = document.getElementById("output");
const textInput = document.getElementById("textInput");
const generateBtn = document.getElementById("generateBtn");
const audioPlayer = document.getElementById("audioPlayer");

// Time-based greeting
const hours = new Date().getHours();
let greeting = "";

if (hours < 12) {
    greeting = "Good Morning 🌅";
} else if (hours < 18) {
    greeting = "Good Afternoon ☀️";
} else {
    greeting = "Good Evening 🌙";
}

// Animate typing effect for initial greeting
let text = `${greeting}! Ready to convert text to speech 🚀`;
let index = 0;

function typeWriter() {
    if (index < text.length) {
        output.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 50);
    }
}

output.textContent = "";
typeWriter();

async function generateTTS() {
    const inputText = textInput.value.trim();
    
    if (!inputText) {
        output.textContent = "Please enter some text first! 📝";
        output.className = "error";
        return;
    }
    
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    output.textContent = "Converting text to speech... 🔄";
    output.className = "loading";
    audioPlayer.style.display = "none";
    
    try {
        const response = await fetch('/generate-tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.audio_url) {
            output.textContent = `✅ Speech generated successfully! Playing: "${inputText}"`;
            output.className = "success";
            audioPlayer.src = data.audio_url;
            audioPlayer.style.display = "block";

            try {
                await audioPlayer.play();
            } catch (playError) {
                console.log("Auto-play prevented by browser:", playError);
                output.textContent += " (Click play button to hear the audio)";
            }
        } else {
            throw new Error("No audio URL received from server");
        }
        
    } catch (error) {
        console.error('Error generating TTS:', error);
        output.textContent = `❌ Error generating speech: ${error.message}`;
        output.className = "error";
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "🎵 Generate Speech";
    }
}

textInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        generateTTS();
    }
});

textInput.addEventListener('input', function() {
    output.className = "";
});

// ======================= Echo Bot Section =========================
const startRecordingBtn = document.getElementById("startRecordingBtn");
const stopRecordingBtn = document.getElementById("stopRecordingBtn");
const echoAudio = document.getElementById("echoAudio");
const uploadStatus = document.getElementById("uploadStatus");

let mediaRecorder;
let audioChunks = [];

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      echoAudio.src = audioUrl;
      echoAudio.style.display = "block";
      echoAudio.play();

      // Upload audio to server
      uploadStatus.textContent = "Uploading audio... 🔄";
      uploadStatus.className = "loading";

      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        const response = await fetch('/upload-audio', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        uploadStatus.textContent = `✅ Audio uploaded successfully! Filename: ${data.filename}, Type: ${data.content_type}, Size: ${data.size} bytes`;
        uploadStatus.className = "success";
      } catch (error) {
        console.error('Error uploading audio:', error);
        uploadStatus.textContent = `❌ Error uploading audio: ${error.message}`;
        uploadStatus.className = "error";
      }

      audioChunks = [];
    };

    startRecordingBtn.onclick = () => {
      mediaRecorder.start();
      startRecordingBtn.disabled = true;
      stopRecordingBtn.disabled = false;
      uploadStatus.textContent = "Recording... 🎙️";
      uploadStatus.className = "";
    };

    stopRecordingBtn.onclick = () => {
      mediaRecorder.stop();
      startRecordingBtn.disabled = false;
      stopRecordingBtn.disabled = true;
      uploadStatus.textContent = "Processing recording... 🔄";
      uploadStatus.className = "loading";
    };
  })
  .catch(err => {
    console.error("Microphone access denied:", err);
    uploadStatus.textContent = "❌ Microphone access denied. Please allow microphone access.";
    uploadStatus.className = "error";
  });