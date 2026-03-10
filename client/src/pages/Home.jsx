import React, { useState, useCallback } from "react";

const STATES = {
  INITIAL: "initial",
  PROCESSING: "processing",
  READY: "ready",
  ERROR: "error",
};

export default function Home() {
  const [uiState, setUiState] = useState(STATES.INITIAL);
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [format, setFormat] = useState("mp3");
  const [quality, setQuality] = useState("192");

  /* Extract video ID from various YouTube URL formats */
  const extractVideoId = (url) => {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
      /youtu\.be\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  /* Get video info using YouTube oEmbed API (no auth required, bypasses login) */
  const getVideoInfo = async (videoId) => {
    try {
      // YouTube oEmbed API - public, no key needed, bypasses restrictions
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      );

      if (!response.ok) throw new Error("Video not found or private");

      const data = await response.json();
      return {
        id: videoId,
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url,
        iframe: data.html,
      };
    } catch (error) {
      throw new Error("Failed to get video info: " + error.message);
    }
  };

  /* Process URL and get video information */
  const handleProcess = useCallback(async () => {
    if (!url.trim()) return;

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      setUiState(STATES.ERROR);
      alert("Invalid YouTube URL. Please check the link and try again.");
      return;
    }

    setUiState(STATES.PROCESSING);

    try {
      const info = await getVideoInfo(videoId);
      setVideoData(info);
      setUiState(STATES.READY);
    } catch (error) {
      setUiState(STATES.ERROR);
      alert("Error: " + error.message);
    }
  }, [url]);

  /* Handle actual download via API */
  const handleDownload = useCallback(async () => {
    if (!videoData) return;

    try {
      setUiState(STATES.PROCESSING);

      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoData.id}`,
          format,
          quality,
        }),
      });

      const data = await response.json();

      if (data.success && data.downloadUrl) {
        // Create a temporary download link
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.filename || `${videoData.title}.${format}`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setUiState(STATES.READY);
        alert("Download started! Check your downloads folder.");
      } else {
        throw new Error(data.error || "Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      setUiState(STATES.ERROR);

      // Fallback: Show instructions if API fails
      const fallbackInstructions = `
Download failed. Please try these alternatives:

• Visit: yt1s.com, y2mate.com, or savefrom.net
• Paste this URL: https://www.youtube.com/watch?v=${videoData.id}
• Select ${format.toUpperCase()} format with ${quality}${format === "mp3" ? " kbps" : "p"} quality

Video URL copied to clipboard!`;

      navigator.clipboard
        .writeText(`https://www.youtube.com/watch?v=${videoData.id}`)
        .then(() => alert(fallbackInstructions))
        .catch(() =>
          alert(
            fallbackInstructions +
              `\n\nManually copy: https://www.youtube.com/watch?v=${videoData.id}`,
          ),
        );
    }
  }, [videoData, format, quality]);

  const reset = () => {
    setUiState(STATES.INITIAL);
    setUrl("");
    setVideoData(null);
  };

  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="hero">
        <h1>YouTube Converter</h1>
        <p className="hero-subtitle">
          Convert your favorite YouTube videos to MP3 or MP4 format quickly and
          easily. Just paste the URL below and click convert.
        </p>
      </section>

      {/* Converter Card */}
      <div className="container">
        {/* Video Information */}
        {videoData && uiState === STATES.READY && (
          <div className="video-preview">
            {videoData.thumbnail && (
              <img
                src={videoData.thumbnail}
                alt="Thumbnail"
                className="video-thumbnail"
              />
            )}
            <div className="video-preview-info">
              <div className="video-title">{videoData.title}</div>
              <div
                style={{
                  color: "#8a8f9d",
                  fontSize: "0.9rem",
                  marginTop: "4px",
                }}
              >
                by {videoData.author} • ID: {videoData.id}
              </div>
            </div>
          </div>
        )}

        {/* URL Input */}
        {uiState === STATES.INITIAL && (
          <div className="input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleProcess()}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={uiState === STATES.PROCESSING}
            />
            <button
              className="btn-convert"
              disabled={!url.trim() || uiState === STATES.PROCESSING}
              onClick={handleProcess}
            >
              {uiState === STATES.PROCESSING ? "Processing..." : "Get Info"}
            </button>
          </div>
        )}

        {/* Format & Quality Selection */}
        {uiState === STATES.READY && (
          <>
            <div className="format-selector" style={{ marginBottom: "20px" }}>
              <button
                className={`format-btn ${format === "mp3" ? "format-active" : ""}`}
                onClick={() => setFormat("mp3")}
              >
                🎵 MP3 (Audio)
              </button>
              <button
                className={`format-btn ${format === "mp4" ? "format-active" : ""}`}
                onClick={() => setFormat("mp4")}
              >
                🎬 MP4 (Video)
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#b0b3b8",
                  marginBottom: "8px",
                  fontSize: "0.9rem",
                }}
              >
                Quality Settings
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#22252d",
                  color: "#e4e6eb",
                  border: "1px solid #33363e",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              >
                {format === "mp3" ? (
                  <>
                    <option value="320">320 kbps (Highest Quality)</option>
                    <option value="256">256 kbps (High Quality)</option>
                    <option value="192">192 kbps (Standard Quality)</option>
                    <option value="128">128 kbps (Lower Quality)</option>
                  </>
                ) : (
                  <>
                    <option value="1080">1080p (Full HD)</option>
                    <option value="720">720p (HD)</option>
                    <option value="480">480p (Standard)</option>
                    <option value="360">360p (Mobile)</option>
                  </>
                )}
              </select>
            </div>

            <div className="action-buttons joined-buttons">
              <button className="btn-download" onClick={handleDownload}>
                Get Download Instructions (.{format})
              </button>
              <button className="btn-next" onClick={reset}>
                Convert Another
              </button>
            </div>
          </>
        )}
      </div>

      {/* Notice Section */}
      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto 40px auto",
          padding: "20px",
          backgroundColor: "rgba(255, 193, 7, 0.1)",
          border: "1px solid rgba(255, 193, 7, 0.3)",
          borderRadius: "12px",
          color: "#fff3cd",
        }}
      >
        <h3 style={{ marginBottom: "8px", color: "#ffc107" }}>
          Important Notice:
        </h3>
        <p style={{ fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>
          This tool bypasses YouTube login restrictions by using the public
          oEmbed API. For downloads, it provides instructions to use browser
          extensions or desktop software. Please respect copyright laws and
          YouTube's Terms of Service.
        </p>
      </div>
    </div>
  );
}
