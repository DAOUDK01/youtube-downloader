const youtubeUrlInput = document.getElementById("youtube-url");
const convertBtn = document.getElementById("convert-btn");
const statusMessage = document.getElementById("status-message");
const actionButtons = document.getElementById("action-buttons");
const downloadBtn = document.getElementById("download-btn");
const nextBtn = document.getElementById("next-btn");
const titleEl = document.getElementById("title");
const inputGroup = document.querySelector(".input-group");

let isProcessing = false;
let lastDownloadedTitle = "";
let lastDownloadedFilename = "";

function showStatus(message) {
  statusMessage.textContent = message;
}

function setUIState(state, data = {}) {
  statusMessage.classList.add("hidden");
  actionButtons.classList.add("hidden");
  inputGroup.style.display = "none";

  if (state === "initial") {
    titleEl.textContent = "Enter a YouTube video URL";
    inputGroup.style.display = "flex";
    youtubeUrlInput.value = "";
    convertBtn.disabled = true;
    isProcessing = false;
    downloadBtn.textContent = "Download";
  } else if (state === "extracted") {
    isProcessing = false;
    titleEl.textContent = data.title;
    actionButtons.classList.remove("hidden");
    lastDownloadedTitle = data.title;
    downloadBtn.textContent = "Download";
  } else if (state === "processing") {
    isProcessing = true;
    titleEl.textContent = data.title || "Processing...";
    statusMessage.classList.remove("hidden");
    showStatus(data.message);
  } else if (state === "finished") {
    isProcessing = false;
    titleEl.textContent = data.title;
    actionButtons.classList.remove("hidden");
    lastDownloadedFilename = data.filename;
    downloadBtn.textContent = "Save File";
    statusMessage.classList.remove("hidden");
    showStatus("Conversion complete! Click 'Save File' to download.");
  }
}

function validateUrl() {
  const url = youtubeUrlInput.value.trim();
  convertBtn.disabled = !url;
}

let currentUrl = "";

youtubeUrlInput.addEventListener("input", validateUrl);

convertBtn.addEventListener("click", async () => {
  const url = youtubeUrlInput.value.trim();
  if (!url || isProcessing) return;

  try {
    const valRes = await fetch("/api/validate-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const valData = await valRes.json();
    if (!valData.valid) {
      alert("Invalid YouTube URL");
      return;
    }
  } catch {
    alert("Could not validate URL");
    return;
  }

  currentUrl = url;
  setUIState("processing", { message: "Fetching video info..." });

  try {
    const resp = await fetch("/api/get-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error);
    setUIState("extracted", { title: data.title });
  } catch (error) {
    alert(`Error: ${error.message}`);
    setUIState("initial");
  }
});

downloadBtn.addEventListener("click", async () => {
  if (isProcessing) return;

  // If already converted, trigger browser file save
  if (lastDownloadedFilename) {
    const a = document.createElement("a");
    a.href = `/api/file/${encodeURIComponent(lastDownloadedFilename)}`;
    a.download = lastDownloadedFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  if (!currentUrl) return;

  setUIState("processing", {
    title: lastDownloadedTitle,
    message: "Preparing download...",
  });

  try {
    const evtSource = new EventSource(
      `/api/download?url=${encodeURIComponent(currentUrl)}`,
    );

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.phase === "downloading") {
        setUIState("processing", {
          title: lastDownloadedTitle,
          message: `Downloading... ${data.percent}%`,
        });
      } else if (data.phase === "converting") {
        setUIState("processing", {
          title: lastDownloadedTitle,
          message: "Converting to MP3...",
        });
      } else if (data.phase === "completed") {
        evtSource.close();
        setUIState("finished", {
          title: lastDownloadedTitle,
          filename: data.filename,
        });
      } else if (data.phase === "error") {
        evtSource.close();
        alert(`Download failed: ${data.error}`);
        setUIState("initial");
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      alert("Connection lost. Please try again.");
      setUIState("initial");
    };
  } catch (error) {
    alert(`Download failed: ${error.message}`);
    setUIState("initial");
  }
});

nextBtn.addEventListener("click", () => {
  setUIState("initial");
  currentUrl = "";
  lastDownloadedFilename = "";
  lastDownloadedTitle = "";
});

// Initial setup
setUIState("initial");
