# 🧠 Overthinker Simulator

Welcome to the **Overthinker Simulator**—a web-based group chat experience designed to help you break out of anxious thought loops. Instead of spiraling alone, tell the group what's on your mind. You'll instantly get three distinct perspectives from your "closest friends," followed by a grounded conclusion and actionable steps.

## ✨ Features
- **Dynamic Group Chat UI**: Sleek, modern dark-mode interface that simulates a real group chat.
- **Three Distinct Personas**:
  - 😬 *Worst-Case Thinker*: Highlights the (realistic) negative interpretation.
  - 😐 *Realistic Thinker*: Grounds the situation using logic and actual evidence.
  - 😎 *Chill Friend*: Reassures you casually, like a true best friend.
- **Intelligent Context Memory**: The "friends" remember what you said earlier in the session, allowing for natural back-and-forth conversations until you refresh the page.
- **Language Matching**: Whether you speak in English, Tagalog, or Taglish, the friends match your language and tone exactly.
- **Fallback API System**: Tries to use a pre-installed system API key first. If it's expired or out of quota, it gracefully asks you to provide your own.

## 📖 User Manual
1. **Open the App**: You'll be greeted by an empty group chat.
2. **Type your Worry**: Input whatever you are overthinking right now (e.g., *"Did I mess up my presentation today?"*).
3. **Watch them Type**: The app simulates realistic typing and reading delays for each friend, delivering their thoughts sequentially.
4. **Read the Verdict**: After all three friends have chimed in, the 🤖 **Group Admin** provides a balanced conclusion, 1-3 next actionable steps, and a "Loop Breaker" (a direct instruction to help you mentally disengage).
5. **Keep Chatting**: You can reply to their thoughts to continue the conversation in context. 
6. **Reset**: Simply refresh your browser page to start a brand new session.

## 🚀 How to Run Locally

This project is built using pure **Vanilla HTML, CSS, and JavaScript**. There is no build step required!

### Prerequisites
- A modern web browser.
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey) (if the default system key is expired).

### Running the Code
Since it doesn't require a complex Node.js environment or framework, running it is incredibly simple:

**Method 1: Direct File Access**
1. Download or clone this repository to your local machine.
2. Navigate into the folder.
3. Double-click the `index.html` file to open it directly in your web browser.

**Method 2: Local HTTP Server (Recommended)**
If you want to run it via a local server:
1. Open your terminal and navigate to the project directory.
2. Run a simple Python HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open your browser and go to: `http://localhost:8080`

## ⚙️ Configuration (API Key)
If you are prompted for an API Key, or if you wish to change it manually:
1. Click the **Settings Gear (⚙️)** in the top right corner of the chat header.
2. Paste your Gemini API Key.
3. Click **Save & Start**. The app will verify your key automatically. *(Note: Your key is saved locally in your browser and never sent anywhere except directly to Google's API.)*

---
*Built with Vanilla JS and the Gemini 2.5 Flash API.*
