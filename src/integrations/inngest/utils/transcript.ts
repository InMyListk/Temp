import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function extractPlaylistId(url: string): string | null {
  const regExp = /[?&]list=([^#\&\?]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export async function getPlaylistVideos(playlistId: string): Promise<string[]> {
  try {
    const response = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`);
    const body = await response.text();
    
    // Regex to find video IDs in the playlist page source
    // Looking for "videoId":"..." patterns
    const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const matches = [...body.matchAll(videoIdRegex)];
    
    // Extract unique video IDs
    const videoIds = new Set<string>();
    for (const match of matches) {
      videoIds.add(match[1]);
    }
    
    return Array.from(videoIds);
  } catch (error) {
    console.error('Failed to fetch playlist videos:', error);
    return [];
  }
}

export async function getTranscript(url: string) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract video ID from URL');
  }

  console.log(`Extracting transcript for video ID: ${videoId}`);
  
  const scriptPath = path.join(process.cwd(), 'src', 'pythonScipts', 'youtubeTranscript.py');
  
  try {
    const { stdout, stderr } = await execAsync(`python "${scriptPath}" ${videoId}`);
    
    if (stderr) {
      console.error('Python script stderr:', stderr);
    }
    
    const result = JSON.parse(stdout);
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to extract transcript:', error);
    throw error;
  }
}
