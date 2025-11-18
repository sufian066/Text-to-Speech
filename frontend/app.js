// API Configuration
const API_BASE_URL = 'http://localhost:3001/api/tts';

// Check if browser supports Speech Synthesis
if (!('speechSynthesis' in window)) {
    document.getElementById('status').textContent = 'Sorry, your browser does not support Text-to-Speech!';
    document.getElementById('status').classList.add('active', 'error');
    document.getElementById('speakBtn').disabled = true;
}

const synth = window.speechSynthesis;
let voices = [];
let currentUtterance = null;

// DOM elements
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const pitchSlider = document.getElementById('pitchSlider');
const speedSlider = document.getElementById('speedSlider');
const volumeSlider = document.getElementById('volumeSlider');
const pitchValue = document.getElementById('pitchValue');
const speedValue = document.getElementById('speedValue');
const volumeValue = document.getElementById('volumeValue');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');

// Load voices
function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';

    if (voices.length === 0) {
        voiceSelect.innerHTML = '<option value="">No voices available</option>';
        return;
    }

    // Group voices by language
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
    const otherVoices = voices.filter(voice => !voice.lang.startsWith('en'));

    if (englishVoices.length > 0) {
        const englishGroup = document.createElement('optgroup');
        englishGroup.label = 'English Voices';
        englishVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voices.indexOf(voice);
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.selected = true;
            }
            englishGroup.appendChild(option);
        });
        voiceSelect.appendChild(englishGroup);
    }

    if (otherVoices.length > 0) {
        const otherGroup = document.createElement('optgroup');
        otherGroup.label = 'Other Languages';
        otherVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voices.indexOf(voice);
            option.textContent = `${voice.name} (${voice.lang})`;
            otherGroup.appendChild(option);
        });
        voiceSelect.appendChild(otherGroup);
    }
}

// Load voices on page load and when voices change
loadVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}

// Update slider values
pitchSlider.addEventListener('input', () => {
    pitchValue.textContent = pitchSlider.value;
});

speedSlider.addEventListener('input', () => {
    speedValue.textContent = speedSlider.value;
});

volumeSlider.addEventListener('input', () => {
    volumeValue.textContent = volumeSlider.value;
});

// Speak function
async function speak() {
    const text = textInput.value.trim();

    if (!text) {
        showStatus('Please enter some text to speak', 'error');
        return;
    }

    // Stop any ongoing speech
    synth.cancel();

    // Create utterance
    currentUtterance = new SpeechSynthesisUtterance(text);

    // Set voice
    const selectedVoiceIndex = voiceSelect.value;
    if (selectedVoiceIndex && voices[selectedVoiceIndex]) {
        currentUtterance.voice = voices[selectedVoiceIndex];
    }

    // Set parameters
    currentUtterance.pitch = parseFloat(pitchSlider.value);
    currentUtterance.rate = parseFloat(speedSlider.value);
    currentUtterance.volume = parseFloat(volumeSlider.value);

    // Event handlers
    currentUtterance.onstart = () => {
        showStatus('Speaking...', 'speaking');
        updateButtonStates('speaking');
    };

    currentUtterance.onend = async () => {
        showStatus('Finished speaking', 'speaking');
        updateButtonStates('idle');
        
        // Save to database
        await saveSpeechToDatabase();
    };

    currentUtterance.onerror = (event) => {
        showStatus(`Error: ${event.error}`, 'error');
        updateButtonStates('idle');
    };

    currentUtterance.onpause = () => {
        showStatus('Speech paused', 'speaking');
        updateButtonStates('paused');
    };

    currentUtterance.onresume = () => {
        showStatus('Speech resumed', 'speaking');
        updateButtonStates('speaking');
    };

    // Speak
    synth.speak(currentUtterance);
}

// Save speech to database
async function saveSpeechToDatabase() {
    try {
        const selectedVoiceIndex = voiceSelect.value;
        const voiceName = voices[selectedVoiceIndex] ? voices[selectedVoiceIndex].name : 'Default';
        const languageCode = voices[selectedVoiceIndex] ? voices[selectedVoiceIndex].lang : 'en-US';

        const response = await fetch(`${API_BASE_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: textInput.value.trim(),
                voiceName: voiceName,
                languageCode: languageCode,
                pitch: parseFloat(pitchSlider.value),
                speed: parseFloat(speedSlider.value),
                volume: parseFloat(volumeSlider.value),
                userId: 'anonymous'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            loadHistory();
            loadStatistics();
        }
    } catch (error) {
        console.error('Failed to save speech:', error);
        // Don't show error to user - saving is optional
    }
}

// Load history
async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/history?limit=10`);
        const data = await response.json();

        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');

        if (data.success && data.speeches.length > 0) {
            emptyHistory.style.display = 'none';
            historyList.innerHTML = data.speeches.map(speech => `
                <div style="padding: 12px; margin-bottom: 8px; background: var(--color-secondary); border-radius: 8px; border: 1px solid var(--color-border);">
                    <div style="font-size: 14px; color: var(--color-text); margin-bottom: 8px; line-height: 1.5;">
                        ${escapeHtml(speech.text)}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--color-text-secondary);">
                        <span>${speech.voice_name || speech.voiceName || 'Unknown'}</span>
                        <span>${new Date(speech.created_at || speech.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
        } else {
            emptyHistory.style.display = 'block';
            historyList.innerHTML = '';
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/statistics`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('totalSpeeches').textContent = data.statistics.totalSpeeches;
            document.getElementById('totalCharacters').textContent = data.statistics.totalCharacters;
            document.getElementById('avgLength').textContent = data.statistics.averageLength;
        }
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load data on page load
loadHistory();
loadStatistics();

// Control functions
function pause() {
    if (synth.speaking && !synth.paused) {
        synth.pause();
    }
}

function resume() {
    if (synth.paused) {
        synth.resume();
    }
}

function stop() {
    synth.cancel();
    showStatus('Speech stopped', 'speaking');
    updateButtonStates('idle');
}

// Update button states
function updateButtonStates(state) {
    switch (state) {
        case 'speaking':
            speakBtn.disabled = true;
            pauseBtn.disabled = false;
            resumeBtn.disabled = true;
            stopBtn.disabled = false;
            break;
        case 'paused':
            speakBtn.disabled = true;
            pauseBtn.disabled = true;
            resumeBtn.disabled = false;
            stopBtn.disabled = false;
            break;
        case 'idle':
        default:
            speakBtn.disabled = false;
            pauseBtn.disabled = true;
            resumeBtn.disabled = true;
            stopBtn.disabled = true;
            break;
    }
}

// Show status message
function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status active ' + type;
    
    if (type !== 'error' && type !== 'speaking') {
        setTimeout(() => {
            status.classList.remove('active');
        }, 3000);
    }
}

// Event listeners
speakBtn.addEventListener('click', speak);
pauseBtn.addEventListener('click', pause);
resumeBtn.addEventListener('click', resume);
stopBtn.addEventListener('click', stop);

// Allow Enter key to speak (Ctrl+Enter for new line)
textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        speak();
    }
});
