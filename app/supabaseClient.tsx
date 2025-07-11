// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error.message);
      return null; // Handle guest/unauthenticated users
    }
    return user;
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
}

export default supabase;
