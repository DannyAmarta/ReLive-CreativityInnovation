import { useState, useEffect, useRef } from "react";
import { requestEmailChangeViaProxy } from "@/lib/actions/profile";

type EmailChangeState =
  | { phase: "idle" }
  | { phase: "password_confirm"; newEmail: string }
  | { phase: "overwrite_confirm"; newEmail: string; currentPassword: string }
  | { phase: "sending" }
  | { phase: "sent" };

export function useEmailChange(currentEmail: string, onToast: (msg: string, kind: "success" | "error") => void) {
  const [draftEmail, setDraftEmail] = useState(currentEmail);
  const [editing, setEditing] = useState(false);
  const [changeState, setChangeState] = useState<EmailChangeState>({ phase: "idle" });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function handleEditSave() {
      const trimmed = draftEmail.trim();
      if (!trimmed || trimmed === currentEmail) {
        setEditing(false);
        return;
      }
      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        onToast("Please enter a valid email address.", "error");
        return;
      }
      // Open password confirmation modal
      setChangeState({ phase: "password_confirm", newEmail: trimmed });
      setEditing(false);
    }
  
    function handleCancel() {
      setDraftEmail(currentEmail);
      setEditing(false);
      setChangeState({ phase: "idle" });
      setPassword("");
    }
  
    async function handlePasswordConfirm() {
      const state = changeState;
      if (state.phase !== "password_confirm") return;
  
      setChangeState({ phase: "sending" });
  
      try {
        const res = await requestEmailChangeViaProxy({
          newEmail: state.newEmail,
          currentPassword: password || undefined,
        });
  
        if (res.status === "ALTERNATE_ACCOUNT_EXISTS") {
          setChangeState({ phase: "overwrite_confirm", newEmail: state.newEmail, currentPassword: password });
        } else if (res.status === "VERIFICATION_SENT") {
          setChangeState({ phase: "sent" });
          onToast(res.message ?? "Verification email sent!", "success");
          setPassword("");
        } else {
          throw new Error(res.message ?? "Unknown response");
        }
      } catch (e: unknown) {
        setChangeState({ phase: "idle" });
        setPassword("");
        onToast(e instanceof Error ? e.message : "Something went wrong. Please try again.", "error");
      }
    }
  
    async function handleOverwriteConfirm() {
      const state = changeState;
      if (state.phase !== "overwrite_confirm") return;
  
      setChangeState({ phase: "sending" });
  
      try {
        const res = await requestEmailChangeViaProxy({
          newEmail: state.newEmail,
          currentPassword: state.currentPassword || undefined,
          overwriteAlternate: true,
        });
  
        if (res.status === "VERIFICATION_SENT") {
          setChangeState({ phase: "sent" });
          onToast(res.message ?? "Verification email sent!", "success");
          setPassword("");
        } else {
          throw new Error(res.message ?? "Unknown response");
        }
      } catch (e: unknown) {
        setChangeState({ phase: "idle" });
        setPassword("");
        onToast(e instanceof Error ? e.message : "Something went wrong. Please try again.", "error");
      }
    }
  
    const isSending = changeState.phase === "sending";

  return {
    draftEmail, setDraftEmail,
    editing, setEditing,
    changeState,
    password, setPassword,
    showPassword, setShowPassword,
    inputRef,
    isSending: changeState.phase === "sending",
    handleEditSave,
    handleCancel,
    handlePasswordConfirm,
    handleOverwriteConfirm
  };
}