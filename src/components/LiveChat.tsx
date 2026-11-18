import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { ArrowUpRight, Loader2, MessageCircle, Send, X } from 'lucide-react';

type Message = { id: number; role: 'user' | 'assistant'; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// Deliberately opt in only after the server function, quota, and secret are deployed.
const LIVE_CHAT_ENABLED = import.meta.env.VITE_HEYRIN_CHAT_ENABLED === 'true' && Boolean(SUPABASE_URL && PUBLIC_KEY);
const CHAT_URL = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/heyrin-chat`;

const GUIDE_TOPICS = [
  { title: 'What can Heyrin do?', label: 'Capabilities answer', answer: 'A configured Heyrin voice agent can handle routine customer calls, answer approved business questions, capture lead details, and guide callers to a next step. The conversations shown here are recorded demonstrations.' },
  { title: 'Can Heyrin book appointments?', label: 'Appointment setup answer', answer: 'Appointment booking can be configured with your connected calendar and business rules. This website demo does not make real bookings or check live availability.' },
  { title: 'Can it connect to my tools?', label: 'Integrations answer', answer: 'Phone systems, calendars and business tools may be integrated after reviewing your workflows. Compatibility and setup depend on the services your business uses.' },
  { title: 'How can I try Heyrin?', label: 'Demo answer', answer: 'Listen to the recorded call examples to hear how the conversation could flow. For a custom working agent, describe your call-handling needs in the contact form.' },
] as const;

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<number | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const nextId = useRef(1);
  const wasOpen = useRef(false);
  const headingId = useId();

  const close = () => setOpen(false);

  useEffect(() => {
    if (open) wasOpen.current = true;
    else if (wasOpen.current) toggleRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia('(max-width: 767px)');
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key !== 'Tab' || !mobile.matches || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea:not(:disabled)'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    if (LIVE_CHAT_ENABLED) textRef.current?.focus();
    else closeRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    const syncScrollLock = () => { document.body.style.overflow = mobile.matches ? 'hidden' : originalOverflow; };
    syncScrollLock();
    mobile.addEventListener('change', syncScrollLock);
    return () => {
      window.removeEventListener('keydown', onKey);
      mobile.removeEventListener('change', syncScrollLock);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ block: 'end' }); }, [messages, open]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!LIVE_CHAT_ENABLED || !content || inFlightRef.current) return;
    const pendingMessage: Message = { id: nextId.current++, role: 'user', content };
    const conversation = [...messages, pendingMessage].slice(-12).map(({ role, content: text }) => ({ role, content: text }));
    const controller = new AbortController();
    abortRef.current = controller;
    inFlightRef.current = true;
    setError('');
    setDraft('');
    setSending(true);
    setMessages(prev => [...prev, pendingMessage]);
    const timeout = window.setTimeout(() => controller.abort(), 18_000);
    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: PUBLIC_KEY },
        body: JSON.stringify({ messages: conversation }),
        signal: controller.signal,
      });
      const data: { reply?: unknown; error?: unknown } = await response.json();
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error(typeof data.error === 'string' && response.status !== 500 ? data.error : 'The assistant is unavailable. Please try again.');
      }
      setMessages(prev => [...prev, { id: nextId.current++, role: 'assistant', content: data.reply as string }]);
    } catch (cause) {
      if (!controller.signal.aborted || document.visibilityState !== 'hidden') {
        setError(controller.signal.aborted ? 'The request timed out. Please try again.' : cause instanceof Error ? cause.message : 'Could not reach the assistant.');
      }
      setDraft(content);
      setMessages(prev => prev.filter(message => message.id !== pendingMessage.id));
    } finally {
      window.clearTimeout(timeout);
      abortRef.current = null;
      inFlightRef.current = false;
      setSending(false);
    }
  };

  const onInputKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (!sending && draft.trim()) event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="heyrin-chat-root">
      <button
        ref={toggleRef}
        type="button"
        className="heyrin-chat-launcher"
        aria-label={open ? 'Hide Heyrin chat' : 'Open Heyrin chat'}
        aria-expanded={open}
        aria-controls="heyrin-chat-panel"
        onClick={() => open ? close() : setOpen(true)}
      >
        {open ? <X size={21} /> : <MessageCircle size={21} />}
        <span>{open ? 'Close' : LIVE_CHAT_ENABLED ? 'Ask Heyrin' : 'Explore Heyrin'}</span>
      </button>
      {open && <section ref={panelRef} id="heyrin-chat-panel" className="heyrin-chat-panel" role="dialog" aria-modal="false" aria-labelledby={headingId}>
        <header className="heyrin-chat-header">
          <div><span className="heyrin-chat-eyebrow">{LIVE_CHAT_ENABLED ? 'HEYRIN / ASSISTANT' : 'HEYRIN / GUIDE'}</span><h2 id={headingId}>Heyrin chat</h2></div>
          <button ref={closeRef} type="button" aria-label="Close Heyrin chat" onClick={close}><X size={20}/></button>
        </header>
        {LIVE_CHAT_ENABLED ? <>
          <div className="heyrin-chat-messages" role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 && <p className="heyrin-chat-intro">Ask about Heyrin's example workflows or how a voice agent could fit your business. Live scheduling and customer calls are not connected to this demo.</p>}
            {messages.map(message => <div key={message.id} className={`heyrin-chat-bubble ${message.role}`}><span>{message.role === 'user' ? 'You' : 'Heyrin'}</span><p>{message.content}</p></div>)}
            {sending && <p className="heyrin-chat-thinking" role="status"><Loader2 size={15} className="animate-spin" /> Heyrin is responding…</p>}
            <div ref={endRef}/>
          </div>
          <form className="heyrin-chat-form" onSubmit={send}>
            {error && <p className="heyrin-chat-error" role="alert">{error}</p>}
            <label htmlFor="heyrin-chat-input">Your message</label>
            <div className="heyrin-chat-input-row">
              <textarea id="heyrin-chat-input" ref={textRef} value={draft} onChange={event => { setDraft(event.target.value); if (error) setError(''); }} onKeyDown={onInputKey} maxLength={2000} rows={2} placeholder="Ask Heyrin a question…" disabled={sending} />
              <button type="submit" aria-label="Send message" disabled={sending || !draft.trim()}><Send size={18}/></button>
            </div>
            <p>AI responses are generated by a connected service. Don't share private information.</p>
          </form>
        </> : <div className="heyrin-chat-unavailable heyrin-chat-guide">
          <p className="heyrin-chat-unavailable-title">Discover how Heyrin works.</p>
          <p>Choose a topic for a quick answer based on Heyrin’s demo workflows.</p>
          <div className="heyrin-chat-guide-topics">
            {GUIDE_TOPICS.map((topic, index) => (
              <button key={topic.label} type="button" aria-expanded={selectedGuide === index} onClick={() => setSelectedGuide(index)}>
                {topic.title} <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
          {selectedGuide !== null && <div className="heyrin-chat-guide-answer" role="region" aria-label={GUIDE_TOPICS[selectedGuide].label} aria-live="polite">
            <span>QUICK ANSWER</span><p>{GUIDE_TOPICS[selectedGuide].answer}</p>
          </div>}
          <p className="heyrin-chat-guide-disclaimer">Guided information only. Live AI chat is not connected; voice calls and appointments in these examples are prerecorded.</p>
          <a href="#experience" onClick={close}>Explore the voice demos <ArrowUpRight size={15}/></a>
          <a href="#contact" onClick={close}>Contact the team <ArrowUpRight size={15}/></a>
        </div>}
      </section>}
    </div>
  );
}
