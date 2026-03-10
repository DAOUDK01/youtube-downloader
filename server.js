const express = require("express");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

/* -------------------- HELPERS -------------------- */

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]+/g, "").trim();
}

function normalizeYoutubeUrl(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? `https://www.youtube.com/watch?v=${match[1]}` : null;
}

function getDownloadsDir() {
  const dir = path.join(os.tmpdir(), "yt-mp3-downloads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/* -------------------- API ROUTES -------------------- */

// Validate URL
app.post("/api/validate-url", (req, res) => {
  const { url } = req.body;
  res.json({ valid: !!normalizeYoutubeUrl(url) });
});

// Get video title and thumbnail
app.post("/api/get-title", (req, res) => {
  const { url } = req.body;
  const cleanUrl = normalizeYoutubeUrl(url);
  if (!cleanUrl) return res.status(400).json({ error: "Invalid YouTube URL" });

  const child = spawn(
    "yt-dlp",
    [
      "--get-title",
      "--get-thumbnail",
      "--no-playlist",
      "--no-warnings",
      "--flat-playlist",
      "--socket-timeout",
      "10",
      "--no-check-certificates",
      cleanUrl,
    ],
    {
      windowsHide: true,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    },
  );

  let output = "";
  let errorData = "";

  child.stdout.on("data", (d) => (output += d.toString()));
  child.stderr.on("data", (d) => (errorData += d.toString()));

  child.on("error", () =>
    res
      .status(500)
      .json({ error: "yt-dlp not found. Make sure it is installed." }),
  );

  child.on("close", (code) => {
    if (code !== 0) {
      return res
        .status(500)
        .json({ error: errorData || "Failed to get video title" });
    }
    const lines = output.trim().split("\n");
    const title = lines[0] || "";
    const thumbnail = lines[1] || "";
    res.json({ title, thumbnail });
  });
});

// Get available video formats/resolutions
app.post("/api/get-formats", (req, res) => {
  const { url } = req.body;
  const cleanUrl = normalizeYoutubeUrl(url);
  if (!cleanUrl) return res.status(400).json({ error: "Invalid YouTube URL" });

  const child = spawn("yt-dlp", ["-F", "--no-playlist", cleanUrl], {
    windowsHide: true,
  });

  let output = "";
  let errorData = "";

  child.stdout.on("data", (d) => (output += d.toString()));
  child.stderr.on("data", (d) => (errorData += d.toString()));

  child.on("error", () => res.status(500).json({ error: "yt-dlp not found" }));

  child.on("close", (code) => {
    if (code !== 0) {
      return res
        .status(500)
        .json({ error: errorData || "Failed to get formats" });
    }

    const lines = output.trim().split("\n");
    const resolutions = new Map();

    for (const line of lines) {
      // Match lines like: 137  mp4  1920x1080  ...
      const match = line.match(/^(\S+)\s+mp4\s+(\d+)x(\d+)/);
      if (match) {
        const height = parseInt(match[3]);
        const label = `${height}p`;
        if (
          !resolutions.has(label) ||
          match[1].length < resolutions.get(label).id.length
        ) {
          resolutions.set(label, { label, height, id: match[1] });
        }
      }
    }

    // Also check for common resolutions in format like "1080p"
    for (const line of lines) {
      const match2 = line.match(/^(\S+)\s+\S+\s+.*?(\d{3,4})p/);
      if (match2) {
        const height = parseInt(match2[2]);
        const label = `${height}p`;
        if (!resolutions.has(label)) {
          resolutions.set(label, { label, height, id: match2[1] });
        }
      }
    }

    let formats = Array.from(resolutions.values()).sort(
      (a, b) => b.height - a.height,
    );

    // If no formats found, provide defaults
    if (formats.length === 0) {
      formats = [
        { label: "1080p", height: 1080 },
        { label: "720p", height: 720 },
        { label: "480p", height: 480 },
        { label: "360p", height: 360 },
      ];
    }

    res.json({ formats });
  });
});

// Download MP3 or MP4 — streams progress via SSE then sends the file
app.get("/api/download", (req, res) => {
  const { url, format, quality } = req.query;
  const cleanUrl = normalizeYoutubeUrl(url);
  if (!cleanUrl) return res.status(400).json({ error: "Invalid YouTube URL" });

  const outputFormat = format === "mp4" ? "mp4" : "mp3";

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Disable Nagle's algorithm so SSE chunks are sent immediately
  if (res.socket) res.socket.setNoDelay(true);

  // Send an initial progress event so the client knows streaming has started
  res.write(
    `data: ${JSON.stringify({ phase: "downloading", percent: 0 })}\n\n`,
  );

  const outputDir = getDownloadsDir();
  const outputTemplate = path.join(outputDir, "%(title)s.%(ext)s");

  // Clean up any leftover .part files from interrupted downloads
  try {
    const partFiles = fs
      .readdirSync(outputDir)
      .filter((f) => f.endsWith(".part"));
    for (const f of partFiles) {
      fs.unlinkSync(path.join(outputDir, f));
    }
  } catch {
    /* ignore cleanup errors */
  }

  let args;
  if (outputFormat === "mp3") {
    args = [
      cleanUrl,
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--newline",
      "--progress",
      "--force-overwrites",
      "--no-playlist",
      "--no-warnings",
      "-o",
      outputTemplate,
    ];
  } else {
    // MP4 download — use selected resolution or best
    // Do NOT restrict to ext=mp4 — many high-res streams are webm/vp9.
    // --merge-output-format mp4 handles the final container.
    const height = quality ? parseInt(quality) : null;
    let formatStr;
    if (height) {
      formatStr = `bestvideo[height<=${height}]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`;
    } else {
      formatStr = "bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best";
    }
    args = [
      cleanUrl,
      "-f",
      formatStr,
      "--merge-output-format",
      "mp4",
      "--postprocessor-args",
      "ffmpeg:-c:v copy -c:a aac",
      "--newline",
      "--progress",
      "--concurrent-fragments",
      "4",
      "--force-overwrites",
      "--no-playlist",
      "--no-warnings",
      "-o",
      outputTemplate,
    ];
  }

  const child = spawn("yt-dlp", args, {
    windowsHide: true,
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });

  let stderrData = "";

  // --- Multi-stream progress tracking ---
  // For MP4, yt-dlp downloads video (pass 1) and audio (pass 2) separately,
  // each reporting 0-100%. We weight them so the overall bar progresses smoothly:
  //   MP4:  video 0-70%  |  audio 70-95%  |  merge 95-100%
  //   MP3:  download 0-90%  |  convert 90-100%
  let downloadPass = 0;
  let lastRawPercent = -1;
  let lastSentPercent = 0; // monotonic — never decreases
  let isMerging = false;

  const computeOverall = (rawPercent) => {
    if (outputFormat === "mp4") {
      if (downloadPass <= 1) {
        // First stream (video) → maps to 0-70%
        return Math.floor(rawPercent * 0.7);
      } else {
        // Second stream (audio) → maps to 70-95%
        return Math.floor(70 + rawPercent * 0.25);
      }
    } else {
      // MP3: single download → maps to 0-90%
      return Math.floor(rawPercent * 0.9);
    }
  };

  const processOutput = (text) => {
    // Split by any line ending: \r\n, \n, or bare \r
    const lines = text.split(/\r\n|\r|\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      console.log("[yt-dlp]", trimmed);

      // Detect new download stream starting (progress resets)
      if (
        trimmed.includes("[download] Destination:") ||
        trimmed.includes("[download] Downloading item")
      ) {
        downloadPass++;
        lastRawPercent = -1;
        continue;
      }

      // Parse percent from yt-dlp output (matches both default and
      // --progress-template output, e.g. "[download]  45.2%" or " 45.2%")
      const pctMatch = trimmed.match(/(\d+(?:\.\d+)?)%/);

      if (pctMatch) {
        const raw = Math.min(100, parseFloat(pctMatch[1]));

        // Detect progress reset (new stream started without a Destination line)
        if (raw < lastRawPercent - 5 && lastRawPercent > 50) {
          downloadPass++;
        }

        lastRawPercent = raw;
        if (downloadPass === 0) downloadPass = 1;

        const overall = computeOverall(raw);

        // Progress must only go forward (monotonic)
        if (overall > lastSentPercent) {
          lastSentPercent = overall;

          res.write(
            `data: ${JSON.stringify({
              phase: "downloading",
              percent: overall,
            })}\n\n`,
          );
        }
      }

      if (
        !isMerging &&
        (trimmed.includes("[ExtractAudio]") ||
          trimmed.includes("Deleting original file") ||
          trimmed.includes("[Merger]") ||
          trimmed.includes("Merging formats"))
      ) {
        isMerging = true;
        const convertPercent = outputFormat === "mp4" ? 95 : 90;
        res.write(
          `data: ${JSON.stringify({ phase: "converting", percent: convertPercent })}\n\n`,
        );
      }
    }
  };

  child.stdout.on("data", (data) => processOutput(data.toString()));
  child.stderr.on("data", (d) => {
    const text = d.toString();
    stderrData += text;
    // yt-dlp sometimes outputs progress to stderr
    processOutput(text);
  });

  child.on("error", () => {
    res.write(
      `data: ${JSON.stringify({ phase: "error", error: "yt-dlp not found" })}\n\n`,
    );
    res.end();
  });

  child.on("close", (code) => {
    if (code !== 0) {
      res.write(
        `data: ${JSON.stringify({ phase: "error", error: stderrData || "Download failed" })}\n\n`,
      );
      res.end();
      return;
    }

    // Find the most recently created file with the right extension
    const files = fs
      .readdirSync(outputDir)
      .filter((f) => f.endsWith(`.${outputFormat}`));
    const latest = files
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(outputDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time)[0];

    if (latest) {
      res.write(
        `data: ${JSON.stringify({ phase: "completed", filename: latest.name })}\n\n`,
      );
    } else {
      res.write(
        `data: ${JSON.stringify({ phase: "error", error: "File not found after conversion" })}\n\n`,
      );
    }
    res.end();
  });
});

// Serve a downloaded file
app.get("/api/file/:filename", (req, res) => {
  const filePath = path.join(getDownloadsDir(), req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.download(filePath);
});

// SPA fallback — serve React index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/* -------------------- START -------------------- */

app.listen(PORT, () => {
  console.log(`YouTube MP3 Converter running at http://localhost:${PORT}`);
});
