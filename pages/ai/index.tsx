import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import GoBack from '@/components/gobackSecond';
import { HiOutlineArrowUpRight, HiOutlineBolt, HiOutlineTrash } from 'react-icons/hi2';

type ChatRole = 'system' | 'user' | 'assistant';
type ChatMessage = { role: ChatRole; content: string };

type ChatUpstreamResponse =
  | { message?: { role?: string; content?: string } }
  | { error?: string };

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const STORAGE_KEY = 'aiChat.messages.v1';
// The app has a fixed bottom navigation (`components/navlinks.tsx`) that is ~88px tall,
// but we add a little buffer to avoid overlap across devices/browsers.
const BOTTOM_NAV_HEIGHT_PX = 104;
const TOP_BAR_HEIGHT_PX = 64;
// Composer includes the input row + helper text.
const COMPOSER_HEIGHT_PX = 118;

export default function AiChatPage() {
  const [model, setModel] = useState('gemma2:2b');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [health, setHealth] = useState<'unknown' | 'up' | 'down'>('unknown');
  const [status, setStatus] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'You are a helpful assistant. Keep responses concise.' },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  const canSend = useMemo(() => normalizeString(input).length > 0 && !busy, [input, busy]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const restored = parsed
        .filter(
          (m): m is ChatMessage =>
            Boolean(m) &&
            typeof m === 'object' &&
            (m as any).role &&
            typeof (m as any).content === 'string'
        )
        .map((m: any) => {
          const role: ChatRole =
            m.role === 'system' || m.role === 'user' || m.role === 'assistant'
              ? m.role
              : 'system';
          return { role, content: String(m.content) };
        });
      if (restored.length > 0) setMessages(restored);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-200)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (!shouldAutoScrollRef.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const handleListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 120;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < threshold;
  };

  const checkHealth = async () => {
    setStatus('Checking AI…');
    try {
      const res = await fetch('/api/ai/health');
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setHealth('up');
        setStatus('AI is up');
      } else {
        setHealth('down');
        setStatus('AI is down');
      }
    } catch {
      setHealth('down');
      setStatus('AI is down');
    }
  };

  useEffect(() => {
    checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearChat = () => {
    setMessages([{ role: 'system', content: 'You are a helpful assistant. Keep responses concise.' }]);
    setInput('');
    setStatus('Cleared');
    shouldAutoScrollRef.current = true;
  };

  const send = async () => {
    const content = normalizeString(input);
    if (!content || busy) return;

    shouldAutoScrollRef.current = true;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setInput('');
    setBusy(true);
    setStatus('Thinking…');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: nextMessages, stream: false }),
      });

      const raw = await res.text();
      const parsed = raw ? (JSON.parse(raw) as ChatUpstreamResponse) : null;
      if (!res.ok) {
        setHealth('down');
        setStatus(`AI error (HTTP ${res.status})`);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content:
              normalizeString((parsed as any)?.error) ||
              normalizeString((parsed as any)?.message) ||
              'AI server error.',
          },
        ]);
        return;
      }

      setHealth('up');
      const reply = normalizeString((parsed as any)?.message?.content) || '…';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setStatus('Ready');
    } catch {
      setHealth('down');
      setStatus('AI server is not up');
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI server is not up.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>AI Chat | Expense Tracker</title>
      </Head>

      <div className="h-[100dvh] bg-base-100 dark:bg-base-400">
        {/* Top bar (WhatsApp-ish) */}
        <div
          className="fixed left-0 right-0 z-[3000] px-4"
          style={{ top: 0, height: TOP_BAR_HEIGHT_PX }}
        >
          <div className="max-w-3xl mx-auto h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GoBack />
              <div className="flex flex-col leading-tight">
                <div className="font-poppinsBold text-[15px] text-base-content">AI Chat</div>
                <div className="text-[11px] font-poppinsMed text-base-content/60 truncate max-w-[180px] sm:max-w-[320px]">
                  {status || (health === 'up' ? 'Online' : health === 'down' ? 'Offline' : 'Checking…')} · {model}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn btn-sm btn-ghost" onClick={checkHealth} title="Check AI health">
                <HiOutlineBolt className="text-[18px]" />
              </button>
              <button className="btn btn-sm btn-ghost" onClick={clearChat} title="Clear chat">
                <HiOutlineTrash className="text-[18px]" />
              </button>
              <div
                className={[
                  'badge badge-sm',
                  health === 'up' ? 'badge-success' : health === 'down' ? 'badge-error' : 'badge-ghost',
                ].join(' ')}
              >
                {health}
              </div>
            </div>
          </div>
          <div className="max-w-3xl mx-auto h-px bg-base-content/10" />
        </div>

        {/* Chat background + scroll pane */}
        <div
          className="mx-auto max-w-3xl px-4"
          style={{
            paddingTop: TOP_BAR_HEIGHT_PX + 8,
            paddingBottom: `calc(${BOTTOM_NAV_HEIGHT_PX}px + ${COMPOSER_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px) + 16px)`,
            height: '100dvh',
          }}
        >
          <div
            ref={listRef}
            onScroll={handleListScroll}
            className="h-full overflow-y-auto rounded-2xl border border-base-content/10 bg-base-200/40 shadow-sm"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          >
            <div className="p-4 space-y-3">
              {messages
                .filter(m => normalizeString(m.content))
                .map((m, idx) => {
                  const isUser = m.role === 'user';
                  const isSystem = m.role === 'system';

                  if (isSystem) {
                    return (
                      <div key={`${idx}-${m.role}`} className="flex justify-center">
                        <div className="max-w-[92%] text-[12px] font-poppinsMed text-base-content/60 bg-base-100/80 border border-base-content/10 rounded-full px-4 py-2 backdrop-blur">
                          {m.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${idx}-${m.role}`}
                      className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}
                    >
                      <div
                        className={[
                          'relative max-w-[92%] sm:max-w-[78%] px-4 py-3 whitespace-pre-wrap leading-relaxed',
                          'shadow-sm border',
                          isUser
                            ? 'bg-[#dcf8c6] dark:bg-[#2a3b2e] text-base-content border-base-content/10'
                            : 'bg-base-100 text-base-content border-base-content/10',
                          isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm',
                        ].join(' ')}
                      >
                        <div className="text-[14px] font-poppinsMed">{m.content}</div>
                      </div>
                    </div>
                  );
                })}

              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 max-w-[78%] bg-base-100 border border-base-content/10 shadow-sm">
                    <div className="loading loading-dots loading-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Composer (fixed above bottom nav) */}
        <div
          className="fixed left-0 right-0 z-[3000] px-4"
          style={{
            bottom: `calc(${BOTTOM_NAV_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px) + 8px)`,
          }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-base-content/10 bg-base-100/90 dark:bg-base-400/90 backdrop-blur shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
              <div className="p-3 flex items-end gap-2">
                <textarea
                  className="textarea textarea-bordered w-full min-h-[52px] max-h-[160px] leading-relaxed rounded-2xl"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Message…"
                  onKeyDown={e => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <button className="btn btn-ghost h-[52px] min-h-[52px]" onClick={clearChat} disabled={busy} title="Clear chat">
                  <HiOutlineTrash className="text-[20px]" />
                </button>
                <button className="btn btn-primary h-[52px] min-h-[52px]" onClick={send} disabled={!canSend} title="Send (Ctrl/⌘ + Enter)">
                  <HiOutlineArrowUpRight className="text-[20px]" />
                </button>
              </div>
              <div className="px-4 pb-3 -mt-1 text-[11px] text-base-content/50 font-poppinsMed">
                Ctrl/⌘ + Enter to send · Uses `POST /api/ai/chat` (proxy to `AI_URL`)
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
