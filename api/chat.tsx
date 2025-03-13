import { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

// ✅ **تأكد من توفر مفاتيح البيئة**
const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
const assistantId = process.env.VITE_ASSISTANT_ID;

if (!openaiApiKey || !assistantId) {
  throw new Error(
    "❌ خطأ: لم يتم العثور على VITE_OPENAI_API_KEY أو VITE_ASSISTANT_ID في البيئة!"
  );
}

// ✅ **تهيئة OpenAI API**
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
    // 🔹 **إنشاء محادثة جديدة (Thread)**
    const thread = await openai.beta.threads.create();

    // 🔹 **إرسال رسالة إلى المحادثة**
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // 🔹 **تشغيل المساعد للحصول على الرد**
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // 🔹 **الانتظار حتى انتهاء المعالجة**
    let runStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // ⏳ انتظار 2 ثانية
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    } while (runStatus.status !== "completed");

    // 🔹 **جلب الرد النهائي**
    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = messages.data[0].content[0].text.value;

    res.json({ reply });
  } catch (error) {
    console.error("❌ خطأ في الاتصال بـ OpenAI API:", error);
    res.status(500).json({ error: "❌ فشل الاتصال بـ OpenAI API" });
  }
}
