import { useState, useRef, useCallback } from "react";

const STATES = {
  INITIAL: "initial",
  PROCESSING: "processing",
  EXTRACTED: "extracted",
  FINISHED: "finished",
};

export default function Home() {
  const [uiState, setUiState] = useState(STATES.INITIAL);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [format, setFormat] = useState("mp3");
  const [statusMsg, setStatusMsg] = useState("");
  const [downloadLabel, setDownloadLabel] = useState("Baixar");
  const [filename, setFilename] = useState("");
  const [progress, setProgress] = useState(0);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState("1080");

  // Standard MP4 resolutions (no slow network fetch needed)
  const resolutions = [
    { label: "2160p (4K)", height: 2160 },
    { label: "1440p (2K)", height: 1440 },
    { label: "1080p (Full HD)", height: 1080 },
    { label: "720p (HD)", height: 720 },
    { label: "480p", height: 480 },
    { label: "360p", height: 360 },
  ];

  const currentUrl = useRef("");
  const currentTitle = useRef("");

  /* ---- helpers ---- */

  const reset = useCallback(() => {
    setUiState(STATES.INITIAL);
    setUrl("");
    setTitle("");
    setThumbnail("");
    setStatusMsg("");
    setDownloadLabel("Baixar");
    setFilename("");
    setProgress(0);
    setIsIndeterminate(false);
    setSelectedResolution("1080");
    currentUrl.current = "";
    currentTitle.current = "";
  }, []);

  /* ---- convert ---- */

  const handleConvert = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || uiState === STATES.PROCESSING) return;

    // Quick client-side validation (no network call needed)
    const ytRegex =
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    if (!ytRegex.test(trimmed)) {
      alert("URL do YouTube inválida");
      return;
    }

    currentUrl.current = trimmed;
    setUiState(STATES.PROCESSING);
    setTitle("");
    setThumbnail("");
    setProgress(0);
    setIsIndeterminate(true);
    setStatusMsg("Buscando informações do vídeo...");

    try {
      const resp = await fetch("/api/get-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      currentTitle.current = data.title;
      setTitle(data.title);
      setThumbnail(data.thumbnail || "");
      setDownloadLabel("Baixar");
      setFilename("");
      setIsIndeterminate(false);
      setProgress(0);
      setUiState(STATES.EXTRACTED);
    } catch (error) {
      alert(`Erro: ${error.message}`);
      reset();
    }
  }, [url, uiState, reset]);

  /* ---- download ---- */

  const handleDownload = useCallback(async () => {
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
