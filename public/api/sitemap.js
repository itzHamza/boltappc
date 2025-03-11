import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  const baseUrl = "https://tbibcours.vercel.app";

  // Fetch data from Supabase
  const { data: years } = await supabase.from("years").select("id");
  const { data: unites } = await supabase.from("unites").select("id");
  const { data: modules } = await supabase.from("modules").select("id");
  const { data: courses } = await supabase.from("courses").select("id");

  // Generate XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
`;

  years.forEach(({ id }) => {
    sitemap += `<url><loc>${baseUrl}/year/${id}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });

  unites.forEach(({ id }) => {
    sitemap += `<url><loc>${baseUrl}/unite/${id}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  });

  modules.forEach(({ id }) => {
    sitemap += `<url><loc>${baseUrl}/module/${id}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
  });

  courses.forEach(({ id }) => {
    sitemap += `<url><loc>${baseUrl}/course/${id}</loc><changefreq>daily</changefreq><priority>0.5</priority></url>\n`;
  });

  sitemap += `</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(sitemap);
}
