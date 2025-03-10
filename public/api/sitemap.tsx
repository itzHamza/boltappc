import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // الاتصال بـ Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // جلب الدروس من قاعدة البيانات
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, updated_at");

  if (error) {
    return res.status(500).json({ error: "Failed to fetch courses" });
  }

  // إنشاء `sitemap.xml`
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://tbibcours.vercel.app/</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`;

  courses.forEach((course) => {
    sitemap += `
    <url>
      <loc>https://tbibcours.vercel.app/course/${course.id}</loc>
      <lastmod>${
        course.updated_at || new Date().toISOString().split("T")[0]
      }</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`;
  });

  sitemap += `</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(sitemap);
}
