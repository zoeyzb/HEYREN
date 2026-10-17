import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneCall, Mic, Volume2, CheckCircle2, Clock, Radio } from 'lucide-react';

interface DialogueLine {
  speaker: 'agent' | 'caller';
  text: string;
  delay: number;
}

interface Scenario {
  id: string;
  number: string;
  title: string;
  description: string;
  dialogue: DialogueLine[];
  outcome: string;
  outcomeLabel: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'appointment',
    number: '01',
    title: 'Book an Appointment',
    description: 'A customer calls to schedule a service.',
    dialogue: [
      { speaker: 'agent', text: 'Hi, thanks for calling. This is Heyrin. How can I help you today?', delay: 0 },
      { speaker: 'caller', text: 'Hi, I need to book an appointment for a plumbing repair.', delay: 1800 },
      { speaker: 'agent', text: "Of course. Could you share what kind of repair you need and your preferred day?", delay: 3200 },
      { speaker: 'caller', text: 'A kitchen sink leak. Sometime this week if possible.', delay: 4800 },
      { speaker: 'agent', text: "I have Wednesday at 2 PM or Thursday at 10 AM available. Which works better?", delay: 6200 },
      { speaker: 'caller', text: 'Wednesday at 2 works perfectly.', delay: 7800 },
      { speaker: 'agent', text: "Booked. You're scheduled for Wednesday at 2 PM. You'll get a confirmation text shortly.", delay: 9200 },
    ],
    outcome: 'Appointment scheduled — Wednesday 2:00 PM',
    outcomeLabel: 'Calendar entry created',
  },
  {
    id: 'inquiry',
    number: '02',
    title: 'Answer a Customer Inquiry',
    description: 'A customer asks about business hours and services.',
    dialogue: [
      { speaker: 'agent', text: 'Hi, this is Heyrin. How can I assist you today?', delay: 0 },
      { speaker: 'caller', text: 'What are your business hours and do you handle commercial properties?', delay: 1600 },
      { speaker: 'agent', text: "We're open Monday through Friday, 8 AM to 6 PM, and Saturday 9 to 2. Yes, we service commercial properties.", delay: 3000 },
      { speaker: 'caller', text: 'Great. Do you offer free estimates for commercial work?', delay: 5000 },
      { speaker: 'agent', text: "Yes, we provide free on-site estimates for commercial projects. Would you like me to arrange one?", delay: 6400 },
      { speaker: 'caller', text: 'Yes, please. My business is on Oak Street.', delay: 8200 },
      { speaker: 'agent', text: "Noted. I'll have our team reach out to schedule your estimate. Is there a good callback number?", delay: 9600 },
    ],
    outcome: 'Inquiry resolved — Estimate request forwarded',
    outcomeLabel: 'Information provided',
  },
  {
    id: 'lead',
    number: '03',
    title: 'Capture a New Lead',
    description: 'A prospective customer calls about services.',
    dialogue: [
      { speaker: 'agent', text: 'Hi, thanks for calling. This is Heyrin. What brings you to us today?', delay: 0 },
      { speaker: 'caller', text: "Hi, I'm exploring options for an AI receptionist for my dental practice.", delay: 1600 },
      { speaker: 'agent', text: "That's exactly what we do. Could you tell me a bit about your current call volume?", delay: 3000 },
      { speaker: 'caller', text: 'Probably 30 to 40 calls a day, mostly for appointments.', delay: 4600 },
      { speaker: 'agent', text: "Got it. And are you currently using any scheduling software we should connect with?", delay: 5800 },
      { speaker: 'caller', text: 'Yes, we use a popular dental management platform.', delay: 7400 },
      { speaker: 'agent', text: "Perfect. I'll record your details and have our team prepare a tailored proposal for you. What's the best email to reach you?", delay: 8800 },
    ],
    outcome: 'Lead captured — Details recorded for follow-up',
    outcomeLabel: 'Lead saved to CRM',
  },
];

type CallState = 'idle' | 'connecting' | 'active' | 'processing' | 'complete';

export function VoiceDemo() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [callTime, setCallTime] = useState(0);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [callerSpeaking, setCallerSpeaking] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const startScenario = useCallback((scenario: Scenario) => {
    clearTimers();
    setSelectedScenario(scenario);
    setCallState('connecting');
    setVisibleLines(0);
    setCallTime(0);
    setAgentSpeaking(false);
    setCallerSpeaking(false);

    // Connecting delay
    timersRef.current.push(setTimeout(() => {
      setCallState('active');
      // Start call timer
      intervalRef.current = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);

      // Schedule each dialogue line
      scenario.dialogue.forEach((line, idx) => {
        const timer = setTimeout(() => {
          setVisibleLines(idx + 1);
          if (line.speaker === 'agent') {
            setAgentSpeaking(true);
            setCallerSpeaking(false);
          } else {
            setCallerSpeaking(true);
            setAgentSpeaking(false);
          }
        }, line.delay);
        timersRef.current.push(timer);
      });

      // Complete after last line + buffer
      const lastDelay = scenario.dialogue[scenario.dialogue.length - 1].delay;
      timersRef.current.push(setTimeout(() => {
        setCallState('complete');
        setAgentSpeaking(false);
        setCallerSpeaking(false);
      }, lastDelay + 2000));
    }, 800));
  }, [clearTimers]);

  const resetDemo = useCallback(() => {
    clearTimers();
    setSelectedScenario(null);
    setCallState('idle');
    setVisibleLines(0);
    setCallTime(0);
    setAgentSpeaking(false);
    setCallerSpeaking(false);
  }, [clearTimers]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <section id="experience" className="relative py-24 lg:py-32 bg-ink-deep overflow-hidden">
      <div className="absolute inset-0 tech-grid-fine opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-lime/3 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div className="mb-12 lg:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-violet/60" />
            <span className="text-xs font-mono tracking-[0.2em] text-violet/80 uppercase">Interactive Demonstration</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight mb-3">
            Conversations, reimagined.
          </h2>
          <p className="text-base text-silver max-w-lg">
            Discover what happens when every incoming call has someone ready to answer.
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
          {/* Scenario selector */}
          <div className="space-y-3">
            <div className="text-xs font-mono tracking-[0.15em] text-silver/50 uppercase mb-4">
              Select a Scenario
            </div>
            {SCENARIOS.map((scenario) => {
              const isActive = selectedScenario?.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => startScenario(scenario)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                    isActive
                      ? 'border-lime/40 bg-lime/5'
                      : 'border-ink-line bg-ink-panel/50 hover:border-silver/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-mono ${isActive ? 'text-lime' : 'text-silver/50'}`}>
                      {scenario.number}
                    </span>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${isActive ? 'text-lime' : 'text-soft'}`}>
                        {scenario.title}
                      </div>
                      <div className="text-xs text-silver/60 mt-1">{scenario.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
            {selectedScenario && (
              <button
                onClick={resetDemo}
                className="w-full text-xs text-silver/50 hover:text-silver transition-colors py-2"
              >
                Reset demonstration
              </button>
            )}
          </div>

          {/* Call panel */}
          <div className="relative">
            <div className="relative bg-ink-panel/80 backdrop-blur-xl border border-ink-line rounded-2xl overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-line bg-ink-deep/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-2 h-2 rounded-full ${callState === 'active' ? 'bg-lime' : callState === 'connecting' ? 'bg-yellow-400' : callState === 'complete' ? 'bg-violet' : 'bg-silver/40'}`} />
                    {callState === 'active' && (
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-lime animate-ping" />
                    )}
                  </div>
                  <span className="text-xs font-mono text-silver">
                    {callState === 'idle' && 'Awaiting scenario'}
                    {callState === 'connecting' && 'Connecting...'}
                    {callState === 'active' && 'Connected — Demo'}
                    {callState === 'processing' && 'Processing...'}
                    {callState === 'complete' && 'Call ended'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-silver/60">
                  <Clock size={12} />
                  {formatTime(callTime)}
                </div>
              </div>

              {/* Panel body */}
              <div className="p-5 min-h-[360px] flex flex-col">
                {!selectedScenario ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full border border-ink-line flex items-center justify-center">
                      <PhoneCall size={24} className="text-silver/40" />
                    </div>
                    <p className="text-sm text-silver/60 max-w-xs">
                      Select a scenario to begin an interactive demonstration of a Heyrin voice conversation.
                    </p>
                    <span className="text-[10px] font-mono tracking-wider text-silver/30 uppercase mt-2">
                      This is a simulated demonstration
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Status indicators */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all ${
                        agentSpeaking ? 'bg-lime/10 text-lime border border-lime/30' : 'text-silver/30 border border-ink-line'
                      }`}>
                        <Volume2 size={10} /> Agent
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all ${
                        callerSpeaking ? 'bg-violet/10 text-violet border border-violet/30' : 'text-silver/30 border border-ink-line'
                      }`}>
                        <Mic size={10} /> Caller
                      </div>
                      {(callState === 'active' || callState === 'connecting') && (
                        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-lime/70 uppercase tracking-wider">
                          <Radio size={10} className="animate-pulse" /> Live Demo
                        </div>
                      )}
                    </div>

                    {/* Waveform */}
                    {(callState === 'active' || callState === 'complete') && (
                      <div className="flex items-center justify-center gap-0.5 h-8 mb-4">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <span
                            key={i}
                            className="wave-bar"
                            style={{
                              animationDelay: `${i * 0.05}s`,
                              animationDuration: agentSpeaking ? '0.8s' : callerSpeaking ? '1.2s' : '2s',
                              color: agentSpeaking ? '#B9FF32' : callerSpeaking ? '#A16BFF' : '#929A96',
                              opacity: agentSpeaking || callerSpeaking ? 0.8 : 0.3,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Dialogue */}
                    <div className="flex-1 space-y-3 overflow-hidden">
                      {selectedScenario.dialogue.slice(0, visibleLines).map((line, idx) => (
                        <div
                          key={idx}
                          className={`flex ${line.speaker === 'agent' ? 'justify-start' : 'justify-end'} animate-[fadeIn_0.4s_ease]`}
                          style={{ animation: 'fadeIn 0.4s ease' }}
                        >
                          <div className={`max-w-[80%] ${line.speaker === 'agent' ? 'ml-0' : 'ml-auto'}`}>
                            <div className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${
                              line.speaker === 'agent' ? 'text-lime/60' : 'text-violet/60'
                            }`}>
                              {line.speaker === 'agent' ? 'Heyrin' : 'Caller'}
                            </div>
                            <div className={`text-sm leading-relaxed px-3.5 py-2.5 rounded-xl ${
                              line.speaker === 'agent'
                                ? 'bg-ink-graphite/80 text-soft border border-ink-line'
                                : 'bg-violet/8 text-soft border border-violet/15'
                            }`}>
                              {line.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Outcome */}
                    {callState === 'complete' && (
                      <div className="mt-4 p-3.5 rounded-xl border border-lime/20 bg-lime/5 flex items-center gap-3" style={{ animation: 'fadeIn 0.5s ease' }}>
                        <CheckCircle2 size={18} className="text-lime flex-shrink-0" />
                        <div>
                          <div className="text-sm text-soft font-medium">{selectedScenario.outcome}</div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-silver/50 mt-0.5">
                            {selectedScenario.outcomeLabel}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom decorative bar */}
              <div className="h-1 bg-gradient-to-r from-lime/0 via-lime/30 to-lime/0" />
            </div>

            <p className="text-[10px] font-mono text-silver/30 uppercase tracking-wider mt-3 text-center">
              Interactive Demonstration — No live telephony connected
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
