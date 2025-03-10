import { createClient } from "@supabase/supabase-js";

// تهيئة Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    // جلب البيانات من Supabase
    const { data: unites, error: unitesError } = await supabase
      .from("unites")
      .select("id, updated_at");
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id, updated_at");
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, updated_at");

    // التحقق من الأخطاء
    if (unitesError || modulesError || coursesError) {
      console.error("Error fetching data from Supabase:", {
        unitesError,
        modulesError,
        coursesError,
      });
      return res.status(500).send("Error fetching data from Supabase");
    }

    // إنشاء محتوى XML
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // إضافة الروابط إلى XML
    unites.forEach((unite) => {
      xmlContent += `
  <url>
    <loc>https://tbibcours.vercel.app/unite/${unite.id}</loc>
    <lastmod>${new Date(unite.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    modules.forEach((module) => {
      xmlContent += `
  <url>
    <loc>https://tbibcours.vercel.app/module/${module.id}</loc>
    <lastmod>${new Date(module.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    courses.forEach((course) => {
      xmlContent += `
  <url>
    <loc>https://tbibcours.vercel.app/course/${course.id}</loc>
    <lastmod>${new Date(course.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xmlContent += `
</urlset>`;

    // إرجاع المحتوى كـ XML
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xmlContent);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Internal Server Error");
  }
}
