'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['login', 'register'];

/* ── Eye icon SVG — show / hide ──────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* ── Password field with show/hide toggle ────────────────────── */
function PasswordInput({ id, value, onChange, placeholder, style, className, required, label, labelStyle, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          className={className}
          style={{ ...style, paddingRight: '46px' }}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={id.includes('confirm') ? 'new-password' : id.includes('register') ? 'new-password' : 'current-password'}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: show ? 'rgba(212,175,55,0.8)' : 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', transition: 'color 0.2s',
            borderRadius: '4px',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(212,175,55,0.9)'}
          onMouseLeave={e => e.currentTarget.style.color = show ? 'rgba(212,175,55,0.8)' : 'rgba(255,255,255,0.3)'}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {hint && <p style={{ fontFamily:"'Cinzel',serif", fontSize:'9px', letterSpacing:'1px', color:'rgba(255,255,255,0.25)', marginTop:'4px' }}>{hint}</p>}
    </div>
  );
}

/* ── Password strength meter ─────────────────────────────────── */
function StrengthMeter({ password }) {
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i <= score ? colors[score] : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }}/>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:'9px', letterSpacing:'1px', color: colors[score] || 'rgba(255,255,255,0.25)' }}>
          {labels[score] || 'Enter password'}
        </p>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { check: password.length >= 8,     tip: '8+ chars'  },
            { check: /[A-Z]/.test(password),   tip: 'A-Z'       },
            { check: /[0-9]/.test(password),   tip: '0-9'       },
            { check: /[^A-Za-z0-9]/.test(password), tip: '@#!'  },
          ].map(({ check, tip }) => (
            <span key={tip} style={{ fontFamily:"'Cinzel',serif", fontSize:'8px', letterSpacing:'0.5px', color: check ? '#22c55e' : 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}>
              {check ? '✓' : '○'} {tip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export default function LoginGateway() {
  const router  = useRouter();
  const [mode, setMode]     = useState('choose');
  const [tab, setTab]       = useState('login');
  const [lang, setLang]     = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [mounted, setMounted] = useState(false);

  const [loginForm, setLoginForm]       = useState({ phone: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ full_name: '', phone: '', email: '', password: '', confirm: '' });
  const [adminForm, setAdminForm]       = useState({ username: '', password: '' });

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const copy = {
    en: { choose:'Who are you?', victim:'Citizen / Victim', admin:'Police Officer', login:'Sign In', register:'Register', name:'Full Name', phone:'Phone Number', email:'Email (optional)', pass:'Password', confirm:'Confirm Password', username:'Username', loginBtn:'Sign In', regBtn:'Create Account', adminBtn:'Officer Login', backBtn:'← Back', phoneHint:'10-digit mobile number', passHint:'Min 6 chars · use A-Z, 0-9, symbols for strength', noAcc:"Don't have an account?", hasAcc:'Already have an account?' },
    hi: { choose:'आप कौन हैं?', victim:'नागरिक / पीड़ित', admin:'पुलिस अधिकारी', login:'साइन इन', register:'रजिस्टर', name:'पूरा नाम', phone:'फोन नंबर', email:'ईमेल (वैकल्पिक)', pass:'पासवर्ड', confirm:'पासवर्ड दोहराएं', username:'उपयोगकर्ता नाम', loginBtn:'साइन इन करें', regBtn:'खाता बनाएं', adminBtn:'अधिकारी लॉगिन', backBtn:'← वापस', phoneHint:'10 अंकों का नंबर', passHint:'कम से कम 6 अक्षर', noAcc:'खाता नहीं है?', hasAcc:'पहले से खाता है?' },
    te: { choose:'మీరు ఎవరు?', victim:'పౌరుడు / పీడితుడు', admin:'పోలీస్ అధికారి', login:'సైన్ ఇన్', register:'నమోదు', name:'పూర్తి పేరు', phone:'ఫోన్ నంబర్', email:'ఇమెయిల్ (ఐచ్ఛికం)', pass:'పాస్‌వర్డ్', confirm:'పాస్‌వర్డ్ నిర్ధారించండి', username:'వినియోగదారు పేరు', loginBtn:'సైన్ ఇన్ చేయండి', regBtn:'ఖాతా సృష్టించండి', adminBtn:'అధికారి లాగిన్', backBtn:'← వెనుకకు', phoneHint:'10 అంకెల నంబర్', passHint:'కనీసం 6 అక్షరాలు', noAcc:'ఖాతా లేదా?', hasAcc:'ఇప్పటికే ఖాతా ఉందా?' },
  };
  const t = copy[lang];

  const handleVictimLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/users', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(loginForm) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        localStorage.setItem('lang', data.user.preferred_language);
        router.push('/citizen');
      } else setError(data.error || 'Login failed');
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const handleVictimRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    if (registerForm.password !== registerForm.confirm) { setError('Passwords do not match'); setLoading(false); return; }
    if (registerForm.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    try {
      const res = await fetch('/api/users', { method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ full_name:registerForm.full_name, phone:registerForm.phone, email:registerForm.email, password:registerForm.password, preferred_language:lang }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        localStorage.setItem('lang', lang);
        router.push('/citizen');
      } else setError(data.error || 'Registration failed');
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(adminForm) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else setError(data.error || 'Invalid credentials');
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  };

  const inputStyle = { width:'100%', padding:'13px 16px', borderRadius:'10px', fontSize:'15px', fontFamily:"'Crimson Pro', serif", outline:'none', transition:'all 0.2s', background:'#0a0e1a', border:'1px solid rgba(212,175,55,0.2)', color:'#e2e8f0' };
  const labelStyle = { display:'block', fontFamily:"'Cinzel', serif", fontSize:'10px', letterSpacing:'2px', color:'rgba(212,175,55,0.6)', marginBottom:'6px' };

  const resetMode = () => { setMode('choose'); setError(''); };

  return (
    <div style={{ minHeight:'100vh', background:'#070b16', display:'flex', flexDirection:'column', fontFamily:'serif', position:'relative', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .gw-input{transition:all 0.2s;}
        .gw-input:focus{border-color:rgba(212,175,55,0.6)!important;box-shadow:0 0 0 3px rgba(212,175,55,0.08);}
        .gw-input::placeholder{color:rgba(226,232,240,0.25);}
        .portal-card{cursor:pointer;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);}
        .portal-card:hover{transform:translateY(-6px);}
        .portal-card.citizen:hover{box-shadow:0 24px 60px rgba(59,130,246,0.25);border-color:rgba(59,130,246,0.5)!important;}
        .portal-card.police:hover{box-shadow:0 24px 60px rgba(212,175,55,0.2);border-color:rgba(212,175,55,0.5)!important;}
        .auth-card{animation:slideUp 0.4s ease forwards;}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .tab-btn{flex:1;padding:11px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;cursor:pointer;transition:all 0.25s;border:none;border-bottom:2px solid transparent;background:transparent;color:rgba(255,255,255,0.3);}
        .tab-btn.active{border-bottom-color:#d4af37;color:#d4af37;background:rgba(212,175,55,0.06);}
        .lang-pill{font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;padding:6px 14px;border-radius:20px;cursor:pointer;transition:all 0.2s;border:1px solid;}
        .submit-btn{width:100%;padding:15px;border-radius:10px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:3px;cursor:pointer;transition:all 0.3s;font-weight:700;border:none;}
        .submit-btn:hover:not(:disabled){transform:translateY(-2px);}
        .submit-btn:active{transform:scale(0.98);}
        .submit-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .star{position:absolute;border-radius:50%;animation:twinkle 3s ease-in-out infinite;}
        @keyframes twinkle{0%,100%{opacity:0.15}50%{opacity:0.6}}
        .fade-mount{opacity:0;transition:opacity 0.6s ease;}
        .fade-mount.mounted{opacity:1;}
        .err-box{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-family:'Crimson Pro',serif;font-size:14px;color:#f87171;display:flex;align-items:center;gap:8px;}
        .divider{display:flex;align-items:center;gap:10px;margin:2px 0;}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.07);}
        .divider span{font-family:'Cinzel',serif;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:2px;}
      `}</style>

      {/* Stars */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        {[...Array(16)].map((_,i) => (
          <div key={i} className="star" style={{ width:(Math.random()*2+1)+'px', height:(Math.random()*2+1)+'px', background:i%3===0?'#93c5fd':i%3===1?'#d4af37':'#fff', top:(Math.random()*100)+'%', left:(Math.random()*100)+'%', animationDelay:(Math.random()*3)+'s', animationDuration:(2+Math.random()*3)+'s' }}/>
        ))}
        <div style={{ position:'absolute', top:'-15%', left:'50%', transform:'translateX(-50%)', width:'700px', height:'400px', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(212,175,55,0.05) 0%,transparent 70%)' }}/>
      </div>

      {/* Header */}
      <header style={{ position:'relative', zIndex:10, textAlign:'center', padding:'24px 24px 18px', borderBottom:'1px solid rgba(212,175,55,0.1)' }}>
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:'9px', letterSpacing:'5px', color:'rgba(212,175,55,0.4)', marginBottom:'6px' }}>GOVERNMENT OF INDIA · ANDHRA PRADESH POLICE</p>
        <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'clamp(16px,3vw,26px)', color:'#d4af37', fontWeight:900, letterSpacing:'3px' }}>CITIZEN SAFETY PORTAL</h1>
        <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'14px' }}>
          {[['en','🇬🇧 EN'],['hi','🇮🇳 HI'],['te','🌟 TE']].map(([code,label]) => (
            <button key={code} className="lang-pill" onClick={() => setLang(code)}
              style={{ background:lang===code?'rgba(212,175,55,0.15)':'transparent', borderColor:lang===code?'rgba(212,175,55,0.5)':'rgba(255,255,255,0.1)', color:lang===code?'#d4af37':'rgba(255,255,255,0.3)' }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className={`fade-mount${mounted?' mounted':''}`} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 20px', position:'relative', zIndex:10 }}>

        {/* ── CHOOSE ── */}
        {mode === 'choose' && (
          <div style={{ width:'100%', maxWidth:'600px', textAlign:'center' }}>
            <p style={{ fontFamily:"'Cinzel',serif", fontSize:'12px', letterSpacing:'4px', color:'rgba(212,175,55,0.45)', marginBottom:'28px' }}>{t.choose.toUpperCase()}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
              <div className="portal-card citizen" onClick={() => setMode('victim')}
                style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'20px', padding:'40px 24px 32px' }}>
                <div style={{ fontSize:'48px', marginBottom:'16px' }}>🤝</div>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', color:'#93c5fd', fontWeight:700, letterSpacing:'2px', marginBottom:'8px' }}>{t.victim}</h2>
                <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:'13px', color:'rgba(147,197,253,0.5)', lineHeight:1.6, marginBottom:'18px' }}>
                  {lang==='en'?'File a complaint, track your case, get help.':lang==='hi'?'शिकायत दर्ज करें, केस ट्रैक करें।':'ఫిర్యాదు దాఖలు చేయండి.'}
                </p>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'10px', letterSpacing:'3px', color:'#60a5fa', background:'rgba(59,130,246,0.12)', padding:'8px 16px', borderRadius:'6px', display:'inline-block' }}>
                  {t.login} / {t.register} →
                </div>
              </div>
              <div className="portal-card police" onClick={() => setMode('admin')}
                style={{ background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.18)', borderRadius:'20px', padding:'40px 24px 32px' }}>
                <div style={{ fontSize:'48px', marginBottom:'16px' }}>🛡️</div>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', color:'#d4af37', fontWeight:700, letterSpacing:'2px', marginBottom:'8px' }}>{t.admin}</h2>
                <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:'13px', color:'rgba(212,175,55,0.45)', lineHeight:1.6, marginBottom:'18px' }}>
                  {lang==='en'?'Command center & complaint management.':lang==='hi'?'कमांड सेंटर और केस प्रबंधन।':'కమాండ్ సెంటర్ యాక్సెస్.'}
                </p>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'10px', letterSpacing:'3px', color:'#d4af37', background:'rgba(212,175,55,0.1)', padding:'8px 16px', borderRadius:'6px', display:'inline-block' }}>
                  {t.login} →
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CITIZEN AUTH ── */}
        {mode === 'victim' && (
          <div className="auth-card" style={{ width:'100%', maxWidth:'440px' }}>
            <button onClick={resetMode} style={{ background:'transparent', border:'none', color:'rgba(212,175,55,0.5)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'2px', marginBottom:'20px', padding:0 }}>{t.backBtn}</button>

            <div style={{ background:'#111827', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'18px', overflow:'hidden' }}>
              {/* Tabs */}
              <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                {TABS.map(tb => (
                  <button key={tb} className={`tab-btn${tab===tb?' active':''}`} onClick={() => { setTab(tb); setError(''); }}>
                    {tb === 'login' ? t.loginBtn.toUpperCase() : t.regBtn.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ padding:'24px 28px 22px' }}>
                <div style={{ textAlign:'center', marginBottom:'20px' }}>
                  <div style={{ fontSize:'26px', marginBottom:'6px' }}>🤝</div>
                  <p style={{ fontFamily:"'Cinzel',serif", fontSize:'10px', letterSpacing:'3px', color:'#93c5fd' }}>{t.victim.toUpperCase()}</p>
                </div>

                {error && <div className="err-box">⚠️ {error}</div>}

                {/* LOGIN */}
                {tab === 'login' && (
                  <form onSubmit={handleVictimLogin} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                    <div>
                      <label style={labelStyle}>{t.phone.toUpperCase()}</label>
                      <input className="gw-input" style={inputStyle} type="tel" placeholder="9876543210"
                        value={loginForm.phone} onChange={e=>setLoginForm(p=>({...p,phone:e.target.value}))} required/>
                    </div>

                    <PasswordInput
                      id="login-pass"
                      value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••"
                      style={inputStyle}
                      className="gw-input"
                      required
                      label={t.pass.toUpperCase()}
                      labelStyle={labelStyle}
                    />

                    <button className="submit-btn" type="submit" disabled={loading}
                      style={{ background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff', marginTop:'4px' }}>
                      {loading ? '⏳ Signing in...' : `🔓 ${t.loginBtn}`}
                    </button>

                    <p style={{ textAlign:'center', fontFamily:"'Crimson Pro',serif", fontSize:'13px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>
                      {t.noAcc}{' '}
                      <button type="button" onClick={()=>setTab('register')} style={{ background:'none', border:'none', color:'#93c5fd', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'1px' }}>
                        {t.regBtn}
                      </button>
                    </p>
                  </form>
                )}

                {/* REGISTER */}
                {tab === 'register' && (
                  <form onSubmit={handleVictimRegister} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    <div>
                      <label style={labelStyle}>{t.name.toUpperCase()}</label>
                      <input className="gw-input" style={inputStyle} type="text" placeholder="Ravi Kumar"
                        value={registerForm.full_name} onChange={e=>setRegisterForm(p=>({...p,full_name:e.target.value}))} required/>
                    </div>
                    <div>
                      <label style={labelStyle}>{t.phone.toUpperCase()}</label>
                      <input className="gw-input" style={inputStyle} type="tel" placeholder="9876543210"
                        value={registerForm.phone} onChange={e=>setRegisterForm(p=>({...p,phone:e.target.value}))} required/>
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:'9px', letterSpacing:'1px', color:'rgba(255,255,255,0.25)', marginTop:'4px' }}>{t.phoneHint}</p>
                    </div>
                    <div>
                      <label style={labelStyle}>{t.email.toUpperCase()}</label>
                      <input className="gw-input" style={inputStyle} type="email" placeholder="ravi@email.com"
                        value={registerForm.email} onChange={e=>setRegisterForm(p=>({...p,email:e.target.value}))}/>
                    </div>

                    <PasswordInput
                      id="register-pass"
                      value={registerForm.password}
                      onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      style={inputStyle}
                      className="gw-input"
                      required
                      label={t.pass.toUpperCase()}
                      labelStyle={labelStyle}
                      hint={t.passHint}
                    />

                    {/* Strength meter appears as soon as user types */}
                    <StrengthMeter password={registerForm.password} />

                    <PasswordInput
                      id="register-confirm"
                      value={registerForm.confirm}
                      onChange={e => setRegisterForm(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Re-enter password"
                      style={{
                        ...inputStyle,
                        borderColor: registerForm.confirm && registerForm.confirm !== registerForm.password
                          ? 'rgba(239,68,68,0.5)'
                          : registerForm.confirm && registerForm.confirm === registerForm.password
                          ? 'rgba(34,197,94,0.5)'
                          : 'rgba(212,175,55,0.2)',
                      }}
                      className="gw-input"
                      required
                      label={t.confirm.toUpperCase()}
                      labelStyle={labelStyle}
                    />

                    {/* Match indicator */}
                    {registerForm.confirm && (
                      <p style={{ fontFamily:"'Cinzel',serif", fontSize:'9px', letterSpacing:'1px', marginTop:'-4px', color: registerForm.confirm === registerForm.password ? '#22c55e' : '#ef4444' }}>
                        {registerForm.confirm === registerForm.password ? '✓ Passwords match' : '✕ Passwords do not match'}
                      </p>
                    )}

                    <button className="submit-btn" type="submit" disabled={loading}
                      style={{ background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff', marginTop:'4px' }}>
                      {loading ? '⏳ Creating account...' : `✨ ${t.regBtn}`}
                    </button>

                    <p style={{ textAlign:'center', fontFamily:"'Crimson Pro',serif", fontSize:'13px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>
                      {t.hasAcc}{' '}
                      <button type="button" onClick={()=>setTab('login')} style={{ background:'none', border:'none', color:'#93c5fd', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'1px' }}>
                        {t.loginBtn}
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN AUTH ── */}
        {mode === 'admin' && (
          <div className="auth-card" style={{ width:'100%', maxWidth:'380px' }}>
            <button onClick={resetMode} style={{ background:'transparent', border:'none', color:'rgba(212,175,55,0.5)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'2px', marginBottom:'20px', padding:0 }}>{t.backBtn}</button>

            <div style={{ background:'#111827', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'18px', padding:'32px 28px 24px' }}>
              <div style={{ textAlign:'center', marginBottom:'24px' }}>
                <div style={{ fontSize:'30px', marginBottom:'8px' }}>🛡️</div>
                <p style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'3px', color:'#d4af37' }}>{t.admin.toUpperCase()}</p>
                <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:'13px', color:'rgba(255,255,255,0.25)', marginTop:'4px' }}>Authorized personnel only</p>
              </div>

              {error && <div className="err-box">⚠️ {error}</div>}

              <form onSubmit={handleAdminLogin} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>{t.username.toUpperCase()}</label>
                  <input className="gw-input" style={inputStyle} type="text" placeholder="admin"
                    value={adminForm.username} onChange={e=>setAdminForm(p=>({...p,username:e.target.value}))} required/>
                </div>

                <PasswordInput
                  id="admin-pass"
                  value={adminForm.password}
                  onChange={e => setAdminForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  style={inputStyle}
                  className="gw-input"
                  required
                  label={t.pass.toUpperCase()}
                  labelStyle={labelStyle}
                />

                <button className="submit-btn" type="submit" disabled={loading}
                  style={{ background:'linear-gradient(135deg,#d4af37,#b8962e)', color:'#0a0e1a', marginTop:'4px' }}>
                  {loading ? '⏳ Authenticating...' : `🔑 ${t.adminBtn}`}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      <footer style={{ position:'relative', zIndex:10, textAlign:'center', padding:'12px', borderTop:'1px solid rgba(212,175,55,0.07)' }}>
        <p style={{ fontFamily:"'Cinzel',serif", fontSize:'8px', letterSpacing:'3px', color:'rgba(255,255,255,0.12)' }}>
          © {new Date().getFullYear()} AP POLICE · AI-POWERED COMPLAINT SYSTEM · ALL SESSIONS ENCRYPTED
        </p>
      </footer>
    </div>
  );
}
