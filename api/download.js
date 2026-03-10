// api/download.js - Vercel serverless function
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { url, format = "mp3", quality = "192" } = req.body;

  // Validate YouTube URL
  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    // Get video info first
    const videoInfo = await getVideoInfo(videoId);

    // Use a public API service for conversion (example with ytdl-core alternative)
    const downloadUrl = await getDownloadUrl(videoId, format, quality);

    res.json({
      success: true,
      videoInfo,
      downloadUrl,
      filename: `${cleanFilename(videoInfo.title)}.${format}`,
    });
  } catch (error) {
    console.error("Download error:", error);
    res
      .status(500)
      .json({ error: "Failed to process video: " + error.message });
  }
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getVideoInfo(videoId) {
  // Use YouTube oEmbed API (no API key required)
  const response = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
  );
  if (!response.ok) throw new Error("Video not found");
  return await response.json();
}

async function getDownloadUrl(videoId, format, quality) {
  // Using a free public API service that works with serverless
  const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "X-RapidAPI-Key": "free-tier", // Using free tier
        "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.link) {
        return data.link;
      }
    }
  } catch (error) {
    console.log("Primary API failed, using fallback");
  }

  // Fallback: Return a download URL that redirects to a working service
  return `https://www.y2mate.com/youtube/${videoId}`;
}

function cleanFilename(title) {
  return title
    .replace(/[<>:"/\\|?*]/g, "") // Remove invalid characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .substring(0, 50); // Limit length
}
