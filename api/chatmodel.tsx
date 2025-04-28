import { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openaiApiKey = process.env.VITE_OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error("❌ خطأ: لم يتم العثور على VITE_OPENAI_API_KEY في البيئة!");
}

const openai = new OpenAI({ apiKey: openaiApiKey });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "❌ الرسالة فارغة!" });
  }

  try {
    console.log("📌 إرسال الطلب إلى Chat Completions...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // أو "gpt-3.5-turbo" حسب وش تحب
      messages: [{ role: "user", content: message }],
      temperature: 0.4,
    });

    const reply =
      completion.choices[0].message?.content || "❌ No reply generated.";
    console.log("✅ الرد المولد:", reply);

    res.json({ reply });
  } catch (error: any) {
    console.error(
      "❌ خطأ في الاتصال بـ OpenAI API:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "❌ فشل الاتصال بـ OpenAI API",
      details: error.response?.data || error.message,
    });
  }
}
