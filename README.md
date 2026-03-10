# YouTube to MP3 Converter — Web App

A lightweight web application that downloads YouTube videos and converts them to high-quality MP3 audio files. Runs as a local Node.js server you can open in any browser.

## Features

- **Browser-based UI** — no Electron or desktop install needed
- **High Quality Audio** — downloads best available audio, converts to 320 kbps MP3
- **Real-time Progress** — live download & conversion progress via Server-Sent Events
- **Clean Modern UI** — responsive design that works on desktop and mobile
- **No Ads** — completely ad-free

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Frontend   | React 19 + Vite          |
| Server     | Node.js + Express        |
| Downloader | yt-dlp (must be in PATH) |

## Requirements

- **Node.js** v16+
- **yt-dlp** installed and available in your system PATH

## Quick Start

```bash
# 1. Install yt-dlp (if not already installed)
# Windows
winget install yt-dlp

# macOS
brew install yt-dlp

# Linux
sudo apt install yt-dlp   # or pip install yt-dlp

# 2. Clone / download this project, then:
cd converter
npm install

# 3. Start (builds React then starts Express)
npm start
```

Open **http://localhost:3000** in your browser.

For development with hot-reload, run `npm run dev` (Vite dev server on port 5173 with API proxy to :3000).

## How It Works

1. Paste a YouTube URL and click **Convert**.
2. The server fetches the video title via `yt-dlp`.
3. Click **Download** — the server streams progress back to the browser while `yt-dlp` downloads and converts the audio.
4. When finished, click **Save File** to download the MP3 to your computer.

## Project Structure

```
├── server.js              # Express API + serves built React app
├── vite.config.js         # Vite configuration
├── client/
│   ├── index.html         # HTML entry point
│   └── src/
│       ├── main.jsx       # React entry
│       ├── App.jsx        # Main component (all UI logic)
│       └── style.css      # Styles
├── dist/                  # Production build output (git-ignored)
├── package.json
└── README.md
```

## API Endpoints

| Method | Path                    | Description                    |
| ------ | ----------------------- | ------------------------------ |
| POST   | `/api/validate-url`     | Validate a YouTube URL         |
| POST   | `/api/get-title`        | Get the video title            |
| GET    | `/api/download?url=...` | SSE stream: download + convert |
| GET    | `/api/file/:filename`   | Serve the converted MP3        |

## License

MIT

MIT License - Feel free to use and modify as needed.

## 🎉 Enjoy!

You now have a fully functional, offline YouTube to MP3 converter running on your desktop!
