import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { supabase } from "@/lib/supabase";
import { IoArrowBack, IoSend, IoCheckmarkDone, IoCheckmark, IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import { useWebRTC } from "@/hooks/useWebRTC";
import CallScreen from "@/components/CallScreen";

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

// Temporary IDs for optimistic messages (negative so they never clash with DB ids)
let tempIdSeed = -1;

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
  // FIX 1: Track real visual viewport height so iOS keyboard shrinks container correctly
  const [viewportHeight, setViewportHeight] = useState<string>("100dvh");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesBoxRef = useRef<HTMLDivElement>(null);

  // ── WebRTC VoIP Hook ──────────────────────────────────────────────────────
  const otherUser = OTHER_USER[currentUser] ?? "Other";
  
  const {
    callStatus,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isVideoCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo
  } = useWebRTC({
    currentUser,
    otherUser
  });

  // ── Resolve user ──────────────────────────────────────────────────────────
  useEffect(() => {
    const user = localStorage.getItem("userIdentity") || "";
    setCurrentUser(user);
  }, []);

  // ── FIX 1: visualViewport API — iOS keyboard awareness ───────────────────
  // When the virtual keyboard appears/disappears, `window.visualViewport.height`
  // reflects the *actual* visible area. We bind the container to this value so
  // the flex layout doesn't overflow below the keyboard.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setViewportHeight(`${vv.height}px`);
      // After the container shrinks, re-pin scroll to the bottom
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
      });
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    // Set immediately so the first render is correct
    setViewportHeight(`${vv.height}px`);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // ── Scroll to bottom helper ───────────────────────────────────────────────
  const scrollToBottom = useCallback((instant = false) => {
    bottomRef.current?.scrollIntoView({
      behavior: instant ? "instant" : "smooth",
    });
  }, []);

  // ── Fetch messages ────────────────────────────────────────────────────────
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
  const markRead = useCallback(async (user: string) => {
    if (!user) return;
    try {
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });
    } catch {}
  }, []);

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    fetchMessages();
    markRead(currentUser);

    const channel = supabase
      .channel("chat_realtime_v2")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // FIX 3 (optimistic): replace matching temp message with real one
            const withoutOptimistic = prev.filter(
              (m) => !(m.id < 0 && m.sender === newMsg.sender && m.body === newMsg.body)
            );
            if (withoutOptimistic.some((m) => m.id === newMsg.id)) return withoutOptimistic;
            return [...withoutOptimistic, newMsg];
          });
          if (newMsg.sender !== currentUser) markRead(currentUser);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, fetchMessages, markRead]);

  // ── Scroll to bottom when messages change ─────────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom(loading);
  }, [messages, loading, scrollToBottom]);

  // ── FIX 3: Optimistic send ────────────────────────────────────────────────
  const sendMessage = async () => {
    const body = input.trim();
    if (!body || !currentUser || sending) return;

    setSending(true);
    setInput("");

    // Immediately add a temporary message so the UI feels instant
    const tempMsg: Message = {
      id: tempIdSeed--,
      sender: currentUser,
      body,
      created_at: new Date().toISOString(),
      read_by: [],
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: currentUser, body }),
      });
    } catch {
      // Roll back the optimistic message on network error
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
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
  const grouped = groupByDate(messages);

  const isReadByOther = (msg: Message) =>
    msg.sender === currentUser && (msg.read_by ?? []).includes(otherUser);

  const isOptimistic = (msg: Message) => msg.id < 0;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    // FIX 1: fixed top-0 prevents the entire body from being scrolled upward by iOS
    // when the keyboard opens. The height is driven by visualViewport so it shrinks exactly.
    <div
      className="fixed top-0 left-0 w-full flex flex-col bg-base-100 overflow-hidden z-[9999]"
      style={{ height: viewportHeight }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-primary px-3 py-2 flex items-center gap-3 shadow-md">
        <button
          onClick={() => router.back()}
          className="text-white/80 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 active:scale-95"
          aria-label="Go back"
        >
          <IoArrowBack className="text-[22px]" />
        </button>

        <div
          className={`h-[40px] w-[40px] rounded-full flex-shrink-0 flex items-center justify-center ${
            AVATAR_BG[otherUser] ?? "bg-secondary"
          }`}
        >
          <span className="text-white font-poppinsMed text-[16px]">
            {AVATAR_INITIAL[otherUser] ?? "?"}
          </span>
        </div>

        {/* FIX 6: "online" indicator instead of placeholder text */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-white font-poppinsMed text-[15px] leading-snug truncate">
            {otherUser || "Chat"}
          </span>
          <div className="flex items-center gap-1 mt-[1px]">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-success" />
            <span className="text-white/70 text-[11px]">online</span>
          </div>
        </div>

        {/* VoIP Call Buttons */}
        <div className="flex items-center gap-2 pr-1">
          <button
            onClick={() => initiateCall(true)}
            disabled={callStatus !== 'idle'}
            className="text-white hover:text-white/80 transition-colors p-2 active:scale-95 disabled:opacity-50"
            aria-label="Start Video Call"
          >
            <IoVideocamOutline className="text-[26px]" />
          </button>
          <button
            onClick={() => initiateCall(false)}
            disabled={callStatus !== 'idle'}
            className="text-white hover:text-white/80 transition-colors p-2 active:scale-95 disabled:opacity-50"
            aria-label="Start Voice Call"
          >
            <IoCallOutline className="text-[24px]" />
          </button>
        </div>
      </header>

      {/* ── Messages area ───────────────────────────────────────────────────── */}
      {/*
        FIX 2: `min-h-0` is critical on iOS.
        flex-1 by default has min-height: auto, which can cause the container to
        grow beyond the available space. min-h-0 constrains it so the overflow-y-auto
        scrollbar works correctly and the input doesn't get pushed off screen.
      */}
      <div
        ref={messagesBoxRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-3"
      >
        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3 px-1 pt-2">
            {[70, 55, 80, 45, 65].map((w, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className="skeleton h-10 rounded-2xl bg-base-200" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="h-[70px] w-[70px] rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[32px]">💬</span>
            </div>
            <p className="text-base-content/50 text-[13px] font-poppinsMed text-center px-8">
              No messages yet. Say hi! 👋
            </p>
          </div>
        )}

        {/* Messages */}
        {!loading &&
          grouped.map((group) => (
            <div key={group.label}>
              {/* Date divider */}
              <div className="flex items-center justify-center my-3">
                <div className="bg-base-200/80 backdrop-blur-sm text-base-content/50 text-[11px] font-poppinsMed px-3 py-[3px] rounded-full border border-base-content/10">
                  {group.label}
                </div>
              </div>

              {group.messages.map((msg, idx) => {
                const isMine = msg.sender === currentUser;
                const prevSameSender = idx > 0 && group.messages[idx - 1].sender === msg.sender;
                const nextSameSender =
                  idx < group.messages.length - 1 &&
                  group.messages[idx + 1].sender === msg.sender;
                const temp = isOptimistic(msg);

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} ${
                      prevSameSender ? "mt-[2px]" : "mt-3"
                    }`}
                  >
                    {/* Avatar for received messages */}
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

                    <div
                      className={`flex flex-col max-w-[78vw] ${
                        isMine ? "items-end" : "items-start"
                      }`}
                    >
                      {/*
                        FIX 4: `w-fit` prevents the bubble from stretching to max-w.
                        Without it, a single emoji becomes a wide solid rectangle.
                        `max-w-full` still caps it at the parent's max-w-[78vw].
                      */}
                      <div
                        className={`w-fit max-w-full px-3 py-[7px] text-[14px] font-poppins leading-relaxed break-words shadow-sm transition-opacity duration-150 ${
                          temp ? "opacity-55" : "opacity-100"
                        } ${
                          isMine
                            ? "bg-primary text-white rounded-t-2xl rounded-bl-2xl rounded-br-[4px]"
                            : "bg-base-200 text-base-content rounded-t-2xl rounded-br-2xl rounded-bl-[4px]"
                        } ${prevSameSender && isMine ? "rounded-tr-[4px]" : ""} ${
                          prevSameSender && !isMine ? "rounded-tl-[4px]" : ""
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
                              temp
                                ? "text-base-content/20"
                                : isReadByOther(msg)
                                ? "text-info"
                                : "text-base-content/30"
                            }`}
                          >
                            {isReadByOther(msg) ? <IoCheckmarkDone /> : <IoCheckmark />}
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
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div 
        className="flex-shrink-0 bg-base-100 border-t border-base-content/10 px-3 pt-2 flex items-center gap-2"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/*
          FIX 5: Remove focus:ring-* (which conflicts with DaisyUI CSS vars).
          Use box-shadow via the `chat-input` CSS class defined in globals.css.
        */}
        <input
          ref={inputRef}
          id="chat-message-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          className="chat-input flex-1 bg-base-200 rounded-full px-4 py-[11px] text-[14px] text-base-content placeholder:text-base-content/40 outline-none transition-all border-none"
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

      {/* ── VoIP Call Screen ─────────────────────────────────────────────────── */}
      <CallScreen
        status={callStatus}
        remoteStream={remoteStream}
        localStream={localStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isVideoCall={isVideoCall}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        otherUser={otherUser}
      />
    </div>
  );
}
