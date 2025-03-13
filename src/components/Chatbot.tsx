import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";


export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [{ role: "assistant", content: "**👋 مرحبًا! كيف يمكنني مساعدتك اليوم؟**" }]
  );
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setCurrentResponse("");

    try {
      const { data } = await axios.post("/api/chat", {
        message: input,
      });

      let responseText = "";
      for (const char of data.reply) {
        responseText += char;
        setCurrentResponse(responseText);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: responseText },
      ]);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <>
      {/* ✅ زر فتح الشات بشعار ChatGPT */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#10A37F] p-3 rounded-full shadow-lg hover:bg-[#0E8C6C] transition"
        >
          <img
            src="/chatgpticon.jpg"
            alt="ChatGPT Logo"
            className="w-12 h-12 rounded-full"
          />
        </button>
      )}

      {/* ✅ نافذة الشات */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-[420px] bg-[#212121] text-white shadow-xl flex flex-col rounded-lg">
          {/* 🔹 الهيدر */}
          <div className="bg-[#202123] p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-bold text-white">TBiB GPT</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* 🔹 الرسائل */}
          <div className="p-3 h-64 overflow-y-auto space-y-2 bg-[#212121]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <img
                    src="/tbcaai.png"
                    alt="ChatGPT Logo"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div
                  className={`p-2 max-w-[80%] rounded-lg ${
                    msg.role === "user"
                      ? "bg-[#303030] text-white"
                      : "bg-[#424242] text-white"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {/* 🔹 عرض الإجابة أثناء الكتابة */}
            {loading && (
              <div className="p-2 max-w-[90%] rounded-lg bg-[#424242] text-white animate-pulse">
                {currentResponse || "يتم توليد الإجابة..."}
              </div>
            )}
          </div>

          {/* 🔹 إدخال الرسالة */}
          <div className="flex border-t border-gray-700 p-2 bg-[#202123] rounded-b-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 bg-[#303030] text-white border-none rounded-md focus:ring-0 focus:outline-none"
              placeholder="اكتب رسالتك..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-[#10A37F] text-white px-4 py-2 rounded-md hover:bg-[#0E8C6C] transition"
              disabled={loading}
            >
              {loading ? "..." : "إرسال"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
