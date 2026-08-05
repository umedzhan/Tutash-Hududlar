import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sun, Moon, RotateCcw, Landmark, User } from 'lucide-react';
import { KB, CHIPS, DISTRICTS, findAnswer, FALLBACK, cap } from './kb';
import './chatbot.css';

interface Message {
  id: number;
  who: 'bot' | 'user';
  html: string;
}

function escapeHtml(s: string): string {
  return s.replace(/</g, '&lt;');
}

let nextId = 0;

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [awaitingDistrict, setAwaitingDistrict] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  function addMsg(html: string, who: Message['who']) {
    setMessages((prev) => [...prev, { id: ++nextId, who, html }]);
  }

  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      setAwaitingDistrict(false);
      addMsg(KB[0].a(), 'bot');
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  function resetChat() {
    setMessages([]);
    setAwaitingDistrict(false);
    setTyping(false);
    addMsg(KB[0].a(), 'bot');
  }

  function send(text?: string) {
    const v = (text ?? input).trim();
    if (!v) return;
    addMsg(escapeHtml(v), 'user');
    setInput('');
    setTyping(true);
    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      setTyping(false);
      const result = findAnswer(v, awaitingDistrict);
      if (result) {
        addMsg(result.html, 'bot');
        setAwaitingDistrict(result.nextAwaitingDistrict);
      } else {
        addMsg(FALLBACK(), 'bot');
        setAwaitingDistrict(false);
      }
    }, delay);
  }

  const chips = awaitingDistrict ? Object.keys(DISTRICTS).map((n) => cap(n)) : null;

  return (
    <div className="chat-widget" data-theme={theme}>
      {open && (
        <div className="cw-app">
          <div className="cw-head">
            <div className="cw-bot-avatar">
              <Landmark size={19} color="#fff" />
            </div>
            <div className="cw-head-info">
              <div className="cw-head-title">Tutash Hududlar — Yordamchi</div>
              <div className="cw-head-sub">
                <span className="cw-online-dot" /> Onlayn · surxondaryo-th.uz
              </div>
            </div>
            <button type="button" className="cw-head-btn" title="Tungi/kunduzgi rejim" onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button type="button" className="cw-head-btn" title="Suhbatni tozalash" onClick={resetChat}>
              <RotateCcw size={15} />
            </button>
            <button type="button" className="cw-head-btn" title="Yopish" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="cw-body" ref={bodyRef}>
            {messages.map((m) => (
              <div key={m.id} className={`cw-msg ${m.who}`}>
                <div className="cw-m-avatar">{m.who === 'bot' ? <Landmark size={13} /> : <User size={13} />}</div>
                <div className="cw-bubble" dangerouslySetInnerHTML={{ __html: m.html }} />
              </div>
            ))}
            {typing && (
              <div className="cw-msg bot">
                <div className="cw-m-avatar">
                  <Landmark size={13} />
                </div>
                <div className="cw-bubble">
                  <div className="cw-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="cw-chips">
            {(chips ? chips.map((t) => ({ t, q: t })) : CHIPS).map((c) => (
              <button key={c.t} type="button" className="cw-chip" onClick={() => send(c.q)}>
                {c.t}
              </button>
            ))}
          </div>

          <div className="cw-foot">
            <input
              className="cw-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send();
              }}
              placeholder="Savolingizni yozing… (masalan: ijara to‘lovi qancha?)"
              autoComplete="off"
            />
            <button type="button" className="cw-send-btn" onClick={() => send()} aria-label="Yuborish">
              <Send size={17} />
            </button>
          </div>
        </div>
      )}

      <button type="button" className="cw-launcher" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Chatni yopish' : 'Yordamchi bot'}>
        {open ? <X size={24} /> : <MessageCircle size={26} />}
        {!open && <span className="cw-dot" />}
      </button>
    </div>
  );
}
