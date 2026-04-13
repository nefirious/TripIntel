import { summarizeRedditDigest, RedditDigest } from './gemini';

export async function getRedditDigest(city: string): Promise<RedditDigest | null> {
  try {
    // We use Gemini to search and summarize Reddit data to avoid CORS issues
    // and provide a clean, translated summary.
    return await summarizeRedditDigest(city);
  } catch (error) {
    console.error('Error getting Reddit digest:', error);
    return null;
  }
}
