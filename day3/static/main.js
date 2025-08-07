// Get DOM elements
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

// Initialize page
output.textContent = "";
typeWriter();

// Generate TTS function
async function generateTTS() {
    const inputText = textInput.value.trim();
    
    if (!inputText) {
        output.textContent = "Please enter some text first! 📝";
        output.className = "error";
        return;
    }
    
    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    output.textContent = "Converting text to speech... 🔄";
    output.className = "loading";
    audioPlayer.style.display = "none";
    
    try {
        // Call TTS API
        const response = await fetch('/generate-tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: inputText
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.audio_url) {
            // Show success message
            output.textContent = `✅ Speech generated successfully! Playing: "${inputText}"`;
            output.className = "success";
            
            // Set audio source and show player
            audioPlayer.src = data.audio_url;
            audioPlayer.style.display = "block";
            
            // Auto-play the audio
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
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.textContent = "🎵 Generate Speech";
    }
}

// Allow Enter key to trigger TTS generation
textInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        generateTTS();
    }
});

// Clear error/success classes when user starts typing
textInput.addEventListener('input', function() {
    output.className = "";
});