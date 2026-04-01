export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error.message?.toLowerCase() || '';
    const isRetryable = 
      errorMessage.includes('429') || 
      errorMessage.includes('503') || 
      errorMessage.includes('overwhelmed') ||
      errorMessage.includes('demand') ||
      errorMessage.includes('unavailable') ||
      errorMessage.includes('deadline') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('network');

    if (retries > 0 && isRetryable) {
      console.log(`Retrying API call... (${retries} attempts left). Error: ${errorMessage}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
