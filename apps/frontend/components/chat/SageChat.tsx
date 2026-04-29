"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, User } from "lucide-react";

export function SageChat({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Greetings, ${user.name}. I am Sage. How shall we curate your wellness archive today?` }
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // This forces a valid URL even if your environment variables are broken
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    // Clean the URL: ensures we don't have double slashes if baseUrl ends with /
    const targetUrl = `${baseUrl.replace(/\/$/, "")}/chat/ask`;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input, user }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      
      // Groq/OpenAI returns an object. Access the content correctly:
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.content // This matches completion.choices[0].message
      }]);
    } catch (err) {
      console.error("Sage Fetch Error:", err);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "I lost my connection to the botanical archive. Is the backend running on port 8000?" 
      }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 overflow-hidden rounded-3xl border border-[#DDE1DF]/60 bg-[#F7F9F7] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#2D4A22] p-4 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <span className="text-sm font-bold tracking-widest uppercase">Sage</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>

            {/* Chat Body */}
            <div className="h-96 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    m.role === 'user' 
                    ? 'bg-[#2D4A22] text-white' 
                    : 'bg-white border border-[#DDE1DF]/40 text-[#2D4A22]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-[#DDE1DF]/40 bg-white/50">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-[#DDE1DF]/60 px-3 py-2">
                <input 
                  className="flex-1 bg-transparent text-sm outline-none text-[#2D4A22] placeholder:text-zinc-400"
                  placeholder="Message Sage..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} className="text-[#2D4A22] hover:scale-110 transition-transform">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2D4A22] text-white shadow-xl"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </motion.button>
    </div>
  );
}