"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage } from "@/types/chat";

type Props = {
  title: string;
  subtitle: string;
  placeholder: string;
  messages: ChatMessage[];
  sending: boolean;
  error: string | null;
  onSend: (text: string) => void;
};

/** Floating AI chat widget: a toggle button plus a message panel. Shared by both portals. */
export function ChatPanel({ title, subtitle, placeholder, messages, sending, error, onSend }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || sending) return;
    onSend(draft);
    setDraft("");
  }

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-30">
      {open && (
        <div
          role="dialog"
          aria-label={title}
          className="mb-3 flex h-[28rem] w-80 max-w-[90vw] flex-col rounded-xl border border-[var(--line)] bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-[var(--muted)]">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid size-7 place-items-center rounded-md text-[var(--muted)] hover:bg-stone-100"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-[var(--muted)]">{placeholder}</p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-[var(--brand)] text-white"
                    : "bg-stone-100 text-[var(--ink)]"
                }`}
              >
                {message.content}
              </div>
            ))}
            {sending && <div className="max-w-[85%] rounded-lg bg-stone-100 px-3 py-2 text-sm text-[var(--muted)]">Thinking…</div>}
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message…"
              aria-label="Message"
              className="flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        className="grid size-12 place-items-center rounded-full bg-[var(--brand)] text-xl text-white shadow-lg hover:bg-[var(--brand-deep)]"
      >
        <span aria-hidden="true">{open ? "✕" : "💬"}</span>
      </button>
    </div>
  );
}
