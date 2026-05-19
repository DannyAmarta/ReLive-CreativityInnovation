"use client";

import { useRef, ChangeEvent, useState, useEffect } from "react";
import { getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";

export function ProfileAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = getInitials(name);

  const handleEditClick = () => {
    fileInputRef.current?.click(); // Open the file picker
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    // CRITICAL: This must match the @Body('userId') in your NestJS controller
    formData.append("userId", "5"); // Use your actual user ID here

    try {
      const res = await fetch("http://localhost:8000/user/upload-avatar", {
        method: "POST",
        body: formData, 
      });

      if (res.ok) {
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const avatarSrc = avatar 
    ? (avatar.startsWith("/uploads") 
        ? `http://localhost:8000${avatar}${mounted ? `?t=${new Date().getTime()}` : ''}` 
        : avatar)
    : null;

  return (
    <div className="relative">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative h-40 w-40 rounded-2xl overflow-hidden bg-[#0e0e1a]"
      >
        {avatarSrc ? (
          <img 
            src={avatarSrc} 
            alt={name} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2D5A27] to-[#8BA888]">
            <span className="text-3xl font-bold text-white uppercase">{initials}</span>
          </div>
        )}
      </motion.div>

      {/* Pencil Button triggers the input */}
      <motion.button
        onClick={handleEditClick}
        whileHover={{ scale: 1.1, backgroundColor: "#3A7532" }}
        whileTap={{ scale: 0.9 }}
        className="absolute -bottom-2 -right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#2D5A27] text-white shadow-xl"
      >
        <Pencil size={16} />
      </motion.button>
    </div>
  );
}
