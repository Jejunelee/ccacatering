import { supabase } from '../supabase';

// Check if auth state is stable before proceeding with edits
export async function ensureAuthPersisted(): Promise<boolean> {
  try {
    // Wait for auth to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth session error:', error);
      return false;
    }
    
    if (!session) {
      console.warn('No active session found');
      return false;
    }
    
    // Verify session is still valid
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.warn('Session expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring auth persistence:', error);
    return false;
  }
}

// Save operation with retry logic
export async function saveWithAuthRetry<T>(
  saveFunction: () => Promise<T>,
  maxRetries = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check auth before saving
      const isAuthReady = await ensureAuthPersisted();
      
      if (!isAuthReady) {
        if (attempt === maxRetries) {
          throw new Error('Authentication not available after retries');
        }
        
        // Wait and retry
        await new Promise(resolve => 
          setTimeout(resolve, attempt * 1000)
        );
        continue;
      }
      
      // Proceed with save
      return await saveFunction();
      
    } catch (error) {
      console.error(`Save attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => 
        setTimeout(resolve, attempt * 1000)
      );
    }
  }
  
  return null;
}