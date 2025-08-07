// Get output element
const output = document.getElementById("output");

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

// Animate typing effect
let text = `${greeting}! JavaScript is setup 🚀`;
let index = 0;

function typeWriter() {
  if (index < text.length) {
    output.textContent += text.charAt(index);
    index++;
    setTimeout(typeWriter, 50); // typing speed
  }
}

// Start animation
output.textContent = "";  // Clear first
typeWriter();
