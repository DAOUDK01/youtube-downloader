// api/download.js - Vercel serverless function
const fetch = require('node-fetch');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;
  
  // Validate YouTube URL
  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    // Use youtube-dl-exec alternative or different API approach
    // This is a placeholder for a working solution
    
    // Option 1: Use rapidapi or similar service
    // Option 2: Use youtube-transcript or similar libraries
    // Option 3: Use youtube-mp3-api services
    
    // For now, let's use a different approach - get video info
    const videoInfo = await getVideoInfoClientSide(videoId);
    
    res.json({ 
      success: true, 
      videoInfo,
      downloadUrl: `https://your-alternative-service.com/download/${videoId}`
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to process video' });
  }
}

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function getVideoInfoClientSide(videoId) {
  // Use YouTube oEmbed API (no API key required)
  const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
  if (!response.ok) throw new Error('Video not found');
  return await response.json();
}