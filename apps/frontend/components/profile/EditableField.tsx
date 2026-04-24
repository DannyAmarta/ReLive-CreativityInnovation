import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence
} from "framer-motion";
import { 
  Edit3,
  Check,
  X
 } from "lucide-react";

export function EditableField({
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
      className="group relative rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm"
      style={{ borderColor: editing ? "rgba(139,92,246,0.35)" : undefined }}
      animate={{ borderColor: editing ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.08)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 mb-2">
          <Icon className="h-4 w-4 text-violet-400 flex-shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">{label}</span>
        </div>
        {!editing && (
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 rounded-full border border-white/15 bg-white/10 p-1.5 text-white/60 transition-all hover:text-white hover:border-violet-400/40"
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {multiline ? (
              <textarea
                ref={inputRef as React.Ref<HTMLTextAreaElement>}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full resize-none rounded-xl border border-violet-500/40 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/20 placeholder:text-white/25 transition-all"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            ) : (
              <input
                ref={inputRef as React.Ref<HTMLInputElement>}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-violet-500/40 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/20 placeholder:text-white/25 transition-all"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              />
            )}
            <motion.div layout className="mt-2 flex gap-2">
              <motion.button
                whileHover={{ scale: saving ? 1 : 1.04 }}
                whileTap={{ scale: saving ? 1 : 0.96 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                {saving ? "Saving…" : "Save"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors disabled:opacity-40"
              >
                <X className="h-3 w-3" /> Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.p
            key="view"
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="text-sm leading-relaxed text-white/80"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {value || <span className="italic text-white/25">{placeholder ?? "Not set"}</span>}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}