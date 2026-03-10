const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

let mainWindow;

/* -------------------- YT-DLP PATH FIX -------------------- */

function getYtDlpPath() {
  if (!app.isPackaged) {
    return "yt-dlp"; // Use system PATH in dev
  }

  const exeName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";

  return path.join(process.resourcesPath, "yt-dlp", exeName);
}

/* -------------------- WINDOW -------------------- */

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

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

/* -------------------- IPC HANDLERS -------------------- */

ipcMain.handle("validate-url", (_, url) => {
  return !!normalizeYoutubeUrl(url);
});

ipcMain.handle("choose-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });

  if (result.canceled) return { success: false };
  return { success: true, path: result.filePaths[0] };
});

ipcMain.handle("get-downloads-folder", () => {
  return app.getPath("downloads");
});

ipcMain.handle("get-video-title", async (_, url) => {
  try {
    const cleanUrl = normalizeYoutubeUrl(url);
    if (!cleanUrl) {
      throw new Error("Invalid YouTube URL");
    }

    const ytDlpPath = getYtDlpPath();

    return await new Promise((resolve, reject) => {
      const child = spawn(ytDlpPath, ["--get-title", cleanUrl], {
        windowsHide: true,
      });

      let title = "";
      let errorData = "";

      child.stdout.on("data", (data) => {
        title += data.toString();
      });

      child.stderr.on("data", (data) => {
        errorData += data.toString();
      });

      child.on("error", (err) => {
        reject(new Error("yt-dlp not found. Make sure it is installed."));
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(errorData || "Failed to get video title"));
        } else {
          resolve(title.trim());
        }
      });
    });
  } catch (err) {
    throw new Error(err.message);
  }
});

ipcMain.handle("open-file", async (_, filePath) => {
  await shell.openPath(filePath);
  return { success: true };
});

/* -------------------- DOWNLOAD MP3 -------------------- */

ipcMain.handle("download-mp3", async (event, url, outputDir) => {
  try {
    const cleanUrl = normalizeYoutubeUrl(url);
    if (!cleanUrl) {
      return { success: false, error: "Invalid YouTube URL" };
    }

    const ytDlpPath = getYtDlpPath();

    // First get the video title to construct the file path
    const titlePromise = new Promise((resolve, reject) => {
      const titleChild = spawn(ytDlpPath, ["--get-title", cleanUrl], {
        windowsHide: true,
      });

      let title = "";
      titleChild.stdout.on("data", (data) => {
        title += data.toString();
      });

      titleChild.on("close", (code) => {
        if (code === 0) {
          resolve(title.trim());
        } else {
          reject(new Error("Failed to get title"));
        }
      });

      titleChild.on("error", () => reject(new Error("yt-dlp not found")));
    });

    const videoTitle = await titlePromise;
    const sanitizedTitle = sanitizeFilename(videoTitle);
    const outputTemplate = path.join(outputDir, "%(title)s.%(ext)s");
    const expectedFilePath = path.join(outputDir, `${sanitizedTitle}.mp3`);

    const args = [
      cleanUrl,
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--newline",
      "--no-playlist",
      "-o",
      outputTemplate,
      "--ffmpeg-location",
      ffmpegPath,
    ];

    return await new Promise((resolve) => {
      const child = spawn(ytDlpPath, args, {
        windowsHide: true,
      });

      let stderrData = "";

      child.stdout.on("data", (data) => {
        const text = data.toString();
        const match = text.match(/(\d+(?:\.\d+)?)%/);

        if (match) {
          const percent = Math.floor(parseFloat(match[1]));
          event.sender.send("download-progress", {
            percent,
            phase: "downloading",
          });
        }

        if (
          text.includes("[ExtractAudio]") ||
          text.includes("Deleting original file")
        ) {
          event.sender.send("download-progress", {
            percent: 100,
            phase: "converting",
          });
        }
      });

      child.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      child.on("error", (err) => {
        resolve({
          success: false,
          error: "yt-dlp not found. Make sure it is installed.",
        });
      });

      child.on("close", (code) => {
        if (code !== 0) {
          resolve({
            success: false,
            error: stderrData || "Download failed.",
          });
        } else {
          event.sender.send("download-progress", {
            percent: 100,
            phase: "completed",
          });

          // Verify the file exists
          const filePath = fs.existsSync(expectedFilePath)
            ? expectedFilePath
            : null;

          resolve({
            success: true,
            message: "Download completed",
            filePath: filePath,
          });
        }
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/* -------------------- OPEN FOLDER -------------------- */

ipcMain.handle("open-folder", async (_, folderPath) => {
  await shell.openPath(folderPath);
  return { success: true };
});
