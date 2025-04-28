import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { X, ArrowUp, Loader } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion"; // ✅ إضافة AnimatePresence
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
  setInput(""); // إعادة تعيين الإدخال

  // ✅ إعادة حجم textarea بعد الإرسال
  setTimeout(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "auto";
    }
  }, 100);

  setLoading(true);
  setCurrentResponse("");

  try {
    const { data } = await axios.post("/api/chatmodel", { message: input });

    let responseText = "";
    for (const char of data.reply) {
      responseText += char;
      setCurrentResponse(responseText);
      scrollToBottom();
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setMessages([...newMessages, { role: "assistant", content: responseText }]);
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
          className="fixed bottom-6 right-7 z-20 bg-green-500 p-4 rounded-full shadow-lg hover:shadow-xl transition duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <img
            src="/chatgpticon.jpg"
            alt="ChatGPT Logo"
            className="w-12 h-12 rounded-full"
          />
        </motion.button>
      )}

      {/* ✅ نافذة الشات مع أنيميشن عند الفتح والإغلاق */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }} // ✅ يبدأ بالصعود مع شفافية 0 وحجم أصغر
            animate={{ opacity: 1, y: 0, scale: 1 }} // ✅ يظهر تدريجيًا مع الحجم الطبيعي
            exit={{ opacity: 0, y: 50, scale: 0.8 }} // ✅ ينزلق للأسفل مع تصغير تدريجي عند الإغلاق
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
              delay: 0.1,
            }}
            className="fixed bottom-6 right-6 w-80 md:w-[420px] z-20 bg-[#212121] text-white shadow-xl flex flex-col rounded-xl"
          >
            {/* 🔹 الهيدر */}
            <div className="bg-[#303030] p-4 flex justify-between items-center rounded-xl">
              <span className="font-bold text-white justify-center">
                TBiB GPT
              </span>
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
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto"; // إعادة تعيين الارتفاع قبل حساب الجديد
                  if (target.scrollHeight <= 120) {
                    target.style.height = target.scrollHeight + "px"; // التمدد تلقائيًا
                  } else {
                    target.style.height = "120px"; // الحد الأقصى للتمدد
                    target.style.overflowY = "auto"; // السماح بالتمرير إذا تجاوز الحد
                  }
                }}
                className="flex-1 p-2 bg-[#303030] text-white border-none rounded-md focus:ring-0 focus:outline-none resize-none overflow-y-auto"
                placeholder="Type a message..."
                rows={1}
                style={{ maxHeight: "120px" }}
              />
              <motion.button
                onClick={sendMessage}
                className="ml-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition"
                disabled={loading}
                whileTap={{ scale: 0.9 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <Loader className="w-7 h-7 text-black" />
                  </motion.div>
                ) : (
                  <ArrowUp className="w-7 h-7 text-black" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
