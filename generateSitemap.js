import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// 🔹 إعداد Supabase
const SUPABASE_URL = "https://qjqfaywhgbwwvusananj.supabase.co"; // استبدل هذا برابط Supabase الخاص بك
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWZheXdoZ2J3d3Z1c2FuYW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MDA0NzEsImV4cCI6MjA1NTM3NjQ3MX0.yGpwF53SX6GcQdj6ijRE08KeQz8sieOM-YPSiw6jNyo"; // استخدم مفتاح Supabase (يُفضل تخزينه في متغير بيئي)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE_URL = "https://tbibcours.vercel.app";

async function generateSitemap() {
  console.log("⏳ Generating sitemap...");

  // 🔹 جلب البيانات من Supabase
  const { data: years } = await supabase.from("years").select("id");
  const { data: modules } = await supabase.from("modules").select("id");
  const { data: courses } = await supabase.from("courses").select("id");

  // 🔹 بناء ملف `sitemap.xml`
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    sitemap += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;


  // 🔹 إضافة الروابط الأساسية
  sitemap += `  <url><loc>${BASE_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

  // 🔹 إضافة روابط السنوات
  years.forEach(({ id }) => {
    sitemap += `  <url><loc>${BASE_URL}/year/${id}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });

  // 🔹 إضافة روابط المقاييس
  modules.forEach(({ id }) => {
    sitemap += `  <url><loc>${BASE_URL}/module/${id}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  });

  // 🔹 إضافة روابط الدروس
  courses.forEach(({ id }) => {
    sitemap += `  <url><loc>${BASE_URL}/course/${id}</loc><changefreq>daily</changefreq><priority>0.6</priority></url>\n`;
  });

  sitemap += `</urlset>`;

  // 🔹 حفظ `sitemap.xml` في مجلد `public/`
  fs.writeFileSync("public/sitemap.xml", sitemap);
  console.log("✅ Sitemap generated successfully!");
}

// تشغيل الدالة
generateSitemap();
