import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [
      {
        role: "assistant",
        content: "Hello! I'm **TBiB GPT** How i can help you today ? 👋",
      },
    ]
  );
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");

  // ✅ `useRef` لمتابعة آخر رسالة
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ `useEffect` للتمرير تلقائيًا عند تحديث الرسائل
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setCurrentResponse("");

    try {
      // ✅ إرسال الطلب إلى `/api/chat`
      const { data } = await axios.post("/api/chat", { message: input });

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
      console.error("❌ Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "**❌ خطأ في الاتصال بالخادم. حاول مرة أخرى لاحقًا!**",
        },
      ]);
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
                {currentResponse || "Answering..."}
              </div>
            )}

            {/* ✅ ✅ ✅ `div` الفارغ الذي يجعل `scroll` يحدث تلقائيًا */}
            <div ref={messagesEndRef} />
          </div>

          {/* 🔹 إدخال الرسالة */}
          <div className="flex border-t border-gray-700 p-2 bg-[#202123] rounded-b-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 bg-[#303030] text-white border-none rounded-md focus:ring-0 focus:outline-none"
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-[#10A37F] text-white px-4 py-2 rounded-md hover:bg-[#0E8C6C] transition"
              disabled={loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
