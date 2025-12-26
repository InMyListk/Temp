import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
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
