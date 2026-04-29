import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Check, X } from "lucide-react";

export function UIEditableField({
  label,
  icon: Icon,
  value,
  multiline = false,
  placeholder,
  onSave,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  multiline?: boolean;
  placeholder?: string;
  onSave: (v: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  async function handleSave() {
    const trimmed = draft.trim() || value;
    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() { setDraft(value); setEditing(false); }

  return (
    <motion.div
      layout
      // Card style: Light background, soft shadow, matching the Health dashboard
      className="group relative rounded-2xl border border-[#DDE1DF]/60 bg-white p-5 transition-shadow duration-300"
      style={{ 
        boxShadow: editing 
          ? "0 10px 25px -5px rgba(45, 90, 39, 0.12)" 
          : "0 4px 12px rgba(0, 0, 0, 0.03)" 
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 mb-2">
          {/* Icon: Primary Green (#2D5A27) */}
          <Icon className="h-4 w-4 text-[#2D5A27] flex-shrink-0" />
          {/* Label: Neutral Dark (#2C2E2C) at 40% opacity */}
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2C2E2C]/40">
            {label}
          </span>
        </div>
        
        {!editing && (
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#F7F9F7" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 rounded-lg border border-[#DDE1DF] bg-white p-1.5 text-[#2D5A27] transition-all hover:border-[#2D5A27]/30"
            aria-label={`Edit ${label}`}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {multiline ? (
              <textarea
                ref={inputRef as React.Ref<HTMLTextAreaElement>}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                rows={3}
                // Input: Light sage borders and clean focus states
                className="w-full resize-none rounded-xl border border-[#DDE1DF] bg-[#F7F9F7] px-3 py-2 text-sm text-[#2C2E2C] outline-none focus:border-[#2D5A27]/50 focus:ring-4 focus:ring-[#2D5A27]/5 placeholder:text-[#2C2E2C]/20 transition-all"
                style={{ fontFamily: "'Sora', sans-serif" }}
              />
            ) : (
              <input
                ref={inputRef as React.Ref<HTMLInputElement>}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-[#DDE1DF] bg-[#F7F9F7] px-3 py-2 text-sm text-[#2C2E2C] outline-none focus:border-[#2D5A27]/50 focus:ring-4 focus:ring-[#2D5A27]/5 placeholder:text-[#2C2E2C]/20 transition-all"
                style={{ fontFamily: "'Sora', sans-serif" }}
                onKeyDown={(e) => { 
                  if (e.key === "Enter") handleSave(); 
                  if (e.key === "Escape") handleCancel(); 
                }}
              />
            )}
            
            <motion.div layout className="mt-3 flex gap-2">
              <motion.button
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                onClick={handleSave}
                disabled={saving}
                // Save Button: Solid Dark Green (#071407)
                className="flex items-center gap-1.5 rounded-lg bg-[#071407] px-4 py-1.5 text-xs font-bold text-white transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#F7F9F7" }} 
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={saving}
                // Cancel Button: Clean border and neutral text
                className="flex items-center gap-1.5 rounded-lg border border-[#DDE1DF] bg-white px-4 py-1.5 text-xs font-bold text-[#2C2E2C]/60 hover:text-[#2C2E2C] transition-colors disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.p
            key="view"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium leading-relaxed text-[#2C2E2C]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {value || <span className="italic text-[#2C2E2C]/20">{placeholder ?? "Not set"}</span>}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}