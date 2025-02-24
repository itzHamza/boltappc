import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qjqfaywhgbwwvusananj.supabase.co"; // استبدله بعنوان مشروعك
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWZheXdoZ2J3d3Z1c2FuYW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MDA0NzEsImV4cCI6MjA1NTM3NjQ3MX0.yGpwF53SX6GcQdj6ijRE08KeQz8sieOM-YPSiw6jNyo"; // استبدله بالمفتاح الخاص بك

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
