import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { motion } from "framer-motion"; // ✅ إضافة framer-motion
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [
      {
        role: "assistant",
        content: "Hello! I'm **TBiB GPT** How can I help you today? 👋",
      },
    ]
  );
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setCurrentResponse("");

    try {
      const { data } = await axios.post("/api/chat", { message: input });

      let responseText = "";
      for (const char of data.reply) {
        responseText += char;
        setCurrentResponse(responseText);
        scrollToBottom();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: responseText },
      ]);
    } catch (error) {
      console.error("❌ Error:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "**❌ Server error. Try again later!**" },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* ✅ زر فتح الشات بشعار ChatGPT */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#10A37F] p-3 rounded-full shadow-lg hover:bg-[#0E8C6C] transition duration-300"
          whileHover={{ scale: 1.1 }} // ✅ تأثير تكبير عند التمرير عليه
          whileTap={{ scale: 0.9 }} // ✅ تأثير تصغير عند الضغط
        >
          <img
            src="/chatgpticon.jpg"
            alt="ChatGPT Logo"
            className="w-12 h-12 rounded-full"
          />
        </motion.button>
      )}

      {/* ✅ نافذة الشات مع أنيميشن عند الفتح */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} // ✅ يبدأ بحجم أصغر وشفافية 0
          animate={{ opacity: 1, scale: 1 }} // ✅ يظهر تدريجيًا بحجم طبيعي
          exit={{ opacity: 0, scale: 0.8 }} // ✅ يختفي بنفس التأثير
          transition={{ duration: 0.3, ease: "easeOut" }} // ✅ يجعل التحول سلسًا
          className="fixed bottom-6 right-6 w-80 md:w-[420px] bg-[#212121] text-white shadow-xl flex flex-col rounded-lg"
        >
          {/* 🔹 الهيدر */}
          <div className="bg-[#202123] p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-bold text-white">TBiB GPT</span>
            <motion.button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* 🔹 الرسائل */}
          <div
            ref={messagesContainerRef}
            className="p-3 h-64 overflow-y-auto space-y-2 bg-[#212121]"
          >
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.role === "user" ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
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
              </motion.div>
            ))}

            {/* 🔹 عرض الإجابة أثناء الكتابة */}
            {loading && (
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="p-2 max-w-[90%] rounded-lg bg-[#424242] text-white"
              >
                {currentResponse || "Answering..."}
              </motion.div>
            )}
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
            <motion.button
              onClick={sendMessage}
              className="ml-2 bg-[#10A37F] text-white px-4 py-2 rounded-md hover:bg-[#0E8C6C] transition"
              disabled={loading}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {loading ? "..." : "Send"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  );
}
