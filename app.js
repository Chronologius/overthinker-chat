const apiModal = document.getElementById('api-modal');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key');
const settingsBtn = document.getElementById('settings-btn');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const typingName = document.getElementById('typing-name');
const modalMessage = document.getElementById('modal-message');

// The default system API key provided by the developer.
// If this runs out of tokens, it will fallback to asking the user for their key.
const SYSTEM_API_KEY = "AIzaSyCTn824CUgeRmOrZonr-j_tacKeSgLTX1g"; 
let userApiKey = localStorage.getItem('gemini_api_key');
let activeApiKey = null;

async function testAPIKey(key) {
    if (!key) return false;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: "ping" }] }]
            })
        });
        return response.ok;
    } catch (e) {
        return false;
    }
}

async function initializeApp() {
    userInput.disabled = true;
    sendBtn.disabled = true;
    userInput.placeholder = "Testing system connection...";

    const systemOk = await testAPIKey(SYSTEM_API_KEY);
    if (systemOk) {
        activeApiKey = SYSTEM_API_KEY;
        enableChat();
    } else {
        // System API failed, check user API
        if (userApiKey) {
            const userOk = await testAPIKey(userApiKey);
            if (userOk) {
                activeApiKey = userApiKey;
                enableChat();
                return;
            }
        }
        // Both failed or no user key
        showModal("The system API ran out of tokens. Please use yours.");
    }
}

function enableChat() {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.placeholder = "Type your worry here...";
    userInput.focus();
}

function showModal(msg) {
    modalMessage.textContent = msg || "Please enter your Gemini API Key to continue.";
    apiModal.classList.remove('hidden');
}

saveApiKeyBtn.addEventListener('click', async () => {
    const val = apiKeyInput.value.trim();
    if (val) {
        saveApiKeyBtn.disabled = true;
        saveApiKeyBtn.textContent = "Testing...";
        
        const ok = await testAPIKey(val);
        
        saveApiKeyBtn.disabled = false;
        saveApiKeyBtn.textContent = "Save & Start";
        
        if (ok) {
            userApiKey = val;
            activeApiKey = val;
            localStorage.setItem('gemini_api_key', val);
            apiModal.classList.add('hidden');
            enableChat();
        } else {
            alert("This API Key appears to be invalid or expired. Please check and try again.");
        }
    } else {
        alert("Please enter a valid API Key.");
    }
});

settingsBtn.addEventListener('click', () => {
    apiKeyInput.value = userApiKey || '';
    showModal("Update your Gemini API Key:");
});

const SYSTEM_PROMPT = `You are the "Overthinker Simulator", an AI designed to help users break out of overthinking loops by simulating a group chat with their closest friends.

CRITICAL RULES FOR TONE AND LANGUAGE:
1. MATCH THE USER'S LANGUAGE EXACTLY: If they speak in Tagalog, reply in Tagalog. If English, reply in English. If Taglish, reply in Taglish.
2. BE EXTREMELY CASUAL: Talk like you are best friends for life. Use slang, casual expressions, and a very conversational, friendly tone. Do NOT sound formal, academic, or like a therapist.
3. Be concise but insightful. Avoid generic advice.
4. Do NOT exaggerate excessively or validate irrational fears as facts.
5. Each perspective must have its own distinct personality.

OUTPUT FORMAT MUST BE A STRICT VALID JSON OBJECT WITH THE FOLLOWING SCHEMA:
{
  "worst_case": "Your anxious friend's perspective. 1-2 realistic worst-case outcomes. Extremely casual tone matching user's language. (String)",
  "realistic": "Your grounded friend's perspective. Analyzes using evidence. Realistic but still very conversational like a best friend. (String)",
  "chill": "Your chill friend's perspective. Reassuring, laid back, casual, slightly humorous but not dismissive. (String)",
  "conclusion": "The group's final verdict. Combines perspectives to state what actually happened. Still very casual. (String)",
  "next_action": ["Action 1", "Action 2"], // Array of strings, 1-3 specific actions to take. Casual tone.
  "loop_breaker": "A direct, friendly instruction to stop them from overthinking (e.g. 'Bro, put the phone down and sleep.'). (String)"
}

Ensure the response is ONLY raw JSON. Do not wrap it in markdown block quotes. Just the raw JSON format so it can be parsed directly.`;

let conversationHistory = [];

async function callGeminiAPI(userText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeApiKey}`;
    
    let messageText = userText;
    if (conversationHistory.length === 0) {
        messageText = SYSTEM_PROMPT + "\n\nUser Worry: " + userText;
    } else {
        messageText = "User Update: " + userText;
    }
    
    conversationHistory.push({
        role: "user",
        parts: [{ text: messageText }]
    });

    const payload = {
        contents: conversationHistory,
        generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
        }
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        conversationHistory.pop();
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    conversationHistory.push({
        role: "model",
        parts: [{ text: responseText }]
    });
    
    return responseText;
}

function appendMessage(role, name, content, avatarClass, avatarIcon) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    
    let html = '';
    
    if (role === 'friend') {
        html += `<div class="avatar ${avatarClass}">${avatarIcon}</div>`;
        html += `<div class="msg-content">
                    <div class="msg-name">${name}</div>
                    <div class="bubble markdown-content">${marked.parse(content)}</div>
                 </div>`;
    } else if (role === 'user') {
        html += `<div class="bubble">${content}</div>`;
    } else if (role === 'system') {
        html += `<div class="bubble markdown-content">${marked.parse(content)}</div>`;
    }
    
    div.innerHTML = html;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping(name) {
    typingName.textContent = name;
    typingIndicator.classList.remove('hidden');
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    typingIndicator.classList.add('hidden');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateFriendMessage(name, icon, avatarClass, content, readDelay, typeDelay) {
    await sleep(readDelay);
    showTyping(name);
    await sleep(typeDelay);
    hideTyping();
    appendMessage('friend', name, content, avatarClass, icon);
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;
    
    if (!activeApiKey) {
        showModal("Please enter your API key to continue.");
        return;
    }
    
    userInput.disabled = true;
    sendBtn.disabled = true;
    
    appendMessage('user', '', text, '');
    userInput.value = '';
    
    try {
        showTyping('Worst-Case Thinker');
        
        const responseText = await callGeminiAPI(text);
        
        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON:", e, responseText);
            throw new Error("Failed to parse API response");
        }

        hideTyping();

        await simulateFriendMessage('Worst-Case Thinker', '😬', 'bg-red', parsed.worst_case, 500, 1500);
        await simulateFriendMessage('Realistic Thinker', '😐', 'bg-gray', parsed.realistic, 1500, 2500);
        await simulateFriendMessage('Chill Friend', '😎', 'bg-green', parsed.chill, 1000, 2000);
        
        const systemText = `**⚖️ Balanced Conclusion**\n${parsed.conclusion}\n\n**✅ Next Actions**\n${parsed.next_action.map(a => '- ' + a).join('\n')}\n\n**⛔ Loop Breaker**\n${parsed.loop_breaker}`;
        
        await simulateFriendMessage('Group Admin', '🤖', 'bg-sys', systemText, 2000, 2000);
        
    } catch (error) {
        hideTyping();
        console.error(error);
        appendMessage('system', '', `**Error:** Failed to get response. Please check your API key or network connection.`, '');
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Start testing sequence on load
initializeApp();
