import { useState, useEffect } from 'react';
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { useFadeUp } from '@/hooks/useReveal';

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  website: string;
  message: string;
  honeypot: string;
}

const EMPTY: FormData = {
  name: '',
  email: '',
  company: '',
  phone: '',
  website: '',
  message: '',
  honeypot: '',
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export function Contact() {
  const { ref, visible } = useFadeUp<HTMLDivElement>();
  const [data, setData] = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [emailConfigured, setEmailConfigured] = useState(true);

  const update = (field: keyof FormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (status === 'error') setStatus('idle');
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (data.name.trim().length < 2) errs.push('Name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.push('Valid business email is required');
    if (!data.message.trim()) errs.push('Please tell us what your AI agent should handle');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    const errs = validate();
    if (errs.length > 0) {
      setStatus('error');
      setErrorMsg(errs.join('. '));
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        setStatus('error');
        setErrorMsg('The contact form is being connected. Please use the email address shown alongside the form.');
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/contact-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus('error');
        setErrorMsg(result.error || 'Submission failed. Please try again.');
        return;
      }

      setStatus('success');
      setEmailConfigured(result.emailConfigured !== false);
      setData(EMPTY);
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again or email us directly.');
    }
  };

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setStatus('idle'), 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <section id="contact" className="heyrin-contact relative py-24 lg:py-32 bg-ink-deep overflow-hidden">
      <div className="absolute inset-0 tech-grid-fine opacity-20" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[400px] bg-lime/3 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-violet/3 rounded-full blur-[100px] pointer-events-none" />

      <div ref={ref} className={`relative max-w-[1100px] mx-auto px-6 lg:px-10 fade-up ${visible ? 'visible' : ''}`}>
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
          {/* Left — heading */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px bg-lime/60" />
              <span className="text-xs font-mono tracking-[0.2em] text-lime/80 uppercase">Contact</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight mb-4">
              Ready to give your<br />business a voice?
            </h2>
            <p className="text-sm text-silver/70 mb-8 leading-relaxed max-w-sm">
              Tell us about your business. Let's explore what Heyrin could handle for you.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ink-panel border border-ink-line flex items-center justify-center">
                  <Mail size={14} className="text-lime" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-silver/40 uppercase tracking-wider">Email us directly</div>
                  <a href="mailto:sierra@recoverrevenue.company" className="text-sm text-soft hover:text-lime transition-colors">
                    sierra@recoverrevenue.company
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-ink-line">
              <div className="text-[10px] font-mono text-silver/40 uppercase tracking-wider mb-2">Response time</div>
              <p className="text-xs text-silver/60">We typically respond within one business day.</p>
            </div>
          </div>

          {/* Right — form */}
          <div className="relative">
            <div className="relative bg-ink-panel/60 backdrop-blur-xl border border-ink-line rounded-2xl p-6 lg:p-8">
              <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-lime/40 to-transparent" />

              {status === 'success' ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={24} className="text-lime" />
                  </div>
                  <h3 className="text-lg font-medium text-soft mb-2">Inquiry received.</h3>
                  <p className="text-sm text-silver/70 max-w-xs mx-auto">
                    {emailConfigured
                      ? "Your message has been sent. We'll be in touch soon."
                      : "Your inquiry has been recorded. We'll be in touch soon."}
                  </p>
                  {!emailConfigured && (
                    <p className="text-[10px] font-mono text-silver/40 mt-4">
                      Email delivery is being configured — your inquiry is safely stored.
                    </p>
                  )}
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-xs text-silver/50 hover:text-silver transition-colors"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot — hidden from users */}
                  <input
                    type="text"
                    name="company_website"
                    value={data.honeypot}
                    onChange={(e) => update('honeypot', e.target.value)}
                    className="absolute opacity-0 pointer-events-none -z-10"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label="Name"
                      required
                      value={data.name}
                      onChange={(v) => update('name', v)}
                      placeholder="Jane Doe"
                    />
                    <Field
                      label="Business email"
                      required
                      type="email"
                      value={data.email}
                      onChange={(v) => update('email', v)}
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label="Company name"
                      value={data.company}
                      onChange={(v) => update('company', v)}
                      placeholder="Acme Inc."
                    />
                    <Field
                      label="Phone number"
                      optional
                      value={data.phone}
                      onChange={(v) => update('phone', v)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <Field
                    label="Business website"
                    optional
                    value={data.website}
                    onChange={(v) => update('website', v)}
                    placeholder="https://company.com"
                  />

                  <div>
                    <label htmlFor="heyrin-contact-message" className="block text-xs font-mono tracking-wider text-silver/50 uppercase mb-1.5">
                      What should your AI agent handle? <span className="text-lime">*</span>
                    </label>
                    <textarea
                      id="heyrin-contact-message"
                      required
                      value={data.message}
                      onChange={(e) => update('message', e.target.value)}
                      placeholder="Answering calls, booking appointments, qualifying leads..."
                      rows={4}
                      className="w-full bg-ink-deep/60 border border-ink-line rounded-xl px-4 py-3 text-sm text-soft placeholder:text-silver/30 focus:border-lime/30 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5" style={{ animation: 'fadeIn 0.3s ease' }}>
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300/90">{errorMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="magnetic-btn w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-lime text-ink-base font-medium text-sm rounded-xl hover:bg-lime-glow transition-all duration-300 hover:shadow-[0_0_24px_rgba(185,255,50,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Build My AI Agent
                        <ArrowUpRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] font-mono text-silver/30 text-center uppercase tracking-wider">
                    We respect your privacy — no spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
}

function Field({ label, value, onChange, placeholder, type = 'text', required, optional }: FieldProps) {
  const id = `heyrin-contact-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-mono tracking-wider text-silver/50 uppercase mb-1.5">
        {label}
        {required && <span className="text-lime"> *</span>}
        {optional && <span className="text-silver/30"> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ink-deep/60 border border-ink-line rounded-xl px-4 py-2.5 text-sm text-soft placeholder:text-silver/30 focus:border-lime/30 focus:outline-none transition-colors"
      />
    </div>
  );
}
