import { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

// ✅ **تأكد من أن مفاتيح البيئة محملة بشكل صحيح**
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
    console.log("📌 إنشاء محادثة جديدة...");
    const thread = await openai.beta.threads.create();

    console.log("📌 إرسال الرسالة إلى المحادثة...");
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    console.log("📌 تشغيل المساعد...");
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    console.log("📌 انتظار استجابة المساعد...");
    let runStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // ⏳ انتظار 2 ثانية
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log("🔄 حالة التشغيل:", runStatus.status);
    } while (runStatus.status !== "completed");

    console.log("📌 جلب الرد النهائي...");
    const messages = await openai.beta.threads.messages.list(thread.id);

    if (!messages.data.length) {
      throw new Error("❌ لم يتم العثور على أي رد من المساعد.");
    }

    const reply = messages.data[0].content[0].text.value;
    console.log("✅ الرد المولد:", reply);

    res.json({ reply });
  } catch (error: any) {
    console.error(
      "❌ خطأ في الاتصال بـ OpenAI API:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({
        error: "❌ فشل الاتصال بـ OpenAI API",
        details: error.response?.data || error.message,
      });
  }
}
