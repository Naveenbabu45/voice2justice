'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const steps = [
  { icon: '🌐', title: 'Choose Language',   desc: 'Telugu, Hindi, or English — speak in your mother tongue.' },
  { icon: '🤝', title: 'Talk to AI Officer', desc: 'Our AI guides you step-by-step. No complicated forms.' },
  { icon: '✅', title: 'Complaint Filed',    desc: 'Get a unique Complaint ID instantly. Fully confidential.' },
  { icon: '🔍', title: 'Track Progress',     desc: 'Check your complaint status anytime using your ID.' },
];

const rights = [
  { title: 'Right to File',  desc: 'Every citizen has the legal right to file a complaint. No one can stop you.' },
  { title: 'Confidentiality', desc: 'Your personal information is fully protected and never shared publicly.' },
  { title: 'Free Service',   desc: 'Filing a police complaint is completely free. No charges whatsoever.' },
  { title: 'Equal Justice',  desc: 'Every complaint is treated equally, regardless of caste, gender, or status.' },
];

const emergencies = [
  { label: 'Police Emergency', number: '100',  color: '#ef4444' },
  { label: 'Women Helpline',   number: '1091', color: '#ec4899' },
  { label: 'Child Helpline',   number: '1098', color: '#f59e0b' },
  { label: 'Cyber Crime',      number: '1930', color: '#3b82f6' },
];

const langCopy = {
  en: {
    title: 'We Are Here For You',
    sub: 'File your police complaint safely, securely, and in your own language. Our AI officer guides you through every step.',
    file: 'File a Complaint',
    track: 'Track My Complaint',
    emergency: 'Emergency Numbers',
    howTitle: 'How It Works',
    rightsTitle: 'Your Rights as a Citizen',
    safe: 'Your complaint is safe, confidential, and legally protected.',
    badge: 'SECURE · CONFIDENTIAL · FREE',
  },
  hi: {
    title: 'हम आपके साथ हैं',
    sub: 'अपनी पुलिस शिकायत अपनी भाषा में सुरक्षित रूप से दर्ज करें। हमारा AI अधिकारी हर कदम पर आपका मार्गदर्शन करेगा।',
    file: 'शिकायत दर्ज करें',
    track: 'शिकायत ट्रैक करें',
    emergency: 'आपातकालीन नंबर',
    howTitle: 'यह कैसे काम करता है',
    rightsTitle: 'एक नागरिक के रूप में आपके अधिकार',
    safe: 'आपकी शिकायत सुरक्षित, गोपनीय और कानूनी रूप से संरक्षित है।',
    badge: 'सुरक्षित · गोपनीय · निःशुल्क',
  },
  te: {
    title: 'మీతో మేమున్నాము',
    sub: 'మీ పోలీస్ ఫిర్యాదును మీ భాషలో సురక్షితంగా దాఖలు చేయండి. మా AI అధికారి ప్రతి దశలో మీకు మార్గదర్శకత్వం చేస్తారు.',
    file: 'ఫిర్యాదు దాఖలు',
    track: 'ఫిర్యాదు ట్రాక్',
    emergency: 'అత్యవసర నంబర్లు',
    howTitle: 'ఇది ఎలా పని చేస్తుంది',
    rightsTitle: 'పౌరుడిగా మీ హక్కులు',
    safe: 'మీ ఫిర్యాదు సురక్షితంగా, గోప్యంగా మరియు చట్టపరంగా రక్షించబడుతుంది.',
    badge: 'సురక్షిత · గోప్య · ఉచిత',
  },
};

export default function CitizenPage() {
  const router = useRouter();
  const [lang, setLang]   = useState('en');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved) setLang(saved);
    const t = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 3000);
    return () => clearInterval(t);
  }, []);

  const t = langCopy[lang];

  const handleFile = () => {
    localStorage.setItem('lang', lang);
    router.push('/chat');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#060f1e', fontFamily: 'serif', color: '#e2e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,300;8..60,400;8..60,600&family=Cinzel:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        .c-nav { background: rgba(6,15,30,0.92); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50; border-bottom: 1px solid rgba(147,197,253,0.12); }
        .c-lang-btn { font-family:'Cinzel',serif; font-size:10px; letter-spacing:2px; padding:7px 14px; border-radius:20px; cursor:pointer; transition:all 0.25s; border:1px solid; }
        .c-btn-primary { background: linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; border:none; padding:17px 42px; border-radius:50px; font-family:'Cinzel',serif; font-size:12px; letter-spacing:2px; cursor:pointer; transition:all 0.3s; box-shadow:0 8px 32px rgba(37,99,235,0.45); }
        .c-btn-primary:hover { transform:translateY(-3px); box-shadow:0 16px 50px rgba(37,99,235,0.55); }
        .c-btn-ghost { background:transparent; color:#93c5fd; border:1px solid rgba(147,197,253,0.35); padding:17px 42px; border-radius:50px; font-family:'Cinzel',serif; font-size:12px; letter-spacing:2px; cursor:pointer; transition:all 0.3s; }
        .c-btn-ghost:hover { background:rgba(147,197,253,0.08); transform:translateY(-3px); }
        .c-step-card { background:rgba(255,255,255,0.03); border:1px solid rgba(147,197,253,0.1); border-radius:16px; padding:24px 20px; transition:all 0.5s; }
        .c-step-card.active { background:rgba(37,99,235,0.1); border-color:rgba(59,130,246,0.45); transform:translateY(-5px); box-shadow:0 16px 48px rgba(37,99,235,0.2); }
        .c-right-card { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:20px; transition:all 0.3s; }
        .c-right-card:hover { background:rgba(147,197,253,0.05); border-color:rgba(147,197,253,0.2); transform:translateY(-2px); }
        .c-em-card { border-radius:12px; padding:16px 12px; text-align:center; cursor:pointer; border:1px solid; transition:all 0.3s; text-decoration:none; display:block; }
        .c-em-card:hover { transform:translateY(-3px); }
        @keyframes cFadeIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .c-hero { animation: cFadeIn 0.9s ease forwards; }
        @keyframes pulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        .c-pulse { animation: pulse 2.2s ease-in-out infinite; }
        .c-gradient-text { background: linear-gradient(135deg,#93c5fd 0%,#60a5fa 50%,#818cf8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .c-wave { position:absolute; bottom:0; left:0; right:0; height:120px; background:linear-gradient(180deg,transparent,rgba(37,99,235,0.04)); pointer-events:none; }
      `}</style>

      {/* Nav */}
      <nav className="c-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', padding: '4px 8px' }}>←</button>
          <span style={{ fontSize: '18px' }}>🤝</span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: '12px', letterSpacing: '2px', color: '#93c5fd' }}>CITIZEN PORTAL</span>
          <span style={{ fontFamily: "'Source Serif 4',serif", fontSize: '11px', color: 'rgba(100,116,139,0.6)', marginLeft: '4px' }}>పౌర పోర్టల్ · नागरिक पोर्टल</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['en','🇬🇧 EN'],['hi','🇮🇳 हि'],['te','🌟 తె']].map(([code,label]) => (
            <button key={code} className="c-lang-btn" onClick={() => setLang(code)}
              style={{ background: lang===code ? 'rgba(37,99,235,0.2)' : 'transparent', borderColor: lang===code ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: lang===code ? '#93c5fd' : '#64748b' }}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '80px 32px 60px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '500px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)' }}/>
          <div style={{ position: 'absolute', top: '20%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }}/>
        </div>
        <div className="c-hero" style={{ position: 'relative', zIndex: 1 }}>
          {/* Trust badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '50px', padding: '6px 20px', marginBottom: '36px' }}>
            <div className="c-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }}/>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: '9px', letterSpacing: '3px', color: '#22c55e' }}>{t.badge}</span>
          </div>

          <h1 className="c-gradient-text" style={{ fontFamily: "'Lora',serif", fontSize: 'clamp(30px,5vw,62px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '22px' }}>
            {t.title}
          </h1>
          <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: 'clamp(15px,2vw,19px)', color: 'rgba(226,232,240,0.55)', maxWidth: '580px', margin: '0 auto 44px', lineHeight: 1.75 }}>
            {t.sub}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="c-btn-primary" onClick={handleFile}>💬 {t.file}</button>
            <button className="c-btn-ghost" onClick={() => router.push('/track')}>🔍 {t.track}</button>
          </div>
        </div>
        <div className="c-wave"/>
      </section>

      {/* Emergency Numbers */}
      <section style={{ padding: '20px 32px 48px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '20px', padding: '28px 32px' }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '3px', color: '#f87171', marginBottom: '20px', textAlign: 'center' }}>
            🚨 {t.emergency}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px' }}>
            {emergencies.map(e => (
              <a key={e.number} href={`tel:${e.number}`} className="c-em-card"
                style={{ background: `${e.color}12`, borderColor: `${e.color}35`, color: e.color }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '26px', fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>{e.number}</div>
                <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: '12px', color: 'rgba(226,232,240,0.55)' }}>{e.label}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '20px 32px 60px', maxWidth: '860px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '5px', color: '#4a5380', textAlign: 'center', marginBottom: '28px' }}>
          {t.howTitle.toUpperCase()}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '14px' }}>
          {steps.map((s, i) => (
            <div key={i} className={`c-step-card${activeStep === i ? ' active' : ''}`}>
              <div style={{ fontSize: '30px', marginBottom: '14px' }}>{s.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel',serif", fontSize: '9px', color: '#93c5fd', flexShrink: 0 }}>{i+1}</div>
                <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '1px', color: '#93c5fd' }}>{s.title}</h3>
              </div>
              <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: '14px', color: 'rgba(226,232,240,0.5)', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rights */}
      <section style={{ padding: '20px 32px 80px', maxWidth: '860px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '5px', color: '#4a5380', textAlign: 'center', marginBottom: '28px' }}>
          {t.rightsTitle.toUpperCase()}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '12px', marginBottom: '40px' }}>
          {rights.map(r => (
            <div key={r.title} className="c-right-card">
              <h4 style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', letterSpacing: '2px', color: '#93c5fd', marginBottom: '8px' }}>⚖️ {r.title.toUpperCase()}</h4>
              <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: '14px', color: 'rgba(226,232,240,0.5)', lineHeight: 1.65 }}>{r.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '20px', borderRadius: '14px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', letterSpacing: '3px', color: 'rgba(147,197,253,0.45)' }}>🔒 {t.safe}</p>
        </div>
      </section>

      {/* CTA Footer */}
      <div style={{ background: 'rgba(37,99,235,0.06)', borderTop: '1px solid rgba(37,99,235,0.15)', padding: '48px 32px', textAlign: 'center' }}>
        <h3 style={{ fontFamily: "'Lora',serif", fontSize: '24px', color: '#93c5fd', marginBottom: '8px' }}>
          {lang === 'en' ? 'Ready to file your complaint?' : lang === 'hi' ? 'शिकायत दर्ज करने के लिए तैयार हैं?' : 'ఫిర్యాదు దాఖలు చేయడానికి సిద్ధంగా ఉన్నారా?'}
        </h3>
        <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: '15px', color: 'rgba(226,232,240,0.45)', marginBottom: '28px' }}>
          {lang === 'en' ? 'Takes less than 5 minutes. Our AI officer will guide you.' : lang === 'hi' ? '5 मिनट से कम समय लगता है। हमारा AI अधिकारी आपका मार्गदर्शन करेगा।' : '5 నిమిషాల కంటే తక్కువ సమయం. మా AI అధికారి మీకు మార్గదర్శకత్వం చేస్తారు.'}
        </p>
        <button className="c-btn-primary" onClick={handleFile} style={{ fontSize: '14px', padding: '18px 56px' }}>
          💬 {t.file} →
        </button>
      </div>
    </div>
  );
}
