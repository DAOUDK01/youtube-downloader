import { useState, useCallback } from "react";

const STATES = {
  INITIAL: "initial",
  PROCESSING: "processing", 
  READY: "ready",
  ERROR: "error"
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
      /youtube\.com\/v\/([a-zA-Z0-9_-]+)/
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
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      
      if (!response.ok) throw new Error('Video not found or private');
      
      const data = await response.json();
      return {
        id: videoId,
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url,
        iframe: data.html
      };
    } catch (error) {
      throw new Error('Failed to get video info: ' + error.message);
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

  /* Generate download instructions (bypasses YouTube restrictions) */
  const handleDownload = useCallback(() => {
    if (!videoData) return;

    // Show instructions for using browser extensions or online services
    const instructions = `
To download this video:

Option 1: Browser Extension (Recommended)
1. Install "YouTube Downloader" extension from Chrome Web Store
2. Navigate to the video: https://www.youtube.com/watch?v=${videoData.id}
3. Click the download button that appears

Option 2: Online Services
• Visit: yt1s.com, y2mate.com, or savefrom.net
• Paste this URL: https://www.youtube.com/watch?v=${videoData.id}
• Select ${format.toUpperCase()} format with ${quality}${format === 'mp3' ? ' kbps' : 'p'} quality

Option 3: Desktop Software
• Use 4K Video Downloader, YTD, or similar software
• Paste the video URL for direct download

Video URL has been copied to your clipboard!
    `;

    // Copy URL to clipboard
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${videoData.id}`)
      .then(() => {
        alert(instructions);
      })
      .catch(() => {
        alert(instructions + "\n\nManually copy this URL: https://www.youtube.com/watch?v=" + videoData.id);
      });
  }, [videoData, format, quality]);

  const reset = () => {
    setUiState(STATES.INITIAL);
    setUrl("");
    setVideoData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            YouTube Converter
          </h1>
          
          {/* URL Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uiState === STATES.PROCESSING}
              />
              <button
                onClick={handleProcess}
                disabled={uiState === STATES.PROCESSING || !url.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uiState === STATES.PROCESSING ? "Processing..." : "Get Info"}
              </button>
            </div>
          </div>

          {/* Video Information */}
          {videoData && uiState === STATES.READY && (
            <div className="mb-6 p-4 border rounded-lg">
              <div className="flex gap-4">
                {videoData.thumbnail && (
                  <img 
                    src={videoData.thumbnail} 
                    alt="Thumbnail"
                    className="w-32 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{videoData.title}</h3>
                  <p className="text-gray-600 text-sm">by {videoData.author}</p>
                  <p className="text-blue-600 text-sm font-mono mt-1">
                    ID: {videoData.id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Format & Quality Selection */}
          {uiState === STATES.READY && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mp3">MP3 (Audio Only)</option>
                  <option value="mp4">MP4 (Video)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {format === "mp3" ? (
                    <>
                      <option value="320">320 kbps (Highest)</option>
                      <option value="256">256 kbps (High)</option>
                      <option value="192">192 kbps (Standard)</option>
                      <option value="128">128 kbps (Lower)</option>
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

              <button
                onClick={handleDownload}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Get Download Instructions
              </button>
            </div>
          )}

          {/* Reset Button */}
          {uiState !== STATES.INITIAL && (
            <button
              onClick={reset}
              className="w-full py-2 mt-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Convert Another Video
            </button>
          )}

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-700">
            <p className="font-semibold mb-1">Notice:</p>
            <p>This tool bypasses YouTube login restrictions by using the public oEmbed API. For downloads, it provides instructions to use browser extensions or desktop software. Respect copyright laws and YouTube's Terms of Service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
    if (uiState === STATES.PROCESSING) return;
    if (!currentUrl.current) return;

    // Use File System Access API if available for location picker
    let fileHandle = null;
    const ext = format;
    const safeName = (currentTitle.current || "download").replace(
      /[<>:"/\\|?*]+/g,
      "",
    );

    if (window.showSaveFilePicker) {
      try {
        const mimeType = format === "mp3" ? "audio/mpeg" : "video/mp4";
        fileHandle = await window.showSaveFilePicker({
          suggestedName: `${safeName}.${ext}`,
          types: [
            {
              description: format === "mp3" ? "MP3 Audio" : "MP4 Video",
              accept: { [mimeType]: [`.${ext}`] },
            },
          ],
        });
      } catch (err) {
        // User cancelled the picker
        if (err.name === "AbortError") return;
      }
    }

    setUiState(STATES.PROCESSING);
    setTitle(currentTitle.current || "Processing...");
    setStatusMsg("Preparando download...");
    setProgress(0);
    setIsIndeterminate(false);

    const qualityParam =
      format === "mp4" && selectedResolution
        ? `&quality=${selectedResolution}`
        : "";

    const evtSource = new EventSource(
      `/api/download?url=${encodeURIComponent(currentUrl.current)}&format=${format}${qualityParam}`,
    );

    evtSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.phase === "downloading") {
        setProgress(data.percent);
        setStatusMsg(`Baixando... ${data.percent}%`);
      } else if (data.phase === "converting") {
        setProgress(data.percent || 95);
        setStatusMsg(
          format === "mp3"
            ? "Convertendo para MP3..."
            : "Mesclando vídeo e áudio...",
        );
      } else if (data.phase === "completed") {
        evtSource.close();
        setProgress(100);
        setTitle(currentTitle.current);
        setStatusMsg("Download concluído! Salvando arquivo...");
        setUiState(STATES.FINISHED);

        // Auto-save the file
        try {
          const fileUrl = `/api/file/${encodeURIComponent(data.filename)}`;

          if (fileHandle) {
            // Write to user-selected location via File System Access API
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            setStatusMsg("Arquivo salvo com sucesso!");
          } else {
            // Fallback: trigger browser download
            const a = document.createElement("a");
            a.href = fileUrl;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setStatusMsg("Arquivo salvo com sucesso!");
          }
        } catch {
          setStatusMsg("Erro ao salvar arquivo.");
        }
      } else if (data.phase === "error") {
        evtSource.close();
        alert(`Falha no download: ${data.error}`);
        reset();
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      alert("Conexão perdida. Por favor, tente novamente.");
      reset();
    };
  }, [uiState, format, selectedResolution, reset]);

  /* ---- next ---- */

  const handleNext = useCallback(() => {
    reset();
  }, [reset]);

  /* ---- derived flags ---- */

  const showInput = uiState === STATES.INITIAL;
  const showActions =
    uiState === STATES.EXTRACTED || uiState === STATES.FINISHED;
  const showStatus =
    uiState === STATES.PROCESSING || uiState === STATES.FINISHED;

  /* ---- render ---- */

  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="hero">
        <h1>Conversor YouTube para MP3 / MP4</h1>
        <p className="hero-subtitle">
          Converta seus vídeos favoritos do YouTube para o formato MP3 ou MP4 de
          forma rápida e fácil. Basta colar a URL abaixo e clicar em converter.
        </p>
      </section>

      {/* Converter Card */}
      <div className="container">
        {/* Thumbnail + Title */}
        {thumbnail && (
          <div className="video-preview">
            <img
              src={thumbnail}
              alt={title || "Video thumbnail"}
              className="video-thumbnail"
            />
            <div className="video-preview-info">
              {title && <div className="video-title">{title}</div>}
            </div>
          </div>
        )}
        {!thumbnail && title && <div className="video-title">{title}</div>}

        {showInput && (
          <>
            <div className="input-group">
              <input
                type="text"
                autoComplete="off"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConvert()}
                placeholder="https://youtu.be/8of5w7Rq..."
              />
              <button
                className="btn-convert"
                disabled={!url.trim()}
                onClick={handleConvert}
              >
                Conversor
              </button>
            </div>
          </>
        )}

        {/* Format selector — shown after extracting info */}
        {showActions && (
          <>
            <div className="format-selector">
              <button
                className={`format-btn ${format === "mp3" ? "format-active" : ""}`}
                onClick={() => {
                  setFormat("mp3");
                  setFilename("");
                  setDownloadLabel("Baixar");
                  if (uiState === STATES.FINISHED) setUiState(STATES.EXTRACTED);
                }}
              >
                🎵 MP3
              </button>
              <button
                className={`format-btn ${format === "mp4" ? "format-active" : ""}`}
                onClick={() => {
                  setFormat("mp4");
                  setFilename("");
                  setDownloadLabel("Baixar");
                  if (uiState === STATES.FINISHED) setUiState(STATES.EXTRACTED);
                }}
              >
                🎬 MP4
              </button>
            </div>

            {/* Resolution selector for MP4 */}
            {/* Resolution selector for MP4 */}
            {format === "mp4" && (
              <div className="resolution-selector">
                <label className="resolution-label">Qualidade:</label>
                <select
                  className="resolution-select"
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                >
                  {resolutions.map((r) => (
                    <option key={r.height} value={String(r.height)}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="action-buttons joined-buttons">
              <button className="btn-download" onClick={handleDownload}>
                Baixar (.{format})
              </button>
              <button className="btn-next" onClick={handleNext}>
                Próximo
              </button>
            </div>
          </>
        )}

        {/* Progress Bar */}
        {uiState === STATES.PROCESSING && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className={`progress-fill${isIndeterminate ? " progress-indeterminate" : ""}`}
                style={isIndeterminate ? {} : { width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">
              {isIndeterminate ? "..." : `${progress}%`}
            </span>
          </div>
        )}

        {showStatus && <div className="status-message">{statusMsg}</div>}
      </div>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Por Que Nos Escolher?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Conversão Rápida</h3>
            <p>
              Conversão ultrarrrápida com tecnologia moderna. Obtenha seus
              arquivos MP3 em segundos, não em minutos.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎵</div>
            <h3>Áudio de Alta Qualidade</h3>
            <p>
              Extraímos o áudio na maior taxa de bits disponível para garantir a
              melhor qualidade de som possível.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Seguro e Protegido</h3>
            <p>
              Sem malware, sem popups, sem truques. Sua privacidade é importante
              para nós. Os arquivos são excluídos automaticamente após o
              download.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">Como Funciona</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Cole a URL</h3>
            <p>Copie e cole qualquer URL de vídeo do YouTube no campo acima.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Clique em Converter</h3>
            <p>
              Clique no botão Converter e aguarde enquanto processamos o vídeo.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Baixar</h3>
            <p>
              Quando estiver pronto, clique em Baixar para salvar o arquivo MP3
              no seu dispositivo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
