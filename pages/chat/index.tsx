import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { supabase } from "@/lib/supabase";
import { IoArrowBack, IoSend, IoCheckmarkDone, IoCheckmark } from "react-icons/io5";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: number;
  sender: string;
  body: string;
  created_at: string;
  read_by: string[];
};

type GroupedMessages = {
  label: string;
  messages: Message[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_BG: Record<string, string> = {
  Dilshad: "bg-info",
  "Shifa Dilshad": "bg-secondary",
};

const AVATAR_INITIAL: Record<string, string> = {
  Dilshad: "D",
  "Shifa Dilshad": "S",
};

const OTHER_USER: Record<string, string> = {
  Dilshad: "Shifa Dilshad",
  "Shifa Dilshad": "Dilshad",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByDate(messages: Message[]): GroupedMessages[] {
  const groups: GroupedMessages[] = [];
  for (const msg of messages) {
    const label = moment(msg.created_at).calendar(null, {
      sameDay: "[Today]",
      lastDay: "[Yesterday]",
      lastWeek: "dddd",
      sameElse: "MMM D, YYYY",
    });
    const last = groups[groups.length - 1];
    if (!last || last.label !== label) {
      groups.push({ label, messages: [msg] });
    } else {
      last.messages.push(msg);
    }
  }
  return groups;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Resolve current user from localStorage ────────────────────────────────
  useEffect(() => {
    const user = localStorage.getItem("userIdentity") || "";
    setCurrentUser(user);
  }, []);

  // ── Fetch initial messages ────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Mark messages as read ─────────────────────────────────────────────────
  const markRead = useCallback(
    async (user: string) => {
      if (!user) return;
      try {
        await fetch("/api/chat", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user }),
        });
      } catch {}
    },
    []
  );

  // ── Supabase Realtime subscription ────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    fetchMessages();
    markRead(currentUser);

    const channel = supabase
      .channel("chat_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Deduplicate
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // If the message is from the other person, mark as read
          if (newMsg.sender !== currentUser) {
            markRead(currentUser);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchMessages, markRead]);

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const body = input.trim();
    if (!body || !currentUser || sending) return;
    setSending(true);
    setInput("");
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: currentUser, body }),
      });
    } catch {
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Derived values ───────────────────────────────────────────────────────
  const otherUser = OTHER_USER[currentUser] ?? "Other";
  const grouped = groupByDate(messages);

  const isReadByOther = (msg: Message) =>
    msg.sender === currentUser &&
    (msg.read_by ?? []).includes(otherUser);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[100dvh] bg-base-100 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-primary px-3 py-2 flex items-center gap-3 shadow-md z-50">
        <button
          onClick={() => router.back()}
          className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 active:scale-95"
          aria-label="Go back"
        >
          <IoArrowBack className="text-[22px]" />
        </button>

        {/* Avatar */}
        <div
          className={`h-[40px] w-[40px] rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
            AVATAR_BG[otherUser] ?? "bg-secondary"
          }`}
        >
          <span className="text-white font-poppinsMed text-[16px]">
            {AVATAR_INITIAL[otherUser] ?? "?"}
          </span>
        </div>

        {/* Name & status */}
        <div className="flex flex-col min-w-0">
          <span className="text-white font-poppinsMed text-[15px] leading-snug truncate">
            {otherUser || "Chat"}
          </span>
          <span className="text-white/65 text-[11px]">tap here for info</span>
        </div>
      </header>

      {/* ── Chat wallpaper + messages ───────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-2 py-3"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(var(--color-primary) / 0.04) 0%, transparent 60%), " +
            "radial-gradient(circle at 80% 80%, rgba(var(--color-secondary) / 0.04) 0%, transparent 60%)",
        }}
      >
        {/* ── Loading skeleton ─────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col gap-3 px-1 pt-2">
            {[70, 55, 80, 45, 65].map((w, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="skeleton h-10 rounded-2xl bg-base-200"
                  style={{ width: `${w}%` }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
            <div className="h-[70px] w-[70px] rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[32px]">💬</span>
            </div>
            <p className="text-base-content/50 text-[13px] font-poppinsMed text-center px-8">
              No messages yet.{"\n"}Send a message to start the conversation!
            </p>
          </div>
        )}

        {/* ── Messages ─────────────────────────────────────────────────── */}
        {!loading &&
          grouped.map((group) => (
            <div key={group.label}>
              {/* Date divider */}
              <div className="flex items-center justify-center my-3">
                <div className="bg-base-200/80 backdrop-blur-sm text-base-content/50 text-[11px] font-poppinsMed px-3 py-[3px] rounded-full shadow-sm border border-base-content/10">
                  {group.label}
                </div>
              </div>

              {/* Bubbles */}
              {group.messages.map((msg, idx) => {
                const isMine = msg.sender === currentUser;
                const prevSameSender =
                  idx > 0 &&
                  group.messages[idx - 1].sender === msg.sender;
                const nextSameSender =
                  idx < group.messages.length - 1 &&
                  group.messages[idx + 1].sender === msg.sender;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} ${
                      prevSameSender ? "mt-[2px]" : "mt-3"
                    }`}
                  >
                    {/* Avatar (only for first message in a sequence from other) */}
                    {!isMine && (
                      <div className="w-[30px] flex-shrink-0 flex items-end mr-1">
                        {!nextSameSender && (
                          <div
                            className={`h-[26px] w-[26px] rounded-full flex items-center justify-center text-[11px] text-white font-poppinsMed ${
                              AVATAR_BG[msg.sender] ?? "bg-secondary"
                            }`}
                          >
                            {AVATAR_INITIAL[msg.sender] ?? "?"}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[78vw]`}>
                      {/* Bubble */}
                      <div
                        className={`px-3 py-[7px] text-[14px] font-poppins leading-relaxed break-words shadow-sm ${
                          isMine
                            ? "bg-primary text-white rounded-t-2xl rounded-bl-2xl rounded-br-md"
                            : "bg-base-200 text-base-content rounded-t-2xl rounded-br-2xl rounded-bl-md"
                        } ${prevSameSender && isMine ? "rounded-tr-md" : ""} ${
                          prevSameSender && !isMine ? "rounded-tl-md" : ""
                        }`}
                      >
                        {msg.body}
                      </div>

                      {/* Timestamp + read receipt */}
                      <div className="flex items-center gap-[3px] mt-[2px] px-1">
                        <span className="text-[10px] text-base-content/40">
                          {moment(msg.created_at).format("h:mm A")}
                        </span>
                        {isMine && (
                          <span
                            className={`text-[13px] transition-colors ${
                              isReadByOther(msg)
                                ? "text-info"
                                : "text-base-content/30"
                            }`}
                          >
                            {isReadByOther(msg) ? (
                              <IoCheckmarkDone />
                            ) : (
                              <IoCheckmark />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-base-100 border-t border-base-content/10 px-3 py-2 flex items-center gap-2">
        <input
          ref={inputRef}
          id="chat-message-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          autoComplete="off"
          className="flex-1 bg-base-200 rounded-full px-4 py-[11px] text-[14px] text-base-content placeholder:text-base-content/40 outline-none focus:ring-2 focus:ring-primary/25 transition-all"
        />
        <button
          id="chat-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="h-[46px] w-[46px] flex-shrink-0 bg-primary rounded-full flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90 hover:bg-primary/90"
          aria-label="Send message"
        >
          <IoSend className="text-white text-[18px] translate-x-[1px]" />
        </button>
      </div>
    </div>
  );
}
