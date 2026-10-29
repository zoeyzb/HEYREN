import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Mic, MicOff, RotateCcw, Send, Volume2, VolumeX } from 'lucide-react';

type Role = 'Heyrin' | 'You';
type Message = { role: Role; text: string };
type Stage = 'idle' | 'requesting' | 'listening' | 'speaking' | 'error';
type BookingStep = 'none' | 'service' | 'day';
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { results: ArrayLike<RecognitionResult> };
type RecognitionErrorEvent = { error: string };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type VoiceWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
const GREETING = 'Hello! I’m Heyrin. Ask me about booking an appointment, handling a customer question, or qualifying a lead.';
const INITIAL: Message[] = [{ role: 'Heyrin', text: GREETING }];

function chooseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const english = voices.filter(voice => /^en([_-]|$)/i.test(voice.lang));
  const candidates = english.length ? english : voices;
  const score = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    let value = voice.lang.toLowerCase().startsWith('en-us') ? 3 : 0;
    if (/samantha|ava|jenny|aria|allison|zoe|serena/.test(name)) value += 5;
    if (/natural|enhanced|premium|neural/.test(name)) value += 4;
    if (/google us english|microsoft jenny|microsoft aria/.test(name)) value += 3;
    if (voice.localService) value += 1;
    if (/compact|novelty|whisper/.test(name)) value -= 4;
    return value;
  };
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

function nextReply(input: string, step: { current: BookingStep }): string {
  const text = input.toLowerCase().trim();
  if (!text) return 'I didn’t catch that. Could you try again?';
  if (/\b(cancel|start over|never mind|nevermind|reset)\b/.test(text)) {
    step.current = 'none';
    return 'No problem. What would you like help with instead?';
  }
  if (step.current === 'service') {
    step.current = 'day';
    return 'Thanks. What day or time would work best for your ' + input.trim().slice(0, 80) + ' request?';
  }
  if (step.current === 'day') {
    step.current = 'none';
    return 'Thanks. I’ve captured your preferred time. This preview isn’t connected to a live calendar, so nothing has been booked. With calendar access configured, Heyrin can confirm a booking automatically.';
  }
  if (/\b(book|appointment|schedule|reserve|reschedule|visit)\b/.test(text)) {
    step.current = 'service';
    return 'Absolutely. What service do you need, and is there a day that works best for you?';
  }
  if (/\b(price|pricing|cost|quote|rate|how much)\b/.test(text)) {
    return 'I can give you an accurate answer once your business’s real price list is connected. It’s better not to guess at a quote.';
  }
  if (/\b(hours|open|closing|weekend|location|address)\b/.test(text)) {
    return 'I can check that using your business’s verified hours and location. Those details aren’t connected to this preview yet.';
  }
  if (/\b(human|person|representative|someone|contact|handoff)\b/.test(text)) {
    return 'Of course. What would you like the team to help with? This preview can’t transfer a live call, but a configured phone integration can route callers to the right person.';
  }
  if (/\b(lead|customer|business|hvac|plumb|repair|service|roof)\b/.test(text)) {
    return 'I can help with that. Tell me a little more about what you need, and I’ll guide you to the right next step.';
  }
  if (/\b(hello|hi|hey|help|what can you do)\b/.test(text)) return GREETING;
  return 'Sure. I can walk you through appointment requests, customer questions, or a new service inquiry. What would you like help with first?';
}

export function LiveVoiceAgent() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState('');
  const [typed, setTyped] = useState('');
  const [muted, setMuted] = useState(false);
  const [lastReply, setLastReply] = useState(GREETING);
  const [micSupported, setMicSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<Recognition | null>(null);
  const bookingRef = useRef<BookingStep>('none');
  const liveRef = useRef(true);
  const speakingRef = useRef(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    liveRef.current = true;
    const voiceWindow = window as VoiceWindow;
    setMicSupported(Boolean((voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition) && window.isSecureContext));
    setSpeechSupported('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
    const refreshVoices = () => {
      if ('speechSynthesis' in window) setAvailableVoices(window.speechSynthesis.getVoices());
    };
    refreshVoices();
    if ('speechSynthesis' in window) window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
      liveRef.current = false;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      if (speakingRef.current && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const container = transcriptRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const stopSpeech = () => {
    if ('speechSynthesis' in window && speakingRef.current) window.speechSynthesis.cancel();
    speakingRef.current = false;
    setStage(s => s === 'speaking' ? 'idle' : s);
  };
  const speak = (text: string, ignoreMute = false) => {
    setLastReply(text);
    if ((!ignoreMute && muted) || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setStage('idle');
      return;
    }
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = chooseVoice(availableVoices.length ? availableVoices : window.speechSynthesis.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 0.92;
    utterance.pitch = 1.02;
    utterance.volume = 1;
    utterance.onstart = () => {
      if (liveRef.current) { speakingRef.current = true; setStage('speaking'); }
    };
    utterance.onend = () => {
      speakingRef.current = false;
      if (liveRef.current) setStage('idle');
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      if (liveRef.current) setStage('idle');
    };
    setStage('speaking');
    window.speechSynthesis.speak(utterance);
  };
  const submitTurn = (input: string) => {
    const cleaned = input.trim().slice(0, 500);
    if (!cleaned) return;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    stopSpeech();
    setError('');
    const reply = nextReply(cleaned, bookingRef);
    setMessages(prev => [...prev, { role: 'You', text: cleaned }, { role: 'Heyrin', text: reply }]);
    setTyped('');
    speak(reply);
  };
  const listen = () => {
    if (stage === 'listening' || stage === 'requesting') {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setStage('idle');
      return;
    }
    const voiceWindow = window as VoiceWindow;
    const Constructor = voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition;
    if (!Constructor || !window.isSecureContext) {
      setError('Voice input is unavailable in this browser. Use the text field instead.');
      setStage('error');
      return;
    }
    stopSpeech();
    setError('');
    try {
      const recognition = new Constructor();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      let handled = false;
      recognition.onstart = () => { if (liveRef.current) setStage('listening'); };
      recognition.onresult = (event) => {
        if (handled) return;
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript?.trim();
          if (result.isFinal && text) {
            handled = true;
            submitTurn(text);
            return;
          }
        }
      };
      recognition.onerror = event => {
        if (!liveRef.current || event.error === 'aborted') return;
        const reason = event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'Microphone permission was denied. Allow microphone access in site settings, or use the text field.'
          : event.error === 'no-speech'
          ? 'No speech detected. Try again in a quieter place or type your message.'
          : 'Speech recognition failed (' + event.error + '). You can still type your message.';
        setError(reason);
        setStage('error');
      };
      recognition.onend = () => {
        if (recognitionRef.current === recognition) recognitionRef.current = null;
        if (liveRef.current) setStage(s => s === 'listening' || s === 'requesting' ? 'idle' : s);
      };
      setStage('requesting');
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setStage('error');
      setError('Could not open the microphone. Check browser permissions or type your message.');
    }
  };
  const reset = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    stopSpeech();
    bookingRef.current = 'none';
    setStage('idle');
    setError('');
    setMessages(INITIAL);
    setTyped('');
    setLastReply(GREETING);
  };

  const statusLabel = stage === 'requesting' ? 'REQUESTING MICROPHONE'
    : stage === 'listening' ? 'LISTENING'
    : stage === 'speaking' ? 'SPEAKING'
    : stage === 'error' ? 'MICROPHONE UNAVAILABLE' : 'READY';
  return (
    <div className="rin-live-agent" id="voice-preview">
      <div className="rin-live-intro">
        <div>
          <span className="rin-mini-label">INTERACTIVE / BROWSER VOICE PREVIEW</span>
          <h3>Talk to Heyrin. <em>Hear it respond.</em></h3>
          <p>Try a spoken customer inquiry or type one below. This is a guided preview, not a connected phone or calendar agent.</p>
        </div>
        <span className={'rin-live-status' + (stage === 'listening' ? ' listening' : '')} role="status">
          {statusLabel}
          <span className={'rin-live-signal' + (stage === 'listening' || stage === 'speaking' ? ' is-active' : '')} aria-hidden="true">
            <i /><i /><i /><i /><i />
          </span>
        </span>
      </div>
      <div className="rin-live-layout">
        <div className="rin-live-transcript" ref={transcriptRef} role="log" aria-label="Live preview conversation" aria-live="polite" aria-relevant="additions text">
          {messages.map((message, index) => (
            <div key={index} className={'rin-live-message ' + (message.role === 'You' ? 'is-user' : 'is-agent')}>
              <span>{message.role}</span><p>{message.text}</p>
            </div>
          ))}
        </div>
        <div className="rin-live-actions">
          <button type="button" className="rin-live-mic" onClick={listen} disabled={!micSupported}
            aria-label={stage === 'listening' || stage === 'requesting' ? 'Stop listening' : 'Start talking'}>
            {stage === 'listening' || stage === 'requesting' ? <MicOff size={21} /> : <Mic size={21}/>}
            {stage === 'listening' || stage === 'requesting' ? 'Stop listening' : 'Start talking'}
          </button>
          <button type="button" className="rin-live-secondary" onClick={() => {
            if (stage === 'speaking') stopSpeech();
            else { setMuted(false); speak(lastReply, true); }
          }} disabled={!speechSupported} aria-label={stage === 'speaking' ? 'Stop voice reply' : 'Hear last reply'}>
            <Volume2 size={17}/>{stage === 'speaking' ? 'Stop reply' : 'Hear last reply'}
          </button>
          <button type="button" className="rin-live-secondary" onClick={() => { setMuted(v => !v); stopSpeech(); }}
            aria-pressed={muted}>{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>} {muted ? 'Voice muted' : 'Voice on'}</button>
          <button type="button" className="rin-live-secondary" onClick={reset}><RotateCcw size={17}/> Reset</button>
          {!micSupported && <p className="rin-live-hint">Microphone input needs HTTPS and a supported browser (such as Chrome). Text input works without it.</p>}
          {error && <p className="rin-live-error" role="alert"><AlertCircle size={16}/>{error}</p>}
        </div>
      </div>
      <form className="rin-live-form" onSubmit={event => { event.preventDefault(); submitTurn(typed); }}>
        <label htmlFor="rin-voice-text">Or type a customer question</label>
        <div><input id="rin-voice-text" value={typed} maxLength={500} onChange={event => setTyped(event.target.value)}
          placeholder="e.g. I'd like to book a plumbing visit" />
          <button type="submit" disabled={!typed.trim()} aria-label="Send voice preview message"><Send size={17}/> Send</button>
        </div>
      </form>
      <p className="rin-live-privacy">Demo only: no real calls, bookings, messages, or AI model requests. Speech recognition may be processed by your browser’s speech provider. No microphone recordings are stored by Heyrin here.</p>
    </div>
  );
}
