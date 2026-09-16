'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LANGUAGES, INITIAL_MESSAGES, COMPLAINT_TYPE_LABELS } from '@/lib/constants';

/* ── Helpers ─────────────────────────────────────────────────── */
function formatMsg(text) {
  return text.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#d4af37">$1</strong>').replace(/\n/g,'<br/>');
}
function clean(text) { return text.replace(/<[^>]+>/g,'').replace(/\*\*/g,'').trim(); }

/* ── Voice Map ───────────────────────────────────────────────── */
const VOICE_MAP = { en:['en-IN','en-GB','en-US'], hi:['hi-IN','hi'], te:['te-IN','te'] };

/* ── Mic Hook ────────────────────────────────────────────────── */
function useMicRecorder({ onTranscript, lang }) {
  const [recording,setRecording]=useState(false);
  const [supported,setSupported]=useState(false);
  const [micError,setMicError]=useState('');
  const recRef=useRef(null);
  const lmap={en:'en-IN',hi:'hi-IN',te:'te-IN'};
  useEffect(()=>{ setSupported(!!(window.SpeechRecognition||window.webkitSpeechRecognition)); },[]);
  const start=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setMicError('Voice input not supported in this browser.');return;}
    const r=new SR(); r.lang=lmap[lang]||'en-IN'; r.interimResults=true; r.continuous=false;
    r.onstart=()=>{setRecording(true);setMicError('');};
    r.onend=()=>setRecording(false);
    r.onerror=(e)=>{setRecording(false);setMicError(e.error==='not-allowed'?'Mic access denied.':'Voice error. Try again.');};
    r.onresult=(e)=>{ const t=Array.from(e.results).map(r=>r[0].transcript).join(''); if(e.results[0].isFinal){onTranscript(t);r.stop();} };
    recRef.current=r; r.start();
  },[lang,onTranscript]);
  const stop=useCallback(()=>{recRef.current?.stop();setRecording(false);},[]);
  return{recording,supported,micError,start,stop};
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const [lang,setLang]             = useState('en');
  const [messages,setMessages]     = useState([]);
  const [input,setInput]           = useState('');
  const [loading,setLoading]       = useState(false);
  const [complaintData,setCD]      = useState(null);
  const [submitting,setSubmitting] = useState(false);
  const [submitted,setSubmitted]   = useState(null);
  const [history,setHistory]       = useState([]);
  const [sessionId,setSessionId]   = useState(null);
  const [userInfo,setUserInfo]     = useState(null);

  /* TTS state */
  const [ttsEnabled,setTtsEnabled] = useState(true);
  const [ttsSpeaking,setTtsSpeaking]= useState(false);
  const [ttsSpeed,setTtsSpeed]     = useState(0.85);
  const [ttsVol,setTtsVol]         = useState(1);
  const [ttsMsgId,setTtsMsgId]     = useState(null); // which bubble is playing
  const utterRef = useRef(null);

  const chatEndRef=useRef(null);
  const inputRef=useRef(null);

  const mic=useMicRecorder({ onTranscript:(txt)=>setInput(p=>p?p+' '+txt:txt), lang });

  /* ── TTS helpers ──────────────────────────────────────────── */
  const pickVoice = useCallback((langCode) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    for (const pref of (VOICE_MAP[langCode]||['en-IN'])) {
      const v = voices.find(v=>v.lang.startsWith(pref)||v.lang===pref);
      if (v) return v;
    }
    return null;
  },[]);

  const ttsStop = useCallback(()=>{
    if (typeof window!=='undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setTtsSpeaking(false); setTtsMsgId(null);
  },[]);

  const ttsSpeak = useCallback((text, msgId)=>{
    if (!ttsEnabled || typeof window==='undefined' || !window.speechSynthesis) return;
    ttsStop();
    const utter = new SpeechSynthesisUtterance(clean(text));
    const voice = pickVoice(lang);
    if (voice) utter.voice = voice;
    utter.lang   = VOICE_MAP[lang]?.[0] || 'en-IN';
    utter.rate   = ttsSpeed;
    utter.volume = ttsVol;
    utter.pitch  = 1;
    utter.onstart = ()=>{ setTtsSpeaking(true); setTtsMsgId(msgId); };
    utter.onend = utter.onerror = ()=>{ setTtsSpeaking(false); setTtsMsgId(null); };
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  },[ttsEnabled,lang,ttsSpeed,ttsVol,ttsStop,pickVoice]);

  const ttsToggle = useCallback((text, msgId)=>{
    if (ttsSpeaking && ttsMsgId===msgId) { ttsStop(); return; }
    ttsSpeak(text, msgId);
  },[ttsSpeaking,ttsMsgId,ttsStop,ttsSpeak]);

  /* ── Init ─────────────────────────────────────────────────── */
  useEffect(()=>{
    const saved = localStorage.getItem('lang')||'en';
    setLang(saved);
    const info = localStorage.getItem('user_info');
    if (info) setUserInfo(JSON.parse(info));
    const initMsg = INITIAL_MESSAGES[saved]||INITIAL_MESSAGES.en;
    setMessages([{role:'assistant',content:initMsg,id:'msg-0'}]);
    setHistory([{role:'assistant',content:initMsg}]);
    const token = localStorage.getItem('user_token');
    fetch('/api/sessions',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({language:saved})})
      .then(r=>r.json()).then(d=>{
        if(d.session_id){
          setSessionId(d.session_id);
          fetch('/api/sessions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save_message',session_id:d.session_id,role:'assistant',content:initMsg})});
        }
      }).catch(()=>{});
    // Auto-speak greeting after 600ms
    setTimeout(()=>ttsSpeak(initMsg,'msg-0'),600);
  },[]); // eslint-disable-line

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}); },[messages,loading]);

  const t = LANGUAGES[lang]||LANGUAGES.en;

  const switchLang = (code)=>{
    ttsStop(); localStorage.setItem('lang',code); setLang(code);
    const m=INITIAL_MESSAGES[code];
    setMessages([{role:'assistant',content:m,id:'msg-0'}]);
    setHistory([{role:'assistant',content:m}]);
    setCD(null); setSubmitted(null); setInput('');
    setTimeout(()=>ttsSpeak(m,'msg-0'),400);
  };

  const saveMsg=(sid,role,content)=>{
    if(!sid)return;
    fetch('/api/sessions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save_message',session_id:sid,role,content})});
  };

  /* ── Send message ─────────────────────────────────────────── */
  const sendMessage = async(override)=>{
    const userMsg=(override||input).trim();
    if(!userMsg||loading)return;
    ttsStop(); setInput('');
    const newHistory=[...history,{role:'user',content:userMsg}];
    setMessages(p=>[...p,{role:'user',content:userMsg,id:`msg-${Date.now()}`}]);
    setHistory(newHistory); setLoading(true);
    saveMsg(sessionId,'user',userMsg);
    try{
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:newHistory,language:lang})});
      const data=await res.json();
      if(data.error) throw new Error(data.error);
      const msgId=`msg-${Date.now()}`;
      setHistory([...newHistory,{role:'assistant',content:data.message}]);
      setMessages(p=>[...p,{role:'assistant',content:data.message,id:msgId}]);
      saveMsg(sessionId,'assistant',data.message);
      if(data.complaintData) setCD(data.complaintData);
      // 🔊 Speak the reply aloud
      setTimeout(()=>ttsSpeak(data.message, msgId), 200);
    }catch{
      setMessages(p=>[...p,{role:'assistant',content:'⚠️ Connection error. Please try again.',id:`msg-err-${Date.now()}`}]);
    }
    setLoading(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  };

  /* ── Submit complaint ─────────────────────────────────────── */
  const submitComplaint=async()=>{
    if(!complaintData)return; setSubmitting(true);
    try{
      const token=localStorage.getItem('user_token');
      const res=await fetch('/api/complaints',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({...complaintData,language:lang})});
      const data=await res.json();
      if(data.success){
        setSubmitted({id:data.id,complaint_no:data.complaint_no});
        if(sessionId) fetch('/api/sessions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'close',session_id:sessionId})});
        const doneMsg = lang==='hi'?`आपकी शिकायत दर्ज हो गई है। आपकी शिकायत संख्या है ${data.complaint_no}`:lang==='te'?`మీ ఫిర్యాదు నమోదైంది. మీ ఫిర్యాదు నంబర్ ${data.complaint_no}`:`Your complaint has been registered. Your complaint number is ${data.complaint_no}`;
        setTimeout(()=>ttsSpeak(doneMsg,'done'),500);
      }else alert('Submission failed: '+(data.error||'Unknown error'));
    }catch{ alert('Network error. Please try again.'); }
    setSubmitting(false);
  };

  const reset=()=>{
    ttsStop();
    const m=INITIAL_MESSAGES[lang];
    setMessages([{role:'assistant',content:m,id:'msg-0'}]);
    setHistory([{role:'assistant',content:m}]);
    setCD(null); setSubmitted(null); setInput(''); setSessionId(null);
  };

  /* ── Wave bars for speaking indicator ─────────────────────── */
  const WaveBars=()=>(
    <span style={{display:'inline-flex',alignItems:'center',gap:'2px',height:'12px'}}>
      {[0,.1,.2,.15,.05].map((d,i)=>(
        <span key={i} style={{display:'inline-block',width:'2px',borderRadius:'1px',background:'#22c55e',animation:`ttsW .7s ease-in-out ${d}s infinite`}}/>
      ))}
    </span>
  );

  /* ── Speed label map ─────────────────────────────────────── */
  const speedLabels={
    en:{slow:'Slow',normal:'Normal',fast:'Fast',replay:'Replay',playing:'Playing...'},
    hi:{slow:'धीमा',normal:'सामान्य',fast:'तेज़',replay:'सुनें',playing:'बोल रहा है...'},
    te:{slow:'నెమ్మది',normal:'సాధారణ',fast:'వేగం',replay:'వినండి',playing:'మాట్లాడుతోంది...'},
  };
  const sl=speedLabels[lang]||speedLabels.en;

  /* ── SUCCESS SCREEN ───────────────────────────────────────── */
  if(submitted) return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',background:'#0a0e1a'}}>
      <style>{'@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Pro:wght@400;600&display=swap");'}</style>
      <div style={{maxWidth:'460px',width:'100%',background:'#111827',border:'1px solid rgba(212,175,55,0.3)',borderRadius:'20px',padding:'48px',textAlign:'center'}}>
        <div style={{width:'72px',height:'72px',borderRadius:'50%',background:'rgba(34,197,94,0.15)',border:'2px solid #22c55e',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:'32px'}}>✓</div>
        <h2 style={{fontFamily:'Cinzel,serif',fontSize:'20px',color:'#d4af37',marginBottom:'8px'}}>{t.successMsg}</h2>
        <div style={{background:'rgba(212,175,55,0.08)',border:'1px solid rgba(212,175,55,0.25)',borderRadius:'12px',padding:'16px',margin:'20px 0'}}>
          <p style={{fontFamily:'Cinzel,serif',fontSize:'10px',color:'rgba(212,175,55,0.5)',letterSpacing:'3px',marginBottom:'6px'}}>{t.trackId}</p>
          <p style={{fontFamily:'Cinzel,serif',fontSize:'26px',fontWeight:900,color:'#d4af37',letterSpacing:'4px'}}>{submitted.complaint_no}</p>
        </div>
        <div style={{display:'flex',gap:'12px'}}>
          <Link href={`/track?id=${submitted.complaint_no}`} style={{flex:1,textAlign:'center',padding:'12px',borderRadius:'10px',fontFamily:'Cinzel,serif',fontSize:'11px',letterSpacing:'2px',background:'rgba(212,175,55,0.1)',border:'1px solid rgba(212,175,55,0.3)',color:'#d4af37',textDecoration:'none'}}>🔍 {t.track}</Link>
          <button onClick={reset} style={{flex:1,padding:'12px',borderRadius:'10px',fontFamily:'Cinzel,serif',fontSize:'11px',letterSpacing:'2px',background:'#d4af37',border:'none',color:'#0a0e1a',cursor:'pointer',fontWeight:700}}>{t.newComplaint}</button>
        </div>
      </div>
    </div>
  );

  /* ── MAIN CHAT ────────────────────────────────────────────── */
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#0a0e1a'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:wght@300;400;600&display=swap');
        *{box-sizing:border-box;}
        .msg-in{animation:msgIn .3s ease forwards;}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dot-pulse{display:flex;align-items:center;gap:4px;}
        .dot-pulse span{width:6px;height:6px;border-radius:50%;background:#d4af37;display:inline-block;animation:dp 1.4s infinite;}
        .dot-pulse span:nth-child(2){animation-delay:.2s;} .dot-pulse span:nth-child(3){animation-delay:.4s;}
        @keyframes dp{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
        @keyframes ttsW{0%,100%{height:3px}50%{height:13px}}
        .mic-btn{width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .2s;flex-shrink:0;}
        .mic-idle{background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);}
        .mic-idle:hover{background:rgba(212,175,55,.2);}
        .mic-rec{background:rgba(239,68,68,.2);border:1px solid rgba(239,68,68,.6);animation:mp 1s ease-in-out infinite;}
        @keyframes mp{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 10px rgba(239,68,68,0)}}
        textarea:focus{outline:none;border-color:rgba(212,175,55,.5)!important;box-shadow:0 0 0 3px rgba(212,175,55,.08);}
        textarea::placeholder{color:rgba(226,232,240,.2);}
        .replay-btn{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;cursor:pointer;transition:all .2s;border:1px solid;font-family:Cinzel,serif;font-size:9px;letter-spacing:1px;}
        .replay-idle{border-color:rgba(212,175,55,.2);background:rgba(212,175,55,.06);color:rgba(212,175,55,.7);}
        .replay-idle:hover{border-color:rgba(212,175,55,.4);background:rgba(212,175,55,.12);}
        .replay-active{border-color:rgba(34,197,94,.5);background:rgba(34,197,94,.1);color:#22c55e;}
        .spd-btn{font-family:Cinzel,serif;font-size:9px;letter-spacing:1px;padding:3px 8px;border-radius:10px;cursor:pointer;transition:all .2s;}
        .spd-off{border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.3);}
        .spd-on{border:1px solid rgba(212,175,55,.4);background:rgba(212,175,55,.12);color:#d4af37;}
        .tts-on{border:1px solid rgba(34,197,94,.4);background:rgba(34,197,94,.1);color:#22c55e;}
        .tts-off{border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.3);}
      `}</style>

      {/* ── Header ──────────────────────────────────────────── */}
      <header style={{flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',background:'#111827',borderBottom:'1px solid rgba(212,175,55,.18)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <Link href="/citizen" style={{color:'#5a6380',fontSize:'16px',textDecoration:'none'}}>←</Link>
          <span style={{fontSize:'16px'}}>⚖️</span>
          <div>
            <p style={{fontFamily:'Cinzel,serif',fontSize:'12px',color:'#d4af37',letterSpacing:'2px',fontWeight:700}}>{t.welcome}</p>
            {userInfo&&<p style={{fontFamily:'Cinzel,serif',fontSize:'9px',color:'rgba(212,175,55,.4)',letterSpacing:'2px'}}>{userInfo.full_name?.toUpperCase()}</p>}
          </div>
        </div>
        <div style={{display:'flex',gap:'5px',alignItems:'center'}}>
          {Object.values(LANGUAGES).map(l=>(
            <button key={l.code} onClick={()=>switchLang(l.code)} style={{fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'1px',padding:'4px 10px',borderRadius:'14px',cursor:'pointer',transition:'all .2s',background:lang===l.code?'rgba(212,175,55,.2)':'transparent',border:`1px solid ${lang===l.code?'#d4af37':'rgba(255,255,255,.1)'}`,color:lang===l.code?'#d4af37':'#5a6380'}}>{l.name}</button>
          ))}
          <button onClick={reset} style={{fontFamily:'Cinzel,serif',fontSize:'10px',padding:'4px 10px',borderRadius:'8px',cursor:'pointer',background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'#5a6380',marginLeft:'4px'}}>↩</button>
        </div>
      </header>

      {/* ── TTS Control Bar ─────────────────────────────────── */}
      <div style={{flexShrink:0,display:'flex',alignItems:'center',gap:'10px',padding:'7px 16px',background:ttsEnabled?'rgba(34,197,94,.07)':'rgba(255,255,255,.02)',borderBottom:`1px solid ${ttsEnabled?'rgba(34,197,94,.2)':'rgba(255,255,255,.05)'}`,flexWrap:'wrap'}}>
        {/* TTS On/Off */}
        <button className={ttsEnabled?'tts-on spd-btn':'tts-off spd-btn'}
          onClick={()=>{ setTtsEnabled(e=>!e); if(ttsEnabled) ttsStop(); }}
          style={{display:'flex',alignItems:'center',gap:'5px',padding:'4px 12px',borderRadius:'20px'}}>
          <span style={{fontSize:'12px'}}>🔊</span>
          {ttsEnabled?(lang==='hi'?'आवाज़ चालू':lang==='te'?'వాయిస్ ఆన్':'Voice On'):(lang==='hi'?'आवाज़ बंद':lang==='te'?'వాయిస్ ఆఫ్':'Voice Off')}
        </button>

        {ttsEnabled&&(
          <>
            {/* Speaking pulse */}
            {ttsSpeaking&&(
              <span style={{display:'flex',alignItems:'center',gap:'5px',fontFamily:'Cinzel,serif',fontSize:'9px',color:'#22c55e',letterSpacing:'1px'}}>
                <WaveBars/> {sl.playing}
              </span>
            )}
            {/* Speed */}
            <div style={{display:'flex',gap:'4px'}}>
              {[[0.6,sl.slow],[0.85,sl.normal],[1.15,sl.fast]].map(([spd,label])=>(
                <button key={spd} className={`spd-btn ${ttsSpeed===spd?'spd-on':'spd-off'}`}
                  onClick={()=>setTtsSpeed(spd)}>{label}</button>
              ))}
            </div>
            {/* Volume */}
            <div style={{display:'flex',alignItems:'center',gap:'5px',marginLeft:'auto'}}>
              <span style={{fontSize:'10px'}}>🔈</span>
              <input type="range" min="0.1" max="1" step="0.1" value={ttsVol}
                onChange={e=>setTtsVol(parseFloat(e.target.value))}
                style={{width:'64px',accentColor:'#d4af37'}}/>
              <span style={{fontSize:'10px'}}>🔊</span>
            </div>
          </>
        )}
      </div>

      {/* ── Mic Recording Banner ────────────────────────────── */}
      {(mic.recording||mic.micError)&&(
        <div style={{flexShrink:0,padding:'7px 16px',background:mic.recording?'rgba(239,68,68,.1)':'rgba(245,158,11,.07)',borderBottom:`1px solid ${mic.recording?'rgba(239,68,68,.3)':'rgba(245,158,11,.2)'}`,display:'flex',alignItems:'center',gap:'8px'}}>
          {mic.recording&&<span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#ef4444',display:'inline-block',animation:'mp 1s infinite'}}/>}
          <p style={{fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'2px',color:mic.recording?'#f87171':'#f59e0b'}}>
            {mic.recording?(lang==='hi'?'🎙 रिकॉर्ड हो रहा है... बोलिए':lang==='te'?'🎙 రికార్డ్ అవుతోంది...':'🎙 RECORDING... SPEAK NOW'):mic.micError}
          </p>
        </div>
      )}

      {/* ── Messages ────────────────────────────────────────── */}
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        <div style={{maxWidth:'800px',width:'100%',margin:'0 auto',display:'flex',flexDirection:'column',gap:'12px'}}>
          {messages.map((msg)=>(
            <div key={msg.id} className="msg-in" style={{display:'flex',flexDirection:'column',alignItems:msg.role==='user'?'flex-end':'flex-start'}}>
              {msg.role==='assistant'&&(
                <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'4px'}}>
                  <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'linear-gradient(135deg,#d4af37,#b8962e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>👮</div>
                  <span style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'2px',color:'#4a5380'}}>AI OFFICER</span>
                </div>
              )}
              <div style={{maxWidth:'76%',padding:'12px 15px',borderRadius:msg.role==='user'?'18px 4px 18px 18px':'4px 18px 18px 18px',background:msg.role==='user'?'linear-gradient(135deg,#d4af37,#b8962e)':'#111827',border:msg.role==='user'?'none':'1px solid rgba(212,175,55,.15)',color:msg.role==='user'?'#0a0e1a':'#ccd6f6',fontFamily:'Crimson Pro,serif',fontSize:'15px',lineHeight:1.7}}
                dangerouslySetInnerHTML={{__html:formatMsg(msg.content)}}/>

              {/* 🔊 Replay button under AI bubbles */}
              {msg.role==='assistant'&&(
                <button
                  className={`replay-btn ${ttsSpeaking&&ttsMsgId===msg.id?'replay-active':'replay-idle'}`}
                  style={{marginTop:'4px'}}
                  onClick={()=>ttsToggle(msg.content,msg.id)}>
                  {ttsSpeaking&&ttsMsgId===msg.id ? <WaveBars/> : <span style={{fontSize:'11px'}}>🔊</span>}
                  <span>{ttsSpeaking&&ttsMsgId===msg.id?sl.playing:sl.replay}</span>
                </button>
              )}
            </div>
          ))}

          {loading&&(
            <div style={{display:'flex',alignItems:'flex-start',gap:'8px'}}>
              <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'linear-gradient(135deg,#d4af37,#b8962e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>👮</div>
              <div style={{background:'#111827',border:'1px solid rgba(212,175,55,.15)',borderRadius:'4px 18px 18px 18px',padding:'14px 18px'}}>
                <div className="dot-pulse"><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>
      </div>

      {/* ── Summary Panel ───────────────────────────────────── */}
      {complaintData&&!submitted&&(
        <div style={{flexShrink:0,borderTop:'1px solid rgba(34,197,94,.3)',background:'#0d1117'}}>
          <div style={{maxWidth:'800px',margin:'0 auto',padding:'12px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
              <span style={{fontFamily:'Cinzel,serif',fontSize:'10px',letterSpacing:'2px',color:'#22c55e'}}>✦ {t.complaintSummary}</span>
              <span style={{fontFamily:'Cinzel,serif',fontSize:'9px',color:'#4a5380'}}>All details collected ✓</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))',gap:'7px',marginBottom:'10px'}}>
              {[['name',t.fields.name,complaintData.name],['phone',t.fields.phone,complaintData.phone],['type',t.fields.type,COMPLAINT_TYPE_LABELS[complaintData.complaint_type]||complaintData.complaint_type],['date',t.fields.date,complaintData.incident_date],['location',t.fields.location,complaintData.incident_location]].map(([k,label,val])=>(
                <div key={k} style={{background:'rgba(34,197,94,.05)',border:'1px solid rgba(34,197,94,.15)',borderRadius:'8px',padding:'8px 11px'}}>
                  <p style={{fontFamily:'Cinzel,serif',fontSize:'9px',color:'#4a6080',letterSpacing:'1px',marginBottom:'3px'}}>{label.toUpperCase()}</p>
                  <p style={{fontFamily:'Crimson Pro,serif',fontSize:'13px',color:'#ccd6f6'}}>{val}</p>
                </div>
              ))}
            </div>
            <button onClick={submitComplaint} disabled={submitting}
              style={{width:'100%',fontFamily:'Cinzel,serif',fontSize:'11px',letterSpacing:'2px',padding:'12px',borderRadius:'10px',fontWeight:700,cursor:'pointer',background:'rgba(34,197,94,.15)',border:'1.5px solid #22c55e',color:'#22c55e'}}>
              {submitting?'⏳ Submitting...':`${t.submitBtn} →`}
            </button>
          </div>
        </div>
      )}

      {/* ── Input Bar ───────────────────────────────────────── */}
      <div style={{flexShrink:0,background:'#111827',borderTop:'1px solid rgba(212,175,55,.15)',padding:'10px 14px'}}>
        <div style={{maxWidth:'800px',margin:'0 auto',display:'flex',gap:'8px',alignItems:'flex-end'}}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
            placeholder={mic.recording?(lang==='hi'?'बोलिए...':lang==='te'?'మాట్లాడండి...':'Listening... speak now'):t.placeholder}
            rows={2} style={{flex:1,background:'#0a0e1a',border:'1px solid rgba(212,175,55,.2)',borderRadius:'12px',padding:'11px 14px',color:'#ccd6f6',fontFamily:'Crimson Pro,serif',fontSize:'15px',resize:'none',lineHeight:1.5}}/>

          {mic.supported&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
              <button className={`mic-btn ${mic.recording?'mic-rec':'mic-idle'}`}
                onClick={mic.recording?mic.stop:mic.start}>
                {mic.recording?'⏹':'🎙'}
              </button>
              <span style={{fontFamily:'Cinzel,serif',fontSize:'8px',letterSpacing:'1px',color:mic.recording?'#ef4444':'#3a4060'}}>{mic.recording?'STOP':'VOICE'}</span>
            </div>
          )}

          <button onClick={()=>sendMessage()} disabled={loading||!input.trim()}
            style={{width:'40px',height:'40px',borderRadius:'10px',background:'#d4af37',border:'none',color:'#0a0e1a',fontSize:'16px',cursor:'pointer',flexShrink:0,opacity:(loading||!input.trim())?.4:1,transition:'all .2s'}}>
            ➤
          </button>
        </div>
        <p style={{fontFamily:'Cinzel,serif',fontSize:'9px',letterSpacing:'1px',color:'#2a3050',marginTop:'5px',maxWidth:'800px',margin:'5px auto 0'}}>
          🔊 Replies read aloud · 🎙 Voice input · 🔒 Encrypted{sessionId&&<span style={{color:'rgba(34,197,94,.35)'}}> · Session saved</span>}
        </p>
      </div>
    </div>
  );
}
