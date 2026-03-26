/* eslint-disable no-unused-vars */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  LayoutDashboard, Users, Search, LogOut, Shield, Activity,
  Terminal, QrCode, Upload, Zap, Star, CheckCircle,
  FilePlus, UserPlus, Trash2, FileText, Briefcase,
  Bell, Hash, Globe, Award, Clock, AlertCircle, Eye, X,
  BarChart2, Database, GitBranch, Key, Cpu, Send, Inbox,
  BookOpen, XCircle, ArrowRight, Download, ExternalLink,
  RefreshCw, User, Building2, GraduationCap, Wallet,
  Network, FileCheck, Hexagon, Circle, Check, Loader,
  MessageSquare, Edit2, Save, Link, Copy, AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// ══════════════════════════════════════════════════════════
// STYLES GLOBAUX
// ══════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg-void:#03060f;--bg-deep:#060d1a;--bg-surface:#0a1628;--bg-card:#0d1f3c;--bg-hover:#102340;
      --border:rgba(0,240,160,0.08);--border-md:rgba(0,240,160,0.18);--border-hi:rgba(0,240,160,0.35);
      --acid:#00f0a0;--acid-dim:rgba(0,240,160,0.12);--acid-glow:rgba(0,240,160,0.25);
      --amber:#f5a623;--amber-dim:rgba(245,166,35,0.12);
      --crimson:#f5384b;--crimson-dim:rgba(245,56,75,0.12);
      --sky:#38b2f5;--sky-dim:rgba(56,178,245,0.12);
      --violet:#a78bfa;--violet-dim:rgba(167,139,250,0.12);
      --text-primary:#e2f0ff;--text-secondary:#7a9cc0;--text-muted:#3d5a7a;--text-accent:#00f0a0;
      --font-mono:'Share Tech Mono',monospace;--font-ui:'Outfit',sans-serif;
      --r-sm:6px;--r-md:12px;--r-lg:20px;
    }
    html,body,#root{height:100%;background:var(--bg-void);color:var(--text-primary);font-family:var(--font-ui);-webkit-font-smoothing:antialiased;}
    ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--border-md);border-radius:99px;}
    button{cursor:pointer;border:none;background:none;font-family:var(--font-ui);}
    input,textarea,select{font-family:var(--font-ui);outline:none;color:var(--text-primary);}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
    @keyframes fadeInScale{from{opacity:0;transform:scale(0.96);}to{opacity:1;transform:scale(1);}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-14px);}to{opacity:1;transform:none;}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes pulse2{0%,100%{opacity:1;}50%{opacity:0.35;}}
    @keyframes blink{50%{opacity:0;}}
    @keyframes glitch{0%,94%,100%{clip-path:none;transform:none;}95%{clip-path:polygon(0 20%,100% 20%,100% 40%,0 40%);transform:translateX(-2px);}96%{clip-path:polygon(0 60%,100% 60%,100% 80%,0 80%);transform:translateX(2px);}97%{clip-path:none;transform:none;}}
    @keyframes walletConnect{0%{opacity:0;transform:translateY(20px);}100%{opacity:1;transform:none;}}
    @keyframes typing{from{width:0;}to{width:100%;}}
    .sc-fade{animation:fadeIn 0.3s ease forwards;}
    .sc-scale{animation:fadeInScale 0.25s ease forwards;}
    .sc-spin{animation:spin 1s linear infinite;}
    .sc-pulse{animation:pulse2 2s ease-in-out infinite;}
    .sc-blink{animation:blink 1.2s step-start infinite;}
    .sc-glitch{animation:glitch 5s infinite;}
    .hex-bg{
      background-image:
        radial-gradient(ellipse 80% 60% at 20% 0%,rgba(0,240,160,0.04) 0%,transparent 60%),
        radial-gradient(ellipse 60% 80% at 80% 100%,rgba(56,178,245,0.04) 0%,transparent 60%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300f0a0' fill-opacity='0.012'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
    }
  `}</style>
);

// ══════════════════════════════════════════════════════════
// TOAST SYSTEM
// ══════════════════════════════════════════════════════════
const ToastCtx = React.createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);
  const icons = { success:<CheckCircle size={14}/>, error:<XCircle size={14}/>, info:<Bell size={14}/>, warning:<AlertCircle size={14}/>, loading:<Loader size={14} className="sc-spin"/> };
  const cols = { success:['var(--acid-dim)','var(--acid)'], error:['var(--crimson-dim)','var(--crimson)'], info:['var(--sky-dim)','var(--sky)'], warning:['var(--amber-dim)','var(--amber)'], loading:['var(--violet-dim)','var(--violet)'] };
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position:'fixed',top:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:8,maxWidth:380,pointerEvents:'none' }}>
        {toasts.map(t => {
          const [bg,fg] = cols[t.type]||cols.info;
          return <div key={t.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 15px',background:bg,border:`1px solid ${fg}40`,borderRadius:'var(--r-md)',backdropFilter:'blur(20px)',animation:'slideDown 0.3s ease',boxShadow:`0 4px 20px ${fg}20` }}><span style={{color:fg,flexShrink:0}}>{icons[t.type]}</span><span style={{fontSize:12,fontFamily:'var(--font-mono)',color:fg,lineHeight:1.4}}>{t.msg}</span></div>;
        })}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => React.useContext(ToastCtx);

// ══════════════════════════════════════════════════════════
// METAMASK HOOK — Simulation transaction on-chain
// ══════════════════════════════════════════════════════════
const useMetaMask = () => {
  const toast = useToast();
  const sign = useCallback((action, onSuccess) => {
    toast('MetaMask : En attente de signature...', 'loading');
    setTimeout(() => {
      toast('Transaction envoyée au réseau Sepolia...', 'loading');
      setTimeout(() => {
        toast(`✓ ${action} — Ancré on-chain`, 'success');
        if (onSuccess) onSuccess();
      }, 1400);
    }, 1100);
  }, [toast]);
  return { sign };
};

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
const rndItem = (arr) => arr[Math.floor(Math.random()*arr.length)];
const fakeHash = () => `0x${Array.from({length:8},()=>Math.floor(Math.random()*16).toString(16)).join('')}...`;
const fakeBlock = () => `#${Math.floor(Math.random()*10000+800)}`;
const fakeCID = () => `Qm${Array.from({length:8},()=>'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[Math.floor(Math.random()*58)]).join('')}...`;
const todayStr = () => new Date().toLocaleDateString('fr-FR');

// Wallet addresses per role — simulates real MetaMask accounts
const WALLETS = {
  admin:    '0xA1B2C3D4E5F6789012345678901234567890ABCD',
  rh:       '0xB2C3D4E5F678901234567890123456789012BCDE',
  etudiant: '0xC3D4E5F6789012345678901234567890123CDEF0',
  encadrant:'0xD4E5F678901234567890123456789012345DEF01',
  tuteur:   '0xE5F6789012345678901234567890123456EF0123',
};
const shortWallet = (w) => w ? `${w.slice(0,6)}...${w.slice(-4)}` : '';

// ══════════════════════════════════════════════════════════
// UI PRIMITIVES
// ══════════════════════════════════════════════════════════
const Card = ({ children, style }) => (
  <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',padding:22,...style }}>{children}</div>
);
const GlassCard = ({ children, style, glow }) => (
  <div style={{ background:'rgba(13,31,60,0.75)',backdropFilter:'blur(20px)',border:`1px solid ${glow?'var(--border-hi)':'var(--border)'}`,borderRadius:'var(--r-lg)',boxShadow:glow?'0 0 28px var(--acid-glow)':'none',padding:22,...style }}>{children}</div>
);

const Btn = ({ children, variant='primary', onClick, style, icon:Icon, small, disabled, loading, full }) => {
  const V = {
    primary:  {background:'var(--acid)',color:'#030f06',boxShadow:'0 3px 16px var(--acid-glow)',fontWeight:700},
    secondary:{background:'var(--bg-surface)',color:'var(--text-primary)',border:'1px solid var(--border-md)'},
    danger:   {background:'var(--crimson-dim)',color:'var(--crimson)',border:'1px solid rgba(245,56,75,0.35)'},
    ghost:    {background:'transparent',color:'var(--text-secondary)',border:'1px solid var(--border)'},
    amber:    {background:'var(--amber-dim)',color:'var(--amber)',border:'1px solid rgba(245,166,35,0.35)'},
    sky:      {background:'var(--sky-dim)',color:'var(--sky)',border:'1px solid rgba(56,178,245,0.35)'},
    success:  {background:'var(--acid-dim)',color:'var(--acid)',border:'1px solid var(--border-hi)'},
  };
  const v = V[variant]||V.primary;
  const dis = disabled||loading;
  return (
    <button onClick={!dis?onClick:undefined} disabled={dis}
      style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7,
        padding:small?'6px 13px':'10px 18px',borderRadius:'var(--r-md)',
        fontSize:small?11:13,fontFamily:'var(--font-ui)',fontWeight:v.fontWeight||600,
        transition:'all 0.15s',opacity:dis?0.55:1,cursor:dis?'not-allowed':'pointer',
        width:full?'100%':undefined,...v,...style }}
      onMouseEnter={e=>{if(!dis)e.currentTarget.style.transform='translateY(-1px)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none';}}
    >
      {loading?<Loader size={small?11:14} className="sc-spin"/>:Icon&&<Icon size={small?11:14}/>}
      {children}
    </button>
  );
};

const Tag = ({ label, color='acid' }) => {
  const M={acid:['var(--acid-dim)','var(--acid)'],amber:['var(--amber-dim)','var(--amber)'],crimson:['var(--crimson-dim)','var(--crimson)'],sky:['var(--sky-dim)','var(--sky)'],violet:['var(--violet-dim)','var(--violet)'],muted:['rgba(100,130,160,0.1)','var(--text-secondary)']};
  const [bg,fg]=M[color]||M.acid;
  return <span style={{display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:4,fontSize:9,fontFamily:'var(--font-mono)',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',background:bg,color:fg,border:`1px solid ${fg}40`}}>{label}</span>;
};

const Inp = ({ label, placeholder, type='text', value, onChange, icon:Icon, disabled }) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {label&&<label style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-secondary)',letterSpacing:'0.1em',textTransform:'uppercase'}}>{label}</label>}
    <div style={{position:'relative'}}>
      {Icon&&<Icon size={13} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',pointerEvents:'none'}}/>}
      <input type={type} placeholder={placeholder} value={value||''} onChange={onChange} disabled={disabled}
        style={{width:'100%',padding:Icon?'10px 12px 10px 34px':'10px 12px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',color:'var(--text-primary)',fontSize:13,transition:'border-color 0.2s,box-shadow 0.2s',opacity:disabled?0.5:1}}
        onFocus={e=>{e.target.style.borderColor='var(--border-hi)';e.target.style.boxShadow='0 0 0 3px var(--acid-dim)';}}
        onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}}
      />
    </div>
  </div>
);

const Txta = ({ label, placeholder, rows=4, value, onChange }) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {label&&<label style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-secondary)',letterSpacing:'0.1em',textTransform:'uppercase'}}>{label}</label>}
    <textarea placeholder={placeholder} rows={rows} value={value||''} onChange={onChange}
      style={{width:'100%',padding:'10px 12px',resize:'vertical',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',color:'var(--text-primary)',fontSize:13,lineHeight:1.6,transition:'border-color 0.2s'}}
      onFocus={e=>e.target.style.borderColor='var(--border-hi)'}
      onBlur={e=>e.target.style.borderColor='var(--border)'}
    />
  </div>
);

const Sel = ({ label, options, value, onChange }) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {label&&<label style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-secondary)',letterSpacing:'0.1em',textTransform:'uppercase'}}>{label}</label>}
    <select value={value||''} onChange={onChange}
      style={{padding:'10px 12px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',color:'var(--text-primary)',fontSize:13}}
      onFocus={e=>e.target.style.borderColor='var(--border-hi)'}
      onBlur={e=>e.target.style.borderColor='var(--border)'}
    >{options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select>
  </div>
);

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.78)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--bg-card)',border:'1px solid var(--border-md)',borderRadius:'var(--r-lg)',padding:28,maxWidth:wide?720:500,width:'100%',animation:'fadeIn 0.2s ease',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h3 style={{fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>{title}</h3>
          <button onClick={onClose} style={{color:'var(--text-muted)',padding:4,transition:'color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='var(--crimson)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}><X size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Alrt = ({ type='info', message, onClose }) => {
  const M={info:['var(--sky-dim)','var(--sky)',<Bell size={13}/>],warning:['var(--amber-dim)','var(--amber)',<AlertCircle size={13}/>],success:['var(--acid-dim)','var(--acid)',<CheckCircle size={13}/>],error:['var(--crimson-dim)','var(--crimson)',<XCircle size={13}/>]};
  const [bg,fg,ic]=M[type]||M.info;
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',background:bg,border:`1px solid ${fg}30`,borderRadius:'var(--r-md)',marginBottom:14}}>
      <span style={{color:fg,flexShrink:0,marginTop:1}}>{ic}</span>
      <span style={{fontSize:12,color:fg,fontFamily:'var(--font-mono)',flex:1,lineHeight:1.5}}>{message}</span>
      {onClose&&<button onClick={onClose} style={{color:fg,opacity:0.6,padding:2}}><X size={11}/></button>}
    </div>
  );
};

const ML = ({ label, value, color }) => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
    <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</span>
    <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:color||'var(--text-primary)'}}>{value}</span>
  </div>
);

const Divider = ({ label }) => (
  <div style={{display:'flex',alignItems:'center',gap:10,margin:'14px 0'}}>
    <div style={{flex:1,height:1,background:'var(--border)'}}/>
    {label&&<span style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',letterSpacing:'0.12em',textTransform:'uppercase'}}>{label}</span>}
    <div style={{flex:1,height:1,background:'var(--border)'}}/>
  </div>
);

const StatCard = ({ label, value, sub, color='acid', icon:Icon }) => {
  const C={acid:'var(--acid)',amber:'var(--amber)',sky:'var(--sky)',crimson:'var(--crimson)',violet:'var(--violet)'};
  const fg=C[color]||C.acid;
  return (
    <GlassCard style={{padding:'16px 18px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <span style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em'}}>{label}</span>
        {Icon&&<div style={{padding:6,background:`${fg}15`,borderRadius:8}}><Icon size={13} style={{color:fg}}/></div>}
      </div>
      <div style={{fontSize:28,fontWeight:800,color:fg,letterSpacing:'-0.02em',lineHeight:1,marginBottom:3}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:'var(--text-secondary)'}}>{sub}</div>}
    </GlassCard>
  );
};

const TxLog = ({ entries }) => (
  <div style={{background:'var(--bg-void)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',overflow:'hidden'}}>
    <div style={{padding:'6px 12px',background:'var(--bg-surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
      <Terminal size={11} style={{color:'var(--acid)'}}/>
      <span style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Blockchain Log</span>
      <div className="sc-blink" style={{width:5,height:5,borderRadius:'50%',background:'var(--acid)',marginLeft:'auto'}}/>
    </div>
    <div style={{padding:'3px 0',maxHeight:150,overflowY:'auto'}}>
      {entries.map((e,i)=>(
        <div key={i} style={{padding:'4px 12px',display:'flex',alignItems:'center',gap:9}}>
          <span style={{color:'var(--acid)',minWidth:12,fontFamily:'var(--font-mono)',fontSize:11}}>{'>'}</span>
          <span style={{color:'var(--text-secondary)',flex:1,fontSize:10,fontFamily:'var(--font-mono)'}}>{e.msg}</span>
          <span style={{color:'var(--text-muted)',fontSize:9,fontFamily:'var(--font-mono)'}}>{e.block}</span>
        </div>
      ))}
    </div>
  </div>
);

const Pipeline = ({ steps, current }) => (
  <div style={{display:'flex',alignItems:'center',overflowX:'auto',paddingBottom:4}}>
    {steps.map((step,i)=>{
      const done=i<current,active=i===current;
      const c=done?'var(--acid)':active?'var(--amber)':'var(--text-muted)';
      return (
        <React.Fragment key={i}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,minWidth:62}}>
            <div style={{width:25,height:25,borderRadius:'50%',background:done?'var(--acid-dim)':active?'var(--amber-dim)':'var(--bg-surface)',border:`2px solid ${c}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'var(--font-mono)',color:c,fontWeight:700}}>
              {done?<Check size={11}/>:i+1}
            </div>
            <span style={{fontSize:7,fontFamily:'var(--font-mono)',color:c,textAlign:'center',letterSpacing:'0.05em',textTransform:'uppercase',maxWidth:58}}>{step}</span>
          </div>
          {i<steps.length-1&&<div style={{flex:1,height:2,background:i<current?'var(--acid)':'var(--border)',minWidth:14,margin:'0 1px',marginBottom:18}}/>}
        </React.Fragment>
      );
    })}
  </div>
);

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:26}}>
    <div>
      {subtitle&&<div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-accent)',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:5}}>▸ {subtitle}</div>}
      <h1 style={{fontSize:23,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.02em',lineHeight:1.1}}>{title}</h1>
    </div>
    {children&&<div style={{display:'flex',gap:8,alignItems:'center'}}>{children}</div>}
  </div>
);

// ══════════════════════════════════════════════════════════
// METAMASK LOGIN SCREEN — Simulation complète par acteur
// ══════════════════════════════════════════════════════════
const ROLE_CONFIG = {
  admin:    { label:'Admin Université',   color:'var(--violet)', icon:Shield,       wallet:WALLETS.admin,    desc:'Gestion SC1 · Comptes · Litiges & Arbitrage' },
  rh:       { label:'RH Entreprise',      color:'var(--amber)',  icon:Building2,    wallet:WALLETS.rh,       desc:'Offres SC2 · Candidatures SC3 · Attestations' },
  etudiant: { label:'Étudiant',           color:'var(--acid)',   icon:GraduationCap,wallet:WALLETS.etudiant, desc:'Matching · Convention · Suivi · Attestation' },
  encadrant:{ label:'Encadrant Pédago.',  color:'var(--sky)',    icon:BookOpen,     wallet:WALLETS.encadrant,desc:'Suivi SC5 · Évaluation SC6 · Conventions' },
  tuteur:   { label:'Tuteur Entreprise',  color:'var(--amber)',  icon:Briefcase,    wallet:WALLETS.tuteur,   desc:'Présences hebdo · Évaluation rapport SC6' },
};

// ─── Étape 1 : Choisir son rôle ──────────────────────────
const RoleSelector = ({ onSelect }) => {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="hex-bg" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:640,width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:68,height:68,borderRadius:18,background:'var(--acid-dim)',border:'2px solid var(--border-hi)',marginBottom:18,boxShadow:'0 0 40px var(--acid-glow)'}}>
            <Hexagon size={32} style={{color:'var(--acid)'}}/>
          </div>
          <h1 className="sc-glitch" style={{fontSize:48,fontWeight:900,letterSpacing:'-0.04em',lineHeight:0.9,marginBottom:10}}>
            Stage<span style={{color:'var(--acid)'}}>Chain</span>
          </h1>
          <p style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)',letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:5}}>
            Plateforme Blockchain — EMSI Marrakech
          </p>
          <p style={{fontSize:12,color:'var(--text-secondary)'}}>Filière Cybersécurité & Infrastructure · Groupe 3 · 2025–2026</p>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:11,padding:'12px 17px',background:'var(--amber-dim)',border:'1px solid rgba(245,166,35,0.3)',borderRadius:'var(--r-md)',marginBottom:24}}>
          <Wallet size={14} style={{color:'var(--amber)',flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--amber)',marginBottom:2}}>Connexion via MetaMask requis</div>
            <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>Chaque acteur possède un wallet Ethereum unique · Réseau : Sepolia Testnet</div>
          </div>
          <div className="sc-blink" style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--amber)'}}>LIVE</div>
        </div>

        <p style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)',textAlign:'center',marginBottom:16,letterSpacing:'0.1em',textTransform:'uppercase'}}>Sélectionnez votre rôle pour connecter votre wallet</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11,marginBottom:22}}>
          {Object.entries(ROLE_CONFIG).map(([id,r])=>{
            const Ic=r.icon; const h=hovered===id;
            return (
              <button key={id} onClick={()=>onSelect(id)}
                onMouseEnter={()=>setHovered(id)} onMouseLeave={()=>setHovered(null)}
                style={{padding:'16px 18px',borderRadius:'var(--r-md)',background:h?`${r.color}12`:'var(--bg-card)',border:`1px solid ${h?r.color+'60':'var(--border)'}`,textAlign:'left',transition:'all 0.2s',transform:h?'translateY(-2px)':'none',boxShadow:h?`0 8px 28px ${r.color}20`:'none',cursor:'pointer'}}
              >
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <div style={{width:34,height:34,borderRadius:10,background:`${r.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Ic size={15} style={{color:r.color}}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:h?r.color:'var(--text-primary)'}}>{r.label}</div>
                    <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',marginTop:1}}>{shortWallet(r.wallet)}</div>
                  </div>
                </div>
                <p style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)',lineHeight:1.5}}>{r.desc}</p>
                {h&&(
                  <div style={{display:'flex',alignItems:'center',gap:5,marginTop:10,padding:'5px 10px',background:`${r.color}15`,borderRadius:6,width:'fit-content'}}>
                    <Wallet size={10} style={{color:r.color}}/>
                    <span style={{fontSize:9,fontFamily:'var(--font-mono)',color:r.color}}>Connecter ce wallet</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div style={{textAlign:'center',fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>
          © 2025–2026 StageChain · EMSI · 7 Smart Contracts · Solidity 0.8.x
        </div>
      </div>
    </div>
  );
};

// ─── Étape 2 : Fenêtre MetaMask simulée ──────────────────
const MetaMaskPopup = ({ role, onConfirm, onReject }) => {
  const cfg = ROLE_CONFIG[role];
  const [step, setStep] = useState(0); // 0=demande, 1=signing, 2=done
  const Ic = cfg.icon;

  const handleConfirm = () => {
    setStep(1);
    setTimeout(() => { setStep(2); setTimeout(onConfirm, 700); }, 1500);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div style={{width:380,background:'#1a1f2e',borderRadius:20,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.7)',animation:'walletConnect 0.35s ease',border:'1px solid rgba(255,255,255,0.08)'}}>
        {/* MetaMask Header */}
        <div style={{background:'#f6851b',padding:'14px 20px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:16}}>🦊</span>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>MetaMask</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.7)'}}>Ethereum Wallet</div>
          </div>
          <div style={{marginLeft:'auto',fontSize:10,color:'rgba(255,255,255,0.7)',background:'rgba(0,0,0,0.2)',padding:'3px 8px',borderRadius:99}}>Sepolia Testnet</div>
        </div>

        <div style={{padding:24}}>
          {step === 0 && (
            <div className="sc-fade">
              <div style={{textAlign:'center',marginBottom:20}}>
                <div style={{width:56,height:56,borderRadius:16,background:`${cfg.color}20`,border:`2px solid ${cfg.color}50`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                  <Ic size={24} style={{color:cfg.color}}/>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:4}}>{cfg.label}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>stagechain.emsi.ma souhaite se connecter</div>
              </div>

              <div style={{background:'rgba(255,255,255,0.05)',borderRadius:12,padding:'14px 16px',marginBottom:16}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8,fontFamily:'var(--font-mono)'}}>Compte</div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:`${cfg.color}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Ic size={14} style={{color:cfg.color}}/>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{cfg.label}</div>
                    <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'rgba(255,255,255,0.4)'}}>{shortWallet(cfg.wallet)}</div>
                  </div>
                  <div style={{marginLeft:'auto',fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:'var(--font-mono)'}}>0.00 ETH</div>
                </div>
              </div>

              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'12px 14px',marginBottom:20,fontSize:11,color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>
                  <Shield size={11} style={{color:'#f6851b'}}/><span style={{color:'rgba(255,255,255,0.7)',fontWeight:600}}>Permissions demandées</span>
                </div>
                · Voir votre adresse de compte<br/>
                · Accès à l'interface StageChain<br/>
                · Signature de transactions on-chain
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <button onClick={onReject}
                  style={{padding:'11px',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.7)',fontSize:13,fontWeight:600,transition:'all 0.2s',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(245,56,75,0.15)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                >Annuler</button>
                <button onClick={handleConfirm}
                  style={{padding:'11px',borderRadius:10,background:'#f6851b',border:'none',color:'#fff',fontSize:13,fontWeight:700,transition:'all 0.2s',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#e07010'}
                  onMouseLeave={e=>e.currentTarget.style.background='#f6851b'}
                >Connecter</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{textAlign:'center',padding:'20px 0'}} className="sc-fade">
              <Loader size={36} className="sc-spin" style={{color:'#f6851b',marginBottom:16}}/>
              <div style={{fontSize:14,fontWeight:600,color:'#fff',marginBottom:6}}>Signature en cours...</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'var(--font-mono)'}}>Vérification du wallet sur Sepolia</div>
            </div>
          )}

          {step === 2 && (
            <div style={{textAlign:'center',padding:'20px 0'}} className="sc-fade">
              <div style={{width:52,height:52,borderRadius:'50%',background:'rgba(0,240,160,0.15)',border:'2px solid var(--acid)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
                <CheckCircle size={26} style={{color:'var(--acid)'}}/>
              </div>
              <div style={{fontSize:14,fontWeight:600,color:'#fff',marginBottom:6}}>Wallet connecté !</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:'var(--font-mono)'}}>{shortWallet(cfg.wallet)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// SIDEBAR CONFIG
// ══════════════════════════════════════════════════════════
const ROLES = {
  admin:    {label:'Admin Université',  color:'var(--violet)',icon:Shield,   items:[
    {id:'dashboard',     icon:LayoutDashboard,label:'Tableau de Bord',    section:null},
    {id:'admin_users',   icon:Users,          label:'Gestion Comptes',   section:'SC1 — UserManager'},
    {id:'reseau',        icon:Network,        label:'Réseau Blockchain', section:'SC1 — UserManager'},
    {id:'admin_stats',   icon:BarChart2,      label:'Statistiques',      section:'Système'},
    {id:'admin_litiges', icon:AlertCircle,    label:'Litiges & Arbitrage',section:'Système'},
  ]},
  rh:       {label:'RH Entreprise',     color:'var(--amber)', icon:Building2,items:[
    {id:'dashboard',     icon:LayoutDashboard,label:'Tableau de Bord',    section:null},
    {id:'rh_offres',     icon:FilePlus,       label:'Mes Offres',         section:'SC2 — OffreManager'},
    {id:'rh_candidats',  icon:Inbox,          label:'Candidatures',       section:'SC3 — CandidatureManager'},
    {id:'rh_convention', icon:FileCheck,      label:'Conventions',        section:'SC4 — ConventionManager'},
    {id:'enc_certif',    icon:Award,          label:'Signer Attestation', section:'SC7 — CertifManager'},
    {id:'rh_verif',      icon:Search,         label:'Vérifier Attestation',section:'SC7 — Vérification'},
  ]},
  etudiant: {label:'Étudiant',          color:'var(--acid)',  icon:GraduationCap,items:[
    {id:'dashboard',     icon:LayoutDashboard,label:'Tableau de Bord',    section:null},
    {id:'matching',      icon:Search,         label:'Matching Offres',    section:'SC2 + SC3'},
    {id:'candidature',   icon:Send,           label:'Mes Candidatures',   section:'SC3 — CandidatureManager'},
    {id:'convention',    icon:FileText,       label:'Ma Convention',      section:'SC4 — ConventionManager'},
    {id:'suivi',         icon:Activity,       label:'Suivi de Stage',     section:'SC5 — SuiviManager'},
    {id:'rapport',       icon:Upload,         label:'Rapport Final',      section:'SC6 — RapportManager'},
    {id:'certif',        icon:QrCode,         label:'Attestation',        section:'SC7 — CertifManager'},
  ]},
  encadrant:{label:'Encadrant Pédago.', color:'var(--sky)',   icon:BookOpen, items:[
    {id:'dashboard',     icon:LayoutDashboard,label:'Tableau de Bord',    section:null},
    {id:'enc_suivi',     icon:Activity,       label:'Suivi Étudiants',    section:'SC5 — SuiviManager'},
    {id:'evaluation',    icon:Star,           label:'Évaluation',         section:'SC6 — RapportManager'},
    {id:'enc_convention',icon:FileCheck,      label:'Conventions',        section:'SC4 — ConventionManager'},
    {id:'enc_certif',    icon:Award,          label:'Signer Attestation', section:'SC7 — CertifManager'},
  ]},
  tuteur:   {label:'Tuteur Entreprise', color:'var(--amber)', icon:Briefcase,items:[
    {id:'dashboard',     icon:LayoutDashboard,label:'Tableau de Bord',    section:null},
    {id:'tut_suivi',     icon:Activity,       label:'Suivi Hebdo',        section:'SC5 — SuiviManager'},
    {id:'evaluation',    icon:Star,           label:'Évaluation Rapport', section:'SC6 — RapportManager'},
    {id:'enc_certif',    icon:Award,          label:'Signer Attestation', section:'SC7 — CertifManager'},
  ]},
};

// ══════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════
const Sidebar = ({ role, view, setView, account, onLogout }) => {
  const cfg = ROLES[role]; if(!cfg) return null;
  const RI = cfg.icon; let lastSec = null;
  const toast = useToast();
  const copyWallet = () => { navigator.clipboard?.writeText(account).catch(()=>{}); toast('Adresse copiée !','info'); };

  return (
    <aside style={{width:252,flexShrink:0,background:'var(--bg-deep)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',height:'100vh',position:'sticky',top:0,overflow:'hidden'}}>
      <div style={{padding:'18px 16px 14px',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:13}}>
          <div style={{width:32,height:32,borderRadius:9,background:'var(--acid-dim)',border:'1px solid var(--border-hi)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Hexagon size={16} style={{color:'var(--acid)'}}/>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.02em',lineHeight:1}}>Stage<span style={{color:'var(--acid)'}}>Chain</span></div>
            <div style={{fontSize:7,fontFamily:'var(--font-mono)',color:'var(--text-muted)',letterSpacing:'0.12em',marginTop:2}}>EMSI · BLOCKCHAIN DApp</div>
          </div>
        </div>
        {/* Wallet badge */}
        <div style={{background:'var(--bg-surface)',borderRadius:'var(--r-md)',border:'1px solid var(--border)',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px'}}>
            <div style={{width:26,height:26,borderRadius:7,background:`${cfg.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><RI size={12} style={{color:cfg.color}}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{cfg.label}</div>
              <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{shortWallet(account)}</div>
            </div>
            <div className="sc-pulse" style={{width:5,height:5,borderRadius:'50%',background:'var(--acid)',flexShrink:0}}/>
          </div>
          <button onClick={copyWallet}
            style={{width:'100%',padding:'6px 11px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:6,fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--acid)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)';}}
          >
            <Copy size={9}/><span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{account}</span>
          </button>
        </div>
      </div>

      <nav style={{flex:1,overflowY:'auto',padding:'10px 9px 0'}}>
        {cfg.items.map(item=>{
          const showSec = item.section && item.section!==lastSec;
          if(showSec) lastSec=item.section;
          const active = view===item.id; const Ic=item.icon;
          return (
            <React.Fragment key={item.id}>
              {showSec&&<div style={{padding:'12px 9px 5px',fontSize:8,fontFamily:'var(--font-mono)',color:'var(--text-muted)',letterSpacing:'0.12em',textTransform:'uppercase'}}>{item.section}</div>}
              <button onClick={()=>setView(item.id)}
                style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:'var(--r-md)',marginBottom:2,background:active?`${cfg.color}15`:'transparent',border:active?`1px solid ${cfg.color}30`:'1px solid transparent',color:active?cfg.color:'var(--text-secondary)',fontSize:13,fontWeight:active?600:400,transition:'all 0.14s',textAlign:'left'}}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--text-primary)';}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-secondary)';}}}
              ><Ic size={13}/><span style={{flex:1}}>{item.label}</span>{active&&<div style={{width:4,height:4,borderRadius:'50%',background:cfg.color}}/>}</button>
            </React.Fragment>
          );
        })}
      </nav>

      <div style={{padding:9,borderTop:'1px solid var(--border)'}}>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:'8px 12px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2}}>Réseau</div>
            <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>Block <span style={{color:'var(--text-secondary)'}}>{fakeBlock()}</span></div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <div className="sc-pulse" style={{width:5,height:5,borderRadius:'50%',background:'var(--acid)'}}/>
            <span style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--acid)'}}>Sepolia</span>
          </div>
        </div>
        <button onClick={onLogout}
          style={{width:'100%',padding:'8px 12px',borderRadius:'var(--r-md)',background:'var(--crimson-dim)',border:'1px solid rgba(245,56,75,0.25)',color:'var(--crimson)',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:7,transition:'all 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(245,56,75,0.22)'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--crimson-dim)'}
        ><LogOut size={12}/>Déconnecter MetaMask</button>
      </div>
    </aside>
  );
};

// ══════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════
const Dashboard = ({ role, account }) => {
  const cfg = ROLES[role];
  const toast = useToast();
  const [logs, setLogs] = useState([
    {msg:'UserRegistered(0xA3...F1, etudiant)',block:fakeBlock()},
    {msg:'CandidatureAccepted(offreId:12)',block:fakeBlock()},
    {msg:'ConventionSigned(convId:5)',block:fakeBlock()},
    {msg:'RapportValide(note:17.2)',block:fakeBlock()},
    {msg:'AttestationCertified(QR:emsi-0xA3...)',block:fakeBlock()},
  ]);

  const refresh = () => {
    const msgs=['UserRegistered(...)','OffrePublished(...)','CandidatureAccepted(...)','ConventionSigned(...)','RapportValide(...)','AttestationCertified(...)'];
    setLogs(l=>[{msg:rndItem(msgs),block:fakeBlock()},...l].slice(0,8));
    toast('Log blockchain rafraîchi','info');
  };

  const statsMap = {
    admin:    [{label:'Étudiants inscrits',value:'247',icon:Users,color:'acid'},{label:'Smart Contracts',value:'7',icon:GitBranch,color:'violet',sub:'SC1→SC7'},{label:'Attestations émises',value:'189',icon:Award,color:'sky'},{label:'Litiges en cours',value:'3',icon:AlertCircle,color:'amber'}],
    rh:       [{label:'Offres publiées',value:'14',icon:FilePlus,color:'amber'},{label:'Candidatures reçues',value:'87',icon:Inbox,color:'acid'},{label:'Conventions signées',value:'11',icon:FileCheck,color:'sky'},{label:'Stagiaires actifs',value:'11',icon:Users,color:'violet'}],
    etudiant: [{label:'Score matching',value:'93%',icon:Zap,color:'acid',sub:'Dev Blockchain'},{label:'Statut candidature',value:'ACCEPTÉ',icon:CheckCircle,color:'acid'},{label:'Progression',value:'Sem. 6/12',icon:Activity,color:'amber'},{label:'Note provisoire',value:'17.2/20',icon:Star,color:'sky'}],
    encadrant:[{label:'Stagiaires suivis',value:'8',icon:Users,color:'sky'},{label:'Rapports à valider',value:'3',icon:FileText,color:'amber'},{label:'Conventions actives',value:'8',icon:FileCheck,color:'acid'},{label:'Attestations à signer',value:'2',icon:Award,color:'violet'}],
    tuteur:   [{label:'Stagiaires',value:'4',icon:Users,color:'amber'},{label:'Éval. en attente',value:'2',icon:Star,color:'sky'},{label:'Présences ce mois',value:'94%',icon:Activity,color:'acid'},{label:'Rapports reçus',value:'3',icon:FileText,color:'violet'}],
  };
  const pipelineStep={admin:1,rh:3,etudiant:5,encadrant:4,tuteur:5}[role]||1;
  const stats=statsMap[role]||statsMap.admin;

  return (
    <div className="sc-fade">
      <PageHeader title="Tableau de Bord" subtitle={cfg?.label}>
        <Btn variant="secondary" small icon={RefreshCw} onClick={refresh}>Rafraîchir</Btn>
        <div style={{display:'flex',alignItems:'center',gap:7,padding:'6px 12px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'var(--acid)'}} className="sc-pulse"/>
          <Wallet size={11} style={{color:'var(--acid)'}}/>{shortWallet(account)}
        </div>
      </PageHeader>

      <GlassCard style={{marginBottom:22,padding:'16px 20px'}}>
        <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)',marginBottom:13,textTransform:'uppercase',letterSpacing:'0.1em'}}>Cycle complet du stage — 8 étapes</div>
        <Pipeline steps={['Inscription','Publication','Matching','Sélection','Convention','Suivi','Rapport','Attestation']} current={pipelineStep}/>
      </GlassCard>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:13,marginBottom:20}}>
        {stats.map((s,i)=><StatCard key={i} {...s}/>)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <div style={{fontSize:12,fontWeight:700,marginBottom:13}}>Activité on-chain</div>
          <TxLog entries={logs}/>
        </Card>
        <Card>
          <div style={{fontSize:12,fontWeight:700,marginBottom:13}}>Smart Contracts déployés</div>
          {[['SC1 — UserManager','ACTIF'],['SC2 — OffreManager','ACTIF'],['SC3 — CandidatureManager','ACTIF'],['SC4 — ConventionManager','ACTIF'],['SC5 — SuiviManager','ACTIF'],['SC6 — RapportManager','ACTIF'],['SC7 — CertifManager','ACTIF']].map(([n,s],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>{n}</span><Tag label={s} color="acid"/>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ADMIN — GESTION COMPTES SC1
// ══════════════════════════════════════════════════════════
const AdminUsers = () => {
  const toast=useToast(); const {sign}=useMetaMask();
  const [users,setUsers]=useState([
    {id:1,wallet:'0xA3F1...9B2E',nom:'Amine Filali',   role:'Étudiant', filiere:'Génie Logiciel',block:'#842'},
    {id:2,wallet:'0xC7D2...3F1A',nom:'Sara Karimi',    role:'Étudiant', filiere:'CyberSécurité', block:'#843'},
    {id:3,wallet:'0xE8B4...7A3D',nom:'Dr. Hassan M.',  role:'Encadrant',filiere:'IA & BigData',  block:'#849'},
    {id:4,wallet:'0xF2A1...6C3B',nom:'Youssef Alami',  role:'Étudiant', filiere:'Réseaux',       block:'#856'},
  ]);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({wallet:'',nom:'',role:'Étudiant',filiere:''});
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({});
  const [delTarget,setDelTarget]=useState(null);
  const [search,setSearch]=useState('');

  const filtered=users.filter(u=>
    u.nom.toLowerCase().includes(search.toLowerCase())||
    u.filiere.toLowerCase().includes(search.toLowerCase())||
    u.role.toLowerCase().includes(search.toLowerCase())
  );
  const handleAdd=()=>{
    if(!form.wallet.trim()||!form.nom.trim()||!form.filiere.trim()){toast('Remplissez tous les champs !','error');return;}
    sign(`SC1.addUser(${form.nom})`,()=>{
      setUsers(u=>[...u,{id:Date.now(),wallet:form.wallet,nom:form.nom,role:form.role,filiere:form.filiere,block:fakeBlock()}]);
      setForm({wallet:'',nom:'',role:'Étudiant',filiere:''});
      setShowForm(false);
    });
  };
  const startEdit=(u)=>{setEditId(u.id);setEditForm({...u});};
  const saveEdit=()=>sign('SC1.updateUser()',()=>{setUsers(u=>u.map(x=>x.id===editId?{...editForm}:x));setEditId(null);});
  const handleDelete=()=>sign('SC1.removeUser()',()=>{setUsers(u=>u.filter(x=>x.id!==delTarget.id));setDelTarget(null);});

  return (
    <div className="sc-fade">
      <PageHeader title="Gestion des Comptes" subtitle="SC1 — UserManager">
        <Btn icon={UserPlus} onClick={()=>{setShowForm(!showForm);setEditId(null);}}>{showForm?'Fermer':'+ Nouveau compte'}</Btn>
      </PageHeader>
      <Alrt type="info" message="L'administrateur enregistre les wallets on-chain (SC1). Chaque wallet est vérifié avant activation."/>
      {showForm&&(
        <GlassCard glow style={{marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--acid)',marginBottom:16}}>SC1.addStudent() / addEncadrant()</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13,marginBottom:13}}>
            <Inp label="Adresse Wallet *" placeholder="0x..." value={form.wallet} onChange={e=>setForm(f=>({...f,wallet:e.target.value}))} icon={Wallet}/>
            <Inp label="Nom complet *" placeholder="Prénom NOM" value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} icon={User}/>
            <Sel label="Rôle" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} options={['Étudiant','Encadrant Universitaire','Tuteur Entreprise']}/>
            <Inp label="Filière *" placeholder="ex: CyberSécurité" value={form.filiere} onChange={e=>setForm(f=>({...f,filiere:e.target.value}))} icon={BookOpen}/>
          </div>
          <div style={{display:'flex',gap:9}}>
            <Btn icon={Send} onClick={handleAdd}>Enregistrer On-Chain via MetaMask</Btn>
            <Btn variant="ghost" onClick={()=>setShowForm(false)}>Annuler</Btn>
          </div>
        </GlassCard>
      )}
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,gap:12}}>
          <span style={{fontSize:13,fontWeight:700}}>Wallets enregistrés ({filtered.length}/{users.length})</span>
          <Inp placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} icon={Search}/>
        </div>
        {filtered.length===0&&<div style={{textAlign:'center',padding:24,color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:12}}>Aucun compte trouvé.</div>}
        <div style={{display:'grid',gap:9}}>
          {filtered.map(u=>(
            editId===u.id?(
              <div key={u.id} style={{padding:'14px 16px',background:'var(--bg-surface)',border:'1px solid var(--border-hi)',borderRadius:'var(--r-md)'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <Inp label="Wallet" value={editForm.wallet} onChange={e=>setEditForm(f=>({...f,wallet:e.target.value}))} icon={Wallet}/>
                  <Inp label="Nom" value={editForm.nom} onChange={e=>setEditForm(f=>({...f,nom:e.target.value}))} icon={User}/>
                  <Sel label="Rôle" value={editForm.role} onChange={e=>setEditForm(f=>({...f,role:e.target.value}))} options={['Étudiant','Encadrant Universitaire','Tuteur Entreprise']}/>
                  <Inp label="Filière" value={editForm.filiere} onChange={e=>setEditForm(f=>({...f,filiere:e.target.value}))} icon={BookOpen}/>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Btn small icon={Save} onClick={saveEdit}>Sauvegarder via MetaMask</Btn>
                  <Btn small variant="ghost" onClick={()=>setEditId(null)}>Annuler</Btn>
                </div>
              </div>
            ):(
              <div key={u.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',transition:'border-color 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-md)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
              >
                <div style={{width:33,height:33,borderRadius:9,background:'var(--acid-dim)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14,fontWeight:800,color:'var(--acid)'}}>{u.nom[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{u.nom}</div>
                  <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{u.wallet} · {u.filiere}</div>
                </div>
                <Tag label={u.role} color="acid"/>
                <span style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>Block {u.block}</span>
                <Btn small variant="ghost" icon={Edit2} onClick={()=>startEdit(u)}>Modifier</Btn>
                <button onClick={()=>setDelTarget(u)}
                  style={{color:'var(--crimson)',padding:6,borderRadius:'var(--r-sm)',transition:'background 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--crimson-dim)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                ><Trash2 size={14}/></button>
              </div>
            )
          ))}
        </div>
      </Card>
      <Modal open={!!delTarget} onClose={()=>setDelTarget(null)} title="Confirmer la suppression">
        <Alrt type="error" message={`Supprimer "${delTarget?.nom}" de la blockchain ? Action irréversible.`}/>
        <div style={{display:'flex',gap:9,marginTop:16}}>
          <Btn variant="danger" icon={Trash2} full onClick={handleDelete}>Confirmer & Signer via MetaMask</Btn>
          <Btn variant="ghost" onClick={()=>setDelTarget(null)}>Annuler</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ADMIN — RESEAU
// ══════════════════════════════════════════════════════════
const Reseau = () => {
  const toast=useToast();
  const [nodes,setNodes]=useState([
    {id:1,name:'Nœud Principal (Port 8545)',status:'ACTIF',peers:7},
    {id:2,name:'Nœud Secondaire A',status:'ACTIF',peers:5},
    {id:3,name:'Nœud Secondaire B',status:'ACTIF',peers:4},
    {id:4,name:'Nœud IPFS Kubo',status:'ACTIF',peers:12},
    {id:5,name:'API REST Express.js :5000',status:'ACTIF',peers:null},
  ]);
  const restart=(id)=>{
    setNodes(n=>n.map(x=>x.id===id?{...x,status:'REDÉMARRAGE'}:x));
    toast('Nœud en cours de redémarrage...','warning');
    setTimeout(()=>{setNodes(n=>n.map(x=>x.id===id?{...x,status:'ACTIF'}:x));toast('Nœud redémarré !','success');},2500);
  };
  const stop=(id)=>{setNodes(n=>n.map(x=>x.id===id?{...x,status:'ARRÊTÉ'}:x));toast('Nœud arrêté','warning');};
  const start=(id)=>{
    setNodes(n=>n.map(x=>x.id===id?{...x,status:'DÉMARRAGE'}:x));
    setTimeout(()=>{setNodes(n=>n.map(x=>x.id===id?{...x,status:'ACTIF'}:x));toast('Nœud démarré !','success');},2000);
  };
  return (
    <div className="sc-fade">
      <PageHeader title="Réseau Blockchain" subtitle="Infrastructure">
        <Btn variant="secondary" small icon={RefreshCw} onClick={()=>toast('Réseau rafraîchi','info')}>Rafraîchir</Btn>
      </PageHeader>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:13,marginBottom:20}}>
        <StatCard label="Nœuds actifs" value={nodes.filter(n=>n.status==='ACTIF').length.toString()} icon={Network} color="acid"/>
        <StatCard label="Dernier bloc" value={fakeBlock()} icon={Cpu} color="sky"/>
        <StatCard label="Gas moyen" value="21 Gwei" icon={Zap} color="amber"/>
      </div>
      <Card>
        <div style={{fontSize:12,fontWeight:700,marginBottom:14}}>Statut des nœuds Hardhat</div>
        {nodes.map(n=>(
          <div key={n.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className={n.status==='ACTIF'?'sc-pulse':''} style={{width:7,height:7,borderRadius:'50%',background:n.status==='ACTIF'?'var(--acid)':n.status==='ARRÊTÉ'?'var(--crimson)':'var(--amber)',flexShrink:0}}/>
              <span style={{fontSize:12,fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>{n.name}{n.peers!=null?` · ${n.peers} pairs`:''}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <Tag label={n.status} color={n.status==='ACTIF'?'acid':n.status==='ARRÊTÉ'?'crimson':'amber'}/>
              {n.status==='ACTIF'&&<><Btn variant="ghost" small onClick={()=>restart(n.id)}>Redémarrer</Btn><Btn variant="danger" small onClick={()=>stop(n.id)}>Arrêter</Btn></>}
              {n.status==='ARRÊTÉ'&&<Btn small onClick={()=>start(n.id)}>Démarrer</Btn>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ADMIN — STATS
// ══════════════════════════════════════════════════════════
const AdminStats = () => {
  const toast=useToast();
  return (
    <div className="sc-fade">
      <PageHeader title="Statistiques Globales" subtitle="Système">
        <Btn variant="secondary" small icon={Download} onClick={()=>toast('Export CSV généré !','success')}>Exporter CSV</Btn>
        <Btn variant="ghost" small icon={RefreshCw} onClick={()=>toast('Données rafraîchies','info')}>Rafraîchir</Btn>
      </PageHeader>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:13,marginBottom:20}}>
        <StatCard label="Stages actifs" value="11" icon={Activity} color="acid"/>
        <StatCard label="Attestations émises" value="189" icon={Award} color="sky"/>
        <StatCard label="Taux complétion" value="76%" icon={CheckCircle} color="violet"/>
        <StatCard label="Entreprises partenaires" value="23" icon={Building2} color="amber"/>
      </div>
      <GlassCard>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700}}>Progression mensuelle</div>
          <Btn variant="ghost" small icon={Download} onClick={()=>toast('Graphique exporté !','success')}>PNG</Btn>
        </div>
        <div style={{display:'flex',alignItems:'flex-end',gap:7,height:100}}>
          {[45,72,89,63,94,120,108,135,156,142,189,201].map((v,i)=>(
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
              <div style={{width:'100%',background:'linear-gradient(180deg,var(--acid),rgba(0,240,160,0.3))',borderRadius:'3px 3px 0 0',height:`${(v/201)*100}%`,minHeight:4}}/>
              <span style={{fontSize:7,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ADMIN — LITIGES
// ══════════════════════════════════════════════════════════
const AdminLitiges = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [litiges,setLitiges]=useState([
    {id:'#L-001',parties:'Amine Filali vs TechCorp SA',motif:'Non-validation du rapport final',date:'2025-11-14',urgent:true,status:'EN_ATTENTE',decision:''},
    {id:'#L-002',parties:'Sara Karimi vs DataLabs',motif:'Convention non signée dans les délais',date:'2025-11-18',urgent:false,status:'EN_ATTENTE',decision:''},
    {id:'#L-003',parties:'Youssef Alami vs StartupX',motif:'Attestation contestée',date:'2025-11-20',urgent:false,status:'RÉSOLU',decision:'Attestation confirmée authentique.'},
  ]);
  const [openId,setOpenId]=useState(null);
  const [decisionText,setDecisionText]=useState('');

  const handle=(id,action)=>{
    if(action==='RÉSOLU'&&!decisionText.trim()){toast('Rédigez une décision motivée !','error');return;}
    sign(`SC1.arbitrer(${id})`,()=>{
      setLitiges(l=>l.map(x=>x.id===id?{...x,status:action,decision:decisionText}:x));
      setOpenId(null); setDecisionText('');
    });
  };
  return (
    <div className="sc-fade">
      <PageHeader title="Litiges & Arbitrage" subtitle="Administration"/>
      {litiges.filter(l=>l.status==='EN_ATTENTE').length>0&&
        <Alrt type="warning" message={`${litiges.filter(l=>l.status==='EN_ATTENTE').length} litige(s) en attente. Chaque décision est enregistrée on-chain.`}/>
      }
      <div style={{display:'grid',gap:11}}>
        {litiges.map(l=>(
          <Card key={l.id}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:5}}>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--acid)'}}>{l.id}</span>
                  {l.urgent&&<Tag label="URGENT" color="crimson"/>}
                  <Tag label={l.status} color={l.status==='EN_ATTENTE'?'amber':l.status==='RÉSOLU'?'acid':'crimson'}/>
                </div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{l.parties}</div>
                <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:3}}>{l.motif} · {l.date}</div>
                {l.decision&&<div style={{marginTop:7,padding:'7px 10px',background:'var(--acid-dim)',border:'1px solid var(--border-md)',borderRadius:'var(--r-sm)',fontSize:11,color:'var(--acid)'}}>Décision : {l.decision}</div>}
              </div>
              {l.status==='EN_ATTENTE'&&(
                <div style={{display:'flex',gap:8,marginLeft:14}}>
                  <Btn variant="danger" small icon={XCircle} onClick={()=>{setDecisionText('Litige rejeté : preuves insuffisantes.');handle(l.id,'REJETÉ');}}>Rejeter</Btn>
                  <Btn small icon={MessageSquare} onClick={()=>setOpenId(openId===l.id?null:l.id)}>Décider</Btn>
                </div>
              )}
            </div>
            {openId===l.id&&(
              <div className="sc-fade" style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
                <Txta label="Décision motivée (archivée on-chain)" placeholder="Expliquez la décision d'arbitrage..." rows={3} value={decisionText} onChange={e=>setDecisionText(e.target.value)}/>
                <div style={{display:'flex',gap:9,marginTop:11}}>
                  <Btn icon={CheckCircle} onClick={()=>handle(l.id,'RÉSOLU')}>Résoudre & Signer MetaMask</Btn>
                  <Btn variant="ghost" onClick={()=>setOpenId(null)}>Fermer</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// RH — OFFRES SC2
// ══════════════════════════════════════════════════════════
const RhOffres = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [offres,setOffres]=useState([
    {id:1,titre:'Développeur Blockchain Junior',domaine:'Blockchain/Web3',duree:'3 mois',ville:'Casablanca',competences:'Solidity, React',status:'PUBLIÉ',candidats:12,date:'2025-11-01'},
    {id:2,titre:'CyberSécurité Analyste',domaine:'Cybersécurité',duree:'4 mois',ville:'Marrakech',competences:'Python, Pen Testing',status:'PUBLIÉ',candidats:8,date:'2025-11-03'},
    {id:3,titre:'DevOps Engineer',domaine:'DevOps/Cloud',duree:'2 mois',ville:'Rabat',competences:'Docker, K8s',status:'FERMÉ',candidats:5,date:'2025-10-15'},
  ]);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({titre:'',duree:'',competences:'',ville:'',domaine:'Développement Web',niveau:'Bac+5'});
  const [editModal,setEditModal]=useState(null);
  const [closeTarget,setCloseTarget]=useState(null);
  const [detailTarget,setDetailTarget]=useState(null);

  const handlePublish=()=>{
    if(!form.titre.trim()||!form.duree.trim()||!form.ville.trim()){toast('Remplissez les champs obligatoires !','error');return;}
    sign(`SC2.publishOffre(${form.titre})`,()=>{
      setOffres(o=>[...o,{id:Date.now(),...form,status:'PUBLIÉ',candidats:0,date:todayStr()}]);
      setForm({titre:'',duree:'',competences:'',ville:'',domaine:'Développement Web',niveau:'Bac+5'});
      setShowForm(false);
    });
  };
  const handleClose=(id)=>sign('SC2.closeOffre()',()=>{setOffres(o=>o.map(x=>x.id===id?{...x,status:'FERMÉ'}:x));setCloseTarget(null);});
  const handleSaveEdit=()=>sign('SC2.updateOffre()',()=>{setOffres(o=>o.map(x=>x.id===editModal.id?{...editModal}:x));setEditModal(null);toast('Offre mise à jour','success');});

  return (
    <div className="sc-fade">
      <PageHeader title="Mes Offres de Stage" subtitle="SC2 — OffreManager">
        <Btn icon={FilePlus} onClick={()=>setShowForm(!showForm)}>{showForm?'Fermer':'+ Nouvelle offre'}</Btn>
      </PageHeader>
      {showForm&&(
        <GlassCard glow style={{marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--acid)',marginBottom:14}}>SC2.publishOffre()</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13,marginBottom:13}}>
            <Inp label="Titre *" placeholder="ex: Développeur Blockchain Junior" value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} icon={Briefcase}/>
            <Inp label="Durée *" placeholder="ex: 3 mois" value={form.duree} onChange={e=>setForm(f=>({...f,duree:e.target.value}))} icon={Clock}/>
            <Inp label="Compétences" placeholder="ex: Solidity, React" value={form.competences} onChange={e=>setForm(f=>({...f,competences:e.target.value}))} icon={Zap}/>
            <Inp label="Ville *" placeholder="ex: Casablanca" value={form.ville} onChange={e=>setForm(f=>({...f,ville:e.target.value}))} icon={Globe}/>
            <Sel label="Domaine" value={form.domaine} onChange={e=>setForm(f=>({...f,domaine:e.target.value}))} options={['Développement Web/Mobile','Cybersécurité','Data Science / IA','DevOps / Cloud','Blockchain / Web3']}/>
            <Sel label="Niveau" value={form.niveau} onChange={e=>setForm(f=>({...f,niveau:e.target.value}))} options={['Bac+3','Bac+4','Bac+5 (Master/Ingénieur)']}/>
          </div>
          <div style={{display:'flex',gap:9}}>
            <Btn icon={Send} full onClick={handlePublish}>Publier sur la Blockchain via MetaMask</Btn>
            <Btn variant="ghost" onClick={()=>setShowForm(false)}>Annuler</Btn>
          </div>
        </GlassCard>
      )}
      <div style={{display:'grid',gap:11}}>
        {offres.map(o=>(
          <Card key={o.id} style={{padding:'14px 17px'}}>
            <div style={{display:'flex',alignItems:'center',gap:13}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:700}}>{o.titre}</span>
                  <Tag label={o.status} color={o.status==='PUBLIÉ'?'acid':'muted'}/>
                </div>
                <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:2}}>{o.domaine} · {o.ville} · {o.duree}</div>
                <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{o.competences} · {o.date}</div>
              </div>
              <div style={{textAlign:'center',padding:'6px 12px',background:'var(--acid-dim)',border:'1px solid var(--border-md)',borderRadius:'var(--r-md)',minWidth:54}}>
                <div style={{fontSize:20,fontWeight:800,color:'var(--acid)',fontFamily:'var(--font-mono)'}}>{o.candidats}</div>
                <div style={{fontSize:8,color:'var(--text-muted)',textTransform:'uppercase'}}>Candidats</div>
              </div>
              <div style={{display:'flex',gap:7}}>
                <Btn variant="ghost" small icon={Eye} onClick={()=>setDetailTarget(o)}>Détails</Btn>
                {o.status==='PUBLIÉ'&&<Btn variant="secondary" small icon={Edit2} onClick={()=>setEditModal({...o})}>Modifier</Btn>}
                {o.status==='PUBLIÉ'&&<Btn variant="danger" small icon={XCircle} onClick={()=>setCloseTarget(o.id)}>Fermer</Btn>}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!detailTarget} onClose={()=>setDetailTarget(null)} title={`Détails — ${detailTarget?.titre}`}>
        {detailTarget&&<><ML label="Domaine" value={detailTarget.domaine}/><ML label="Durée" value={detailTarget.duree}/><ML label="Ville" value={detailTarget.ville}/><ML label="Compétences" value={detailTarget.competences}/><ML label="Candidats" value={detailTarget.candidats.toString()} color="var(--acid)"/><ML label="Statut" value={detailTarget.status}/><div style={{marginTop:14}}><Btn variant="ghost" full onClick={()=>setDetailTarget(null)}>Fermer</Btn></div></>}
      </Modal>
      <Modal open={!!editModal} onClose={()=>setEditModal(null)} title="Modifier l'offre">
        {editModal&&<><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13,marginBottom:13}}>
          <Inp label="Titre" value={editModal.titre} onChange={e=>setEditModal(m=>({...m,titre:e.target.value}))} icon={Briefcase}/>
          <Inp label="Durée" value={editModal.duree} onChange={e=>setEditModal(m=>({...m,duree:e.target.value}))} icon={Clock}/>
          <Inp label="Compétences" value={editModal.competences} onChange={e=>setEditModal(m=>({...m,competences:e.target.value}))} icon={Zap}/>
          <Inp label="Ville" value={editModal.ville} onChange={e=>setEditModal(m=>({...m,ville:e.target.value}))} icon={Globe}/>
        </div><div style={{display:'flex',gap:9}}><Btn icon={Save} full onClick={handleSaveEdit}>Sauvegarder via MetaMask</Btn><Btn variant="ghost" onClick={()=>setEditModal(null)}>Annuler</Btn></div></>}
      </Modal>
      <Modal open={!!closeTarget} onClose={()=>setCloseTarget(null)} title="Fermer l'offre ?">
        <Alrt type="warning" message="Fermer cette offre empêchera de nouvelles candidatures. Action irréversible on-chain."/>
        <div style={{display:'flex',gap:9,marginTop:14}}><Btn variant="danger" full onClick={()=>handleClose(closeTarget)}>Confirmer & Signer via MetaMask</Btn><Btn variant="ghost" onClick={()=>setCloseTarget(null)}>Annuler</Btn></div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// RH — CANDIDATS SC3
// ══════════════════════════════════════════════════════════
const RhCandidats = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [filter,setFilter]=useState('ALL');
  const [candidats,setCandidats]=useState([
    {id:1,name:'Amine Filali',  wallet:'0xA3...9B',filiere:'Génie Logiciel',competences:'React, Solidity',match:95,status:'EN_ATTENTE',note:''},
    {id:2,name:'Sara Karimi',   wallet:'0xC7...1A',filiere:'CyberSécurité', competences:'Python, Blockchain',match:88,status:'EN_ATTENTE',note:''},
    {id:3,name:'Youssef Alami', wallet:'0xE8...3D',filiere:'IA & BigData',  competences:'ML, Data',match:74,status:'ACCEPTE',note:'Profil solide.'},
    {id:4,name:'Fatima Benali', wallet:'0xF2...7C',filiere:'Réseaux',        competences:'DevOps, Docker',match:68,status:'REFUSE',note:'Hors domaine.'},
  ]);
  const [noteModal,setNoteModal]=useState(null);
  const [noteText,setNoteText]=useState('');
  const [detailModal,setDetailModal]=useState(null);

  const handle=(id,action)=>sign(`SC3.${action.toLowerCase()}(id:${id})`,()=>setCandidats(c=>c.map(x=>x.id===id?{...x,status:action}:x)));
  const saveNote=()=>{
    if(!noteText.trim()){toast('Écrivez une note !','error');return;}
    setCandidats(c=>c.map(x=>x.id===noteModal?{...x,note:noteText}:x));
    toast('Note enregistrée','success'); setNoteModal(null); setNoteText('');
  };
  const SC={EN_ATTENTE:'amber',ACCEPTE:'acid',REFUSE:'crimson'};
  const shown=filter==='ALL'?candidats:candidats.filter(c=>c.status===filter);
  const count=(s)=>candidats.filter(c=>c.status===s).length;

  return (
    <div className="sc-fade">
      <PageHeader title="Gestion des Candidatures" subtitle="SC3 — CandidatureManager">
        <div style={{display:'flex',gap:7}}>
          {['ALL','EN_ATTENTE','ACCEPTE','REFUSE'].map(f=>(
            <Btn key={f} variant={filter===f?'primary':'ghost'} small onClick={()=>setFilter(f)}>
              {f==='ALL'?`Tous(${candidats.length})`:f==='EN_ATTENTE'?`Attente(${count('EN_ATTENTE')})`:f==='ACCEPTE'?`Acceptés(${count('ACCEPTE')})`:`Refusés(${count('REFUSE')})`}
            </Btn>
          ))}
        </div>
      </PageHeader>
      <div style={{display:'grid',gap:11}}>
        {shown.map(c=>(
          <Card key={c.id} style={{padding:'14px 17px'}}>
            <div style={{display:'flex',alignItems:'center',gap:13}}>
              <div style={{width:38,height:38,borderRadius:11,background:'var(--acid-dim)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:15,fontWeight:800,color:'var(--acid)'}}>{c.name[0]}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:3}}>
                  <span style={{fontSize:14,fontWeight:700}}>{c.name}</span>
                  <Tag label={c.status} color={SC[c.status]||'muted'}/>
                </div>
                <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{c.wallet} · {c.filiere}</div>
                <div style={{fontSize:11,color:'var(--text-secondary)',marginTop:2}}>{c.competences}</div>
                {c.note&&<div style={{fontSize:10,color:'var(--text-muted)',marginTop:2,fontStyle:'italic'}}>Note RH : {c.note}</div>}
              </div>
              <div style={{textAlign:'center',padding:'6px 11px',background:'var(--acid-dim)',border:'1px solid var(--border-md)',borderRadius:'var(--r-md)',minWidth:55}}>
                <div style={{fontSize:19,fontWeight:800,color:'var(--acid)',fontFamily:'var(--font-mono)'}}>{c.match}%</div>
                <div style={{fontSize:7,color:'var(--text-muted)',textTransform:'uppercase'}}>Match</div>
              </div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap',justifyContent:'flex-end'}}>
                <Btn variant="ghost" small icon={Eye} onClick={()=>setDetailModal(c)}>Profil</Btn>
                <Btn variant="ghost" small icon={MessageSquare} onClick={()=>{setNoteModal(c.id);setNoteText(c.note||'');}}>Note</Btn>
                {c.status==='EN_ATTENTE'&&<><Btn variant="danger" small icon={XCircle} onClick={()=>handle(c.id,'REFUSE')}>Refuser</Btn><Btn small icon={CheckCircle} onClick={()=>handle(c.id,'ACCEPTE')}>Accepter</Btn></>}
                {c.status==='ACCEPTE'&&<Tag label="Convention générée SC4" color="acid"/>}
              </div>
            </div>
          </Card>
        ))}
        {shown.length===0&&<div style={{textAlign:'center',padding:28,color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:12}}>Aucune candidature dans cette catégorie.</div>}
      </div>
      <Modal open={!!noteModal} onClose={()=>setNoteModal(null)} title="Note RH interne">
        <Txta label="Note interne (non visible par l'étudiant)" placeholder="Commentaire sur le profil..." rows={4} value={noteText} onChange={e=>setNoteText(e.target.value)}/>
        <div style={{display:'flex',gap:9,marginTop:14}}><Btn icon={Save} full onClick={saveNote}>Enregistrer</Btn><Btn variant="ghost" onClick={()=>setNoteModal(null)}>Annuler</Btn></div>
      </Modal>
      <Modal open={!!detailModal} onClose={()=>setDetailModal(null)} title={`Profil — ${detailModal?.name}`}>
        {detailModal&&<><ML label="Wallet" value={detailModal.wallet}/><ML label="Filière" value={detailModal.filiere}/><ML label="Compétences" value={detailModal.competences}/><ML label="Score matching" value={`${detailModal.match}%`} color="var(--acid)"/><ML label="Statut" value={detailModal.status}/><div style={{marginTop:14}}><Btn variant="ghost" full onClick={()=>setDetailModal(null)}>Fermer</Btn></div></>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// RH — CONVENTIONS SC4
// ══════════════════════════════════════════════════════════
const RhConvention = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [conventions,setConventions]=useState([
    {id:1,conv:'#CONV-008',etudiant:'Amine Filali', offre:'Dev Blockchain',  sigEtu:true, sigRH:false,sigAdmin:false,cid:fakeCID()},
    {id:2,conv:'#CONV-009',etudiant:'Sara Karimi',  offre:'CyberSec Analyst',sigEtu:true, sigRH:true, sigAdmin:false,cid:fakeCID()},
  ]);
  const [detailModal,setDetailModal]=useState(null);
  const signRH=(id)=>sign(`SC4.signerConvention(${id}, role:RH)`,()=>setConventions(c=>c.map(x=>x.id===id?{...x,sigRH:true}:x)));
  return (
    <div className="sc-fade">
      <PageHeader title="Conventions de Stage" subtitle="SC4 — ConventionManager"/>
      <Alrt type="success" message="SC4 : 3 signatures requises (Étudiant + RH + Admin). Convention active seulement après les 3 validations."/>
      <div style={{display:'grid',gap:13}}>
        {conventions.map(c=>{
          const all=c.sigEtu&&c.sigRH&&c.sigAdmin;
          return (
            <GlassCard key={c.id} glow={all}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:13}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:4}}>
                    <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--acid)'}}>{c.conv}</span>
                    {all?<Tag label="ACTIVE" color="acid"/>:<Tag label="EN ATTENTE" color="amber"/>}
                  </div>
                  <div style={{fontSize:15,fontWeight:700}}>{c.etudiant} — {c.offre}</div>
                  <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)',marginTop:2}}>{c.cid}</div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Btn small variant="secondary" icon={Eye} onClick={()=>setDetailModal(c)}>Détails</Btn>
                  <Btn small variant="ghost" icon={Download} onClick={()=>toast(`PDF ${c.conv} en cours...`,'info')}>PDF</Btn>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9,marginBottom:13}}>
                {[{l:'Étudiant',d:c.sigEtu},{l:'RH',d:c.sigRH},{l:'Admin',d:c.sigAdmin}].map((s,j)=>(
                  <div key={j} style={{padding:'10px 13px',background:s.d?'var(--acid-dim)':'var(--bg-surface)',border:`1px solid ${s.d?'var(--border-hi)':'var(--border)'}`,borderRadius:'var(--r-md)',display:'flex',alignItems:'center',gap:8}}>
                    {s.d?<CheckCircle size={13} style={{color:'var(--acid)'}}/>:<Circle size={13} style={{color:'var(--text-muted)'}}/>}
                    <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:s.d?'var(--acid)':'var(--text-muted)'}}>Sig. {s.l}</span>
                  </div>
                ))}
              </div>
              {!c.sigRH&&<Btn icon={Key} onClick={()=>signRH(c.id)}>Signer via MetaMask — SC4.signerConvention()</Btn>}
            </GlassCard>
          );
        })}
      </div>
      <Modal open={!!detailModal} onClose={()=>setDetailModal(null)} title={`Convention ${detailModal?.conv}`}>
        {detailModal&&<><ML label="Étudiant" value={detailModal.etudiant}/><ML label="Offre" value={detailModal.offre}/><ML label="CID IPFS" value={detailModal.cid} color="var(--sky)"/><ML label="Sig. Étudiant" value={detailModal.sigEtu?'✓ Signé':'En attente'} color={detailModal.sigEtu?'var(--acid)':'var(--amber)'}/><ML label="Sig. RH" value={detailModal.sigRH?'✓ Signé':'En attente'} color={detailModal.sigRH?'var(--acid)':'var(--amber)'}/><ML label="Sig. Admin" value={detailModal.sigAdmin?'✓ Signé':'En attente'} color={detailModal.sigAdmin?'var(--acid)':'var(--amber)'}/><div style={{marginTop:14}}><Btn variant="ghost" full onClick={()=>setDetailModal(null)}>Fermer</Btn></div></>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// RH — VÉRIFICATION ATTESTATION (intégré dans RH)
// ══════════════════════════════════════════════════════════
const RhVerif = () => {
  const toast=useToast();
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [invalid,setInvalid]=useState(false);

  const verify=()=>{
    if(!input.trim()){toast('Entrez un hash ou adresse wallet !','error');return;}
    setLoading(true); setResult(null); setInvalid(false);
    toast('Interrogation SC7 on-chain...','loading');
    setTimeout(()=>{
      setLoading(false);
      // Simuler résultat valide ou invalide selon l'input
      if(input.toLowerCase().includes('fake')||input.toLowerCase().includes('faux')){
        setInvalid(true);
        toast('⚠ Attestation NON authentique — falsification détectée !','error');
      } else {
        setResult({valid:true,nom:'Amine Filali',note:'17.2/20',date:'2026-03-20',entreprise:'TechCorp SA',duree:'3 mois',hash:fakeHash(),cid:fakeCID(),block:fakeBlock()});
        toast('Attestation authentique confirmée !','success');
      }
    },1800);
  };
  const reset=()=>{setInput('');setResult(null);setInvalid(false);};

  return (
    <div className="sc-fade">
      <PageHeader title="Vérification des Attestations" subtitle="SC7 — Vérification On-Chain"/>
      <Alrt type="info" message="Vérifiez l'authenticité d'une attestation StageChain. Comparaison du hash PDF avec le hash ancré on-chain. Résultat instantané."/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <GlassCard glow>
          <div style={{fontSize:13,fontWeight:700,color:'var(--acid)',marginBottom:4}}>SC7.verifier()</div>
          <div style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)',marginBottom:18,lineHeight:1.6}}>
            Entrez le hash PDF, le CID IPFS ou l'adresse wallet de l'étudiant pour vérifier son attestation.
          </div>
          <Inp label="Hash PDF / CID IPFS / Adresse Wallet" placeholder="0x... ou Qm... (entrez 'fake' pour tester un faux)" value={input} onChange={e=>setInput(e.target.value)} icon={Search}/>
          <div style={{display:'flex',gap:9,marginTop:13}}>
            <Btn loading={loading} icon={Shield} full onClick={verify}>{loading?'Vérification...':'Vérifier l\'authenticité on-chain'}</Btn>
            {(result||invalid)&&<Btn variant="ghost" icon={RefreshCw} onClick={reset}>Reset</Btn>}
          </div>

          {invalid&&(
            <div className="sc-fade" style={{marginTop:16}}>
              <Alrt type="error" message="⚠ ATTESTATION NON AUTHENTIQUE — Hash différent du hash on-chain. Falsification probable détectée !"/>
              <div style={{padding:'14px',background:'var(--crimson-dim)',border:'1px solid rgba(245,56,75,0.3)',borderRadius:'var(--r-md)',fontSize:12,color:'var(--crimson)',fontFamily:'var(--font-mono)'}}>
                Ce document ne correspond à aucune attestation certifiée sur la blockchain StageChain.
              </div>
            </div>
          )}

          {result&&(
            <div className="sc-fade" style={{marginTop:16}}>
              <Alrt type="success" message="✓ ATTESTATION AUTHENTIQUE — Hash identique au hash ancré on-chain. Aucune falsification."/>
            </div>
          )}
        </GlassCard>

        <div>
          {result&&(
            <Card className="sc-fade">
              <div style={{fontSize:12,fontWeight:700,marginBottom:13,color:'var(--acid)'}}>Résultat de la vérification</div>
              <ML label="Titulaire" value={result.nom}/>
              <ML label="Entreprise" value={result.entreprise}/>
              <ML label="Durée stage" value={result.duree}/>
              <ML label="Note finale" value={result.note} color="var(--acid)"/>
              <ML label="Date certification" value={result.date}/>
              <ML label="TX Hash Ethereum" value={result.hash} color="var(--sky)"/>
              <ML label="CID IPFS" value={result.cid} color="var(--sky)"/>
              <ML label="Block ancré" value={result.block}/>
              <ML label="Statut" value="AUTHENTIQUE ✓" color="var(--acid)"/>
              <div style={{marginTop:14,display:'flex',gap:9}}>
                <Btn small icon={Download} onClick={()=>toast('Rapport de vérification téléchargé','success')}>Télécharger rapport</Btn>
                <Btn small variant="ghost" icon={ExternalLink} onClick={()=>toast('Ouverture Etherscan...','info')}>Etherscan</Btn>
              </div>
            </Card>
          )}
          {!result&&!invalid&&(
            <Card style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:200}}>
              <Shield size={32} style={{color:'var(--text-muted)',marginBottom:12}}/>
              <div style={{fontSize:12,fontFamily:'var(--font-mono)',color:'var(--text-muted)',textAlign:'center'}}>
                Entrez un identifiant pour vérifier une attestation
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ÉTUDIANT — MATCHING
// ══════════════════════════════════════════════════════════
const Matching = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [searching,setSearching]=useState(false);
  const [done,setDone]=useState(false);
  const [postule,setPostule]=useState([]);
  const [detailModal,setDetailModal]=useState(null);
  const offres=[
    {id:1,titre:'Développeur Blockchain Junior',entreprise:'TechCorp SA',ville:'Casablanca',duree:'3 mois',competences:'Solidity, React, IPFS',match:95},
    {id:2,titre:'CyberSécurité Analyste',entreprise:'DataLabs',ville:'Marrakech',duree:'4 mois',competences:'Python, Pen Testing',match:82},
    {id:3,titre:'Développeur Full-Stack',entreprise:'StartupX',ville:'Rabat',duree:'2 mois',competences:'React, Node.js',match:71},
    {id:4,titre:'Data Scientist Junior',entreprise:'AIGroup',ville:'Casablanca',duree:'3 mois',competences:'Python, ML',match:65},
  ];
  const search=()=>{
    setSearching(true); toast('Analyse des profils on-chain...','loading');
    setTimeout(()=>{setSearching(false);setDone(true);toast(`${offres.length} offres compatibles trouvées !`,'success');},2000);
  };
  const postuler=(o)=>{
    if(postule.includes(o.id)){toast('Déjà postulé à cette offre !','warning');return;}
    sign(`SC3.postuler(offreId:${o.id})`,()=>setPostule(p=>[...p,o.id]));
  };
  return (
    <div className="sc-fade">
      <PageHeader title="Moteur de Matching" subtitle="SC2 + SC3 — Algorithme IA"/>
      <GlassCard glow style={{marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--acid)',marginBottom:3}}>Algorithme SC3 — 5 critères pondérés</div>
        <div style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)',marginBottom:16}}>Compétences 35% · Filière 25% · Niveau 20% · Domaine 10% · Ville 10%</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:9,marginBottom:16}}>
          {[['Compétences',35],['Filière',25],['Niveau',20],['Domaine',10],['Ville',10]].map(([l,p])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:800,color:'var(--acid)',fontFamily:'var(--font-mono)',marginBottom:3}}>{p}%</div>
              <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{l}</div>
              <div style={{height:3,background:`linear-gradient(90deg,var(--acid) ${p}%,var(--bg-surface) 0%)`,borderRadius:99,marginTop:5}}/>
            </div>
          ))}
        </div>
        <Btn loading={searching} full icon={Search} onClick={search}>{searching?'Analyse en cours...':'Calculer la compatibilité avec les offres'}</Btn>
      </GlassCard>
      {done&&(
        <div className="sc-fade">
          <div style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)',marginBottom:13,textTransform:'uppercase',letterSpacing:'0.1em'}}>{offres.length} offres classées par score</div>
          <div style={{display:'grid',gap:11}}>
            {offres.map((o,i)=>{
              const d=postule.includes(o.id);
              return (
                <Card key={o.id} style={{padding:'14px 17px',borderColor:i===0?'var(--border-hi)':'var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:13}}>
                    <div style={{textAlign:'center',padding:'6px 11px',background:i===0?'var(--acid-dim)':'var(--bg-surface)',border:`1px solid ${i===0?'var(--border-hi)':'var(--border)'}`,borderRadius:9,minWidth:54}}>
                      <div style={{fontSize:19,fontWeight:800,color:i===0?'var(--acid)':'var(--text-secondary)',fontFamily:'var(--font-mono)'}}>{o.match}%</div>
                      <div style={{fontSize:7,color:'var(--text-muted)',textTransform:'uppercase'}}>Score</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                        <span style={{fontSize:14,fontWeight:700}}>{o.titre}</span>
                        {i===0&&<Tag label="MEILLEUR MATCH" color="acid"/>}
                        {d&&<Tag label="POSTULÉ ✓" color="sky"/>}
                      </div>
                      <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:2}}>{o.entreprise} · {o.ville} · {o.duree}</div>
                      <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{o.competences}</div>
                    </div>
                    <div style={{display:'flex',gap:7}}>
                      <Btn variant="ghost" small icon={Eye} onClick={()=>setDetailModal(o)}>Détails</Btn>
                      <Btn small icon={d?CheckCircle:Send} variant={d?'success':'primary'} onClick={()=>postuler(o)} disabled={d}>{d?'Postulé':'Postuler'}</Btn>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      <Modal open={!!detailModal} onClose={()=>setDetailModal(null)} title={detailModal?.titre}>
        {detailModal&&<><ML label="Entreprise" value={detailModal.entreprise}/><ML label="Ville" value={detailModal.ville}/><ML label="Durée" value={detailModal.duree}/><ML label="Compétences" value={detailModal.competences}/><ML label="Score matching" value={`${detailModal.match}%`} color="var(--acid)"/><div style={{marginTop:14,display:'flex',gap:9}}><Btn full icon={Send} onClick={()=>{postuler(detailModal);setDetailModal(null);}}>Postuler — SC3</Btn><Btn variant="ghost" onClick={()=>setDetailModal(null)}>Fermer</Btn></div></>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ÉTUDIANT — CANDIDATURES
// ══════════════════════════════════════════════════════════
const Candidature = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [candidats,setCandidats]=useState([
    {id:1,offre:'Développeur Blockchain Junior',entreprise:'TechCorp SA',date:'2025-11-10',status:'ACCEPTE',hash:fakeHash()},
    {id:2,offre:'CyberSécurité Analyste',entreprise:'DataLabs',date:'2025-11-08',status:'EN_ATTENTE',hash:fakeHash()},
    {id:3,offre:'Data Scientist Junior',entreprise:'AIGroup',date:'2025-11-06',status:'REFUSE',hash:fakeHash()},
  ]);
  const [detailModal,setDetailModal]=useState(null);
  const annuler=(id)=>sign('SC3.annulerCandidature()',()=>setCandidats(c=>c.filter(x=>x.id!==id)));
  const C={ACCEPTE:'acid',EN_ATTENTE:'amber',REFUSE:'crimson'};

  return (
    <div className="sc-fade">
      <PageHeader title="Mes Candidatures" subtitle="SC3 — CandidatureManager"/>
      <div style={{display:'grid',gap:11}}>
        {candidats.map(c=>(
          <GlassCard key={c.id}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:5}}>
                  <span style={{fontSize:15,fontWeight:700}}>{c.offre}</span>
                  <Tag label={c.status} color={C[c.status]}/>
                </div>
                <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:3}}>{c.entreprise} · {c.date}</div>
                <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>TX : {c.hash}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <Btn small variant="ghost" icon={Eye} onClick={()=>setDetailModal(c)}>Détails</Btn>
                {c.status==='ACCEPTE'&&<Btn small icon={ArrowRight} onClick={()=>toast('Convention SC4 disponible !','success')}>Convention SC4</Btn>}
                {c.status==='EN_ATTENTE'&&<Btn small variant="danger" icon={XCircle} onClick={()=>annuler(c.id)}>Annuler</Btn>}
              </div>
            </div>
          </GlassCard>
        ))}
        {candidats.length===0&&<div style={{textAlign:'center',padding:28,color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:12}}>Aucune candidature. Allez sur Matching !</div>}
      </div>
      <Modal open={!!detailModal} onClose={()=>setDetailModal(null)} title={detailModal?.offre}>
        {detailModal&&<><ML label="Entreprise" value={detailModal.entreprise}/><ML label="Date" value={detailModal.date}/><ML label="Statut" value={detailModal.status}/><ML label="TX Hash" value={detailModal.hash} color="var(--sky)"/><div style={{marginTop:14}}><Btn variant="ghost" full onClick={()=>setDetailModal(null)}>Fermer</Btn></div></>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ÉTUDIANT — CONVENTION SC4
// ══════════════════════════════════════════════════════════
const Convention = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [sigs,setSigs]=useState({etu:false,rh:true,admin:false});
  const all=sigs.etu&&sigs.rh&&sigs.admin;
  const handleSign=()=>sign('SC4.signerConvention()',()=>setSigs(s=>({...s,etu:true})));
  return (
    <div className="sc-fade">
      <PageHeader title="Ma Convention de Stage" subtitle="SC4 — ConventionManager">
        <Btn variant="secondary" small icon={Download} onClick={()=>toast('Téléchargement PDF...','info')}>Télécharger PDF</Btn>
      </PageHeader>
      {all&&<Alrt type="success" message="Convention officielle ACTIVÉE ! Les 3 signatures sont présentes. Le stage peut démarrer."/>}
      {!all&&<Alrt type="warning" message="En attente de toutes les signatures. Convention non active tant que les 3 parties n'ont pas signé."/>}
      <GlassCard glow={all}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
          <div style={{paddingRight:20,borderRight:'1px solid var(--border)'}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:13}}>Détails</div>
            <ML label="Numéro" value="#CONV-008" color="var(--acid)"/>
            <ML label="Étudiant" value="Amine Filali"/>
            <ML label="Entreprise" value="TechCorp SA"/>
            <ML label="Tuteur" value="Mr. Khalid Bensaid"/>
            <ML label="Encadrant" value="Dr. Hassan Moufid"/>
            <ML label="Durée" value="3 mois (Jan–Mar 2026)"/>
            <ML label="Hash IPFS" value={fakeCID()} color="var(--sky)"/>
          </div>
          <div style={{paddingLeft:20}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:13}}>État des signatures</div>
            {[{l:'Signature Étudiant',d:sigs.etu,w:'0xA3...9B'},{l:'Signature RH',d:sigs.rh,w:'0xC7...1A'},{l:'Signature Admin',d:sigs.admin,w:'0xE8...3D'}].map((s,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:11,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:s.d?'var(--acid-dim)':'var(--bg-surface)',border:`1px solid ${s.d?'var(--acid)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {s.d?<CheckCircle size={11} style={{color:'var(--acid)'}}/>:<Clock size={11} style={{color:'var(--text-muted)'}}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:s.d?'var(--acid)':'var(--text-secondary)'}}>{s.l}</div>
                  <div style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{s.w}</div>
                </div>
                {s.d&&<Tag label="SIGNÉ" color="acid"/>}
              </div>
            ))}
            {!sigs.etu&&<div style={{marginTop:14}}><Btn icon={Key} full onClick={handleSign}>Signer via MetaMask</Btn></div>}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ÉTUDIANT — SUIVI SC5
// ══════════════════════════════════════════════════════════
const Suivi = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [rapportText,setRapportText]=useState('');
  const [historique,setHistorique]=useState([
    {id:1,sem:'Semaine 1',hash:fakeHash(),validated:true, comment:'Bien démarré, continue ainsi.'},
    {id:2,sem:'Semaine 2',hash:fakeHash(),validated:true, comment:'Bonne progression.'},
    {id:3,sem:'Semaine 3',hash:fakeHash(),validated:false,comment:null},
  ]);
  const [detailModal,setDetailModal]=useState(null);
  const submit=()=>{
    if(!rapportText.trim()){toast('Rédigez votre rapport avant de soumettre !','error');return;}
    sign('SC5.soumettreRapport()',()=>{
      setHistorique(h=>[...h,{id:Date.now(),sem:`Semaine ${h.length+1}`,hash:fakeHash(),validated:false,comment:null}]);
      setRapportText('');
    });
  };
  return (
    <div className="sc-fade">
      <PageHeader title="Suivi de Stage" subtitle="SC5 — SuiviManager"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <GlassCard glow>
          <div style={{fontSize:12,fontWeight:700,color:'var(--acid)',marginBottom:14}}>SC5.soumettreRapport()</div>
          <Txta label="Rapport de la semaine" placeholder="Décrivez vos activités, blocages et avancées cette semaine..." rows={6} value={rapportText} onChange={e=>setRapportText(e.target.value)}/>
          <div style={{marginTop:13}}><Btn icon={Send} full onClick={submit}>Soumettre On-Chain via MetaMask</Btn></div>
        </GlassCard>
        <Card>
          <div style={{fontSize:12,fontWeight:700,marginBottom:13}}>Historique ({historique.length} rapports)</div>
          {historique.map(s=>(
            <div key={s.id} style={{display:'flex',alignItems:'center',gap:11,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:s.validated?'var(--acid)':'var(--amber)',flexShrink:0}}/>
              <div style={{flex:1}}>
                <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>{s.sem}</span>
                {s.comment&&<div style={{fontSize:9,color:'var(--text-muted)',marginTop:1,fontStyle:'italic'}}>"{s.comment}"</div>}
              </div>
              <Tag label={s.validated?'VALIDÉ':'EN ATTENTE'} color={s.validated?'acid':'amber'}/>
              <button onClick={()=>setDetailModal(s)} style={{color:'var(--text-muted)',padding:4,transition:'color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='var(--sky)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}><Eye size={13}/></button>
            </div>
          ))}
        </Card>
      </div>
      <Modal open={!!detailModal} onClose={()=>setDetailModal(null)} title={`Détails — ${detailModal?.sem}`}>
        {detailModal&&<><ML label="Semaine" value={detailModal.sem}/><ML label="TX Hash" value={detailModal.hash} color="var(--sky)"/><ML label="Statut" value={detailModal.validated?'VALIDÉ':'EN ATTENTE'} color={detailModal.validated?'var(--acid)':'var(--amber)'}/>{detailModal.comment&&<ML label="Commentaire encadrant" value={detailModal.comment}/>}<div style={{marginTop:14}}><Btn variant="ghost" full onClick={()=>setDetailModal(null)}>Fermer</Btn></div></>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ÉTUDIANT — RAPPORT SC6
// ══════════════════════════════════════════════════════════
const Rapport = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [versions,setVersions]=useState([
    {id:1,ver:'v1',cid:fakeCID(),date:'15 Nov',status:'REJETÉ',    remarque:'Introduction insuffisante.'},
    {id:2,ver:'v2',cid:fakeCID(),date:'18 Nov',status:'REJETÉ',    remarque:'Manque de détails techniques.'},
    {id:3,ver:'v3',cid:fakeCID(),date:'20 Nov',status:'EN ATTENTE',remarque:null},
  ]);
  const [fileName,setFileName]=useState(null);
  const [dragging,setDragging]=useState(false);
  const [detailModal,setDetailModal]=useState(null);
  const fileRef=useRef();

  const handleFile=(f)=>{
    if(!f)return;
    if(f.type!=='application/pdf'){toast('Format PDF uniquement !','error');return;}
    if(f.size>50*1024*1024){toast('Fichier trop volumineux (max 50MB) !','error');return;}
    setFileName(f.name); toast(`"${f.name}" prêt à l'upload`,'success');
  };
  const upload=()=>{
    if(!fileName){toast('Sélectionnez un fichier PDF !','error');return;}
    sign('SC6.deposerRapport() + IPFS.upload()',()=>{
      setVersions(v=>[...v,{id:Date.now(),ver:`v${v.length+1}`,cid:fakeCID(),date:todayStr(),status:'EN ATTENTE',remarque:null}]);
      setFileName(null);
    });
  };
  const noteTuteur=18; const noteEnc=16;
  const noteFinale=(noteTuteur*0.6+noteEnc*0.4).toFixed(1);
  return (
    <div className="sc-fade">
      <PageHeader title="Rapport Final de Stage" subtitle="SC6 — RapportManager"/>
      <Alrt type="info" message="PDF uploadé sur IPFS · CID ancré on-chain · Note finale = (Tuteur × 60%) + (Encadrant × 40%)"/>
      <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:18}}>
        <GlassCard glow>
          <div style={{fontSize:12,fontWeight:700,color:'var(--acid)',marginBottom:14}}>SC6.deposerRapport()</div>
          <div onClick={()=>fileRef.current.click()} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}}
            style={{border:`2px dashed ${dragging?'var(--acid)':'var(--border-md)'}`,borderRadius:'var(--r-md)',padding:26,textAlign:'center',cursor:'pointer',transition:'all 0.2s',background:dragging?'var(--acid-dim)':'var(--bg-surface)',marginBottom:14}}>
            <Upload size={24} style={{color:dragging?'var(--acid)':'var(--text-muted)',marginBottom:9}}/>
            <div style={{fontSize:13,fontWeight:600,color:fileName?'var(--acid)':'var(--text-secondary)',marginBottom:2}}>{fileName||'Glisser le PDF ici ou cliquer'}</div>
            <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>Max 50MB · PDF uniquement</div>
            <input ref={fileRef} type="file" accept=".pdf" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
          </div>
          {fileName&&<div style={{padding:'8px 12px',background:'var(--acid-dim)',border:'1px solid var(--border-hi)',borderRadius:'var(--r-md)',marginBottom:13,fontSize:11,color:'var(--acid)',fontFamily:'var(--font-mono)'}}>📄 {fileName}</div>}
          <Btn icon={Database} full onClick={upload}>Déposer sur IPFS + Ancrer CID On-Chain</Btn>
        </GlassCard>
        <div>
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:11}}>Versioning IPFS</div>
            {versions.map(v=>(
              <div key={v.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{flex:1}}>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--acid)',marginRight:7}}>{v.ver}</span>
                  <span style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{v.cid}</span>
                  {v.remarque&&<div style={{fontSize:9,color:'var(--crimson)',marginTop:1}}>⚠ {v.remarque}</div>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <Tag label={v.status} color={v.status==='EN ATTENTE'?'amber':v.status==='VALIDÉ'?'acid':'crimson'}/>
                  <button onClick={()=>setDetailModal(v)} style={{color:'var(--text-muted)',padding:3,transition:'color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='var(--sky)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}><Eye size={12}/></button>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{fontSize:12,fontWeight:700,marginBottom:11}}>Calcul automatique SC6</div>
            <ML label="Tuteur (60%)" value={`${noteTuteur}/20`} color="var(--amber)"/>
            <ML label="Encadrant (40%)" value={`${noteEnc}/20`} color="var(--sky)"/>
            <Divider label="Note finale"/>
            <div style={{textAlign:'center',padding:'8px 0'}}>
              <div style={{fontSize:38,fontWeight:900,color:'var(--acid)',fontFamily:'var(--font-mono)'}}>{noteFinale}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>/20</div>
            </div>
          </Card>
        </div>
      </div>
      <Modal open={!!detailModal} onClose={()=>setDetailModal(null)} title={`Version ${detailModal?.ver}`}>
        {detailModal&&<><ML label="CID IPFS" value={detailModal.cid} color="var(--sky)"/><ML label="Date" value={detailModal.date}/><ML label="Statut" value={detailModal.status}/>{detailModal.remarque&&<ML label="Remarque" value={detailModal.remarque} color="var(--crimson)"/>}<div style={{marginTop:14}}><Btn variant="ghost" full onClick={()=>setDetailModal(null)}>Fermer</Btn></div></>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ATTESTATION SC7 (Étudiant)
// ══════════════════════════════════════════════════════════
const Certif = ({ account }) => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [step,setStep]=useState(0);
  const generate=()=>sign('SC7.genererAttestation()',()=>setStep(1));
  return (
    <div className="sc-fade">
      <PageHeader title="Attestation Certifiée" subtitle="SC7 — CertifManager"/>
      {step===0?(
        <GlassCard style={{maxWidth:520}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:14}}>Prérequis SC7</div>
          {[{l:'Rapport validé SC6',ok:true},{l:'Signature Tuteur RH',ok:true},{l:'Signature Encadrant',ok:true},{l:'Signature Admin',ok:false}].map((r,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              {r.ok?<CheckCircle size={13} style={{color:'var(--acid)'}}/>:<Clock size={13} style={{color:'var(--amber)'}}/>}
              <span style={{fontSize:12,color:r.ok?'var(--acid)':'var(--text-secondary)',flex:1}}>{r.l}</span>
              {r.ok?<Tag label="OK" color="acid"/>:<Tag label="EN ATTENTE" color="amber"/>}
            </div>
          ))}
          <div style={{marginTop:14}}><Btn icon={Award} full onClick={generate}>SC7.genererAttestation()</Btn></div>
        </GlassCard>
      ):(
        <div className="sc-fade" style={{display:'flex',gap:22}}>
          <div style={{flex:'0 0 auto',background:'linear-gradient(135deg,#fff 0%,#f0f7f4 100%)',borderRadius:26,padding:34,textAlign:'center',width:310,boxShadow:'0 18px 56px rgba(0,0,0,0.3),0 0 0 1px rgba(0,240,160,0.3)'}}>
            <div style={{fontSize:9,letterSpacing:'0.3em',color:'#888',textTransform:'uppercase',marginBottom:7,fontFamily:'monospace'}}>EMSI Marrakech</div>
            <div style={{fontSize:24,fontWeight:900,color:'#030f06',letterSpacing:'-0.02em',marginBottom:4}}>Attestation</div>
            <div style={{fontSize:9,color:'#22c07a',fontFamily:'monospace',letterSpacing:'0.15em',marginBottom:22,textTransform:'uppercase'}}>✓ Certifiée par Blockchain</div>
            <div style={{background:'#fff',padding:14,borderRadius:13,marginBottom:16,display:'inline-block',border:'1px solid #e2e8f0'}}>
              <QRCodeSVG value={`EMSI-STAGECHAIN-${account}`} size={120} fgColor="#030f06"/>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:'#222',marginBottom:3}}>Amine Filali</div>
            <div style={{fontSize:11,color:'#666',marginBottom:8}}>Développeur Blockchain · TechCorp SA</div>
            <div style={{fontSize:11,color:'#22c07a',fontFamily:'monospace',marginBottom:6}}>Note : 17.2 / 20</div>
            <div style={{fontSize:8,color:'#aaa',fontFamily:'monospace',wordBreak:'break-all'}}>{shortWallet(account)}</div>
          </div>
          <div style={{flex:1}}>
            <Alrt type="success" message="Attestation générée ! QR Code disponible pour vérification publique."/>
            <GlassCard style={{marginBottom:13}}>
              <ML label="Hash IPFS CID" value={fakeCID()} color="var(--sky)"/>
              <ML label="Hash TX Ethereum" value={fakeHash()} color="var(--sky)"/>
              <ML label="Block ancré" value={fakeBlock()}/>
              <ML label="Note finale" value="17.2 / 20" color="var(--acid)"/>
              <ML label="Durée stage" value="3 mois (Jan–Mar 2026)"/>
              <ML label="Statut" value="CERTIFIÉ ✓" color="var(--acid)"/>
            </GlassCard>
            <div style={{display:'flex',gap:9}}>
              <Btn icon={Download} style={{flex:1,justifyContent:'center'}} onClick={()=>toast('Téléchargement PDF...','info')}>Télécharger PDF</Btn>
              <Btn variant="secondary" icon={ExternalLink} style={{flex:1,justifyContent:'center'}} onClick={()=>toast('Ouverture Etherscan Sepolia...','info')}>Etherscan</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ENCADRANT — SUIVI SC5
// ══════════════════════════════════════════════════════════
const EncSuivi = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [stagiaires,setStagiaires]=useState([
    {id:1,nom:'Amine Filali', sem:6,total:12,status:'ACTIF',      rapports:[{id:1,sem:'Semaine 6',hash:fakeHash(),text:'Développé le smart contract SC4.',comment:''}]},
    {id:2,nom:'Sara Karimi',  sem:8,total:12,status:'EN ATTENTE', rapports:[{id:1,sem:'Semaine 8',hash:fakeHash(),text:'Tests de pénétration sur le nœud.',comment:''}]},
    {id:3,nom:'Youssef A.',   sem:3,total:12,status:'ACTIF',      rapports:[{id:1,sem:'Semaine 3',hash:fakeHash(),text:'Mise en place de l\'environnement.',comment:''}]},
  ]);
  const [commentModal,setCommentModal]=useState(null);
  const [commentText,setCommentText]=useState('');
  const [rapportModal,setRapportModal]=useState(null);

  const valider=(id)=>sign('SC5.validerRapport()',()=>setStagiaires(s=>s.map(x=>x.id===id?{...x,status:'VALIDÉ'}:x)));
  const saveComment=(stagId,rapId)=>{
    if(!commentText.trim()){toast('Rédigez un commentaire !','error');return;}
    sign('SC5.ajouterCommentaire()',()=>{
      setStagiaires(s=>s.map(x=>x.id===stagId?{...x,rapports:x.rapports.map(r=>r.id===rapId?{...r,comment:commentText}:r)}:x));
      setCommentModal(null); setCommentText('');
    });
  };
  return (
    <div className="sc-fade">
      <PageHeader title="Suivi des Étudiants" subtitle="SC5 — SuiviManager"/>
      <div style={{display:'grid',gap:13}}>
        {stagiaires.map(s=>(
          <GlassCard key={s.id}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:13}}>
              <div style={{display:'flex',alignItems:'center',gap:11}}>
                <div style={{width:36,height:36,borderRadius:11,background:'var(--sky-dim)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'var(--sky)'}}>{s.nom[0]}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700}}>{s.nom}</div>
                  <div style={{fontSize:11,color:'var(--text-secondary)',marginTop:1}}>Semaine {s.sem} / {s.total}</div>
                </div>
              </div>
              <Tag label={s.status} color={s.status==='ACTIF'?'acid':s.status==='VALIDÉ'?'sky':'amber'}/>
            </div>
            <div style={{height:5,background:'var(--bg-surface)',borderRadius:99,marginBottom:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${(s.sem/s.total)*100}%`,background:'linear-gradient(90deg,var(--acid),var(--sky))',borderRadius:99,transition:'width 0.5s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:13}}>
              <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>Progression</span>
              <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--acid)'}}>{Math.round((s.sem/s.total)*100)}%</span>
            </div>
            {s.rapports.map(r=>(
              <div key={r.id} style={{padding:'9px 12px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',marginBottom:9}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:r.comment?4:0}}>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>{r.sem}</span>
                  <div style={{display:'flex',gap:7}}>
                    <Btn small variant="ghost" icon={Eye} onClick={()=>setRapportModal({stag:s,rap:r})}>Lire</Btn>
                    <Btn small variant="ghost" icon={MessageSquare} onClick={()=>{setCommentModal({stagId:s.id,rapId:r.id});setCommentText(r.comment||'');}}>Commenter</Btn>
                  </div>
                </div>
                {r.comment&&<div style={{fontSize:10,color:'var(--sky)',fontStyle:'italic',marginTop:4}}>💬 {r.comment}</div>}
              </div>
            ))}
            <div style={{display:'flex',gap:8}}>
              {s.status==='EN ATTENTE'&&<Btn small icon={CheckCircle} onClick={()=>valider(s.id)}>Valider SC5</Btn>}
              {s.status==='VALIDÉ'&&<Tag label="✓ Validé" color="sky"/>}
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={!!commentModal} onClose={()=>setCommentModal(null)} title="Ajouter un commentaire SC5">
        <Txta label="Commentaire pédagogique (archivé on-chain)" placeholder="Votre retour sur le rapport..." rows={4} value={commentText} onChange={e=>setCommentText(e.target.value)}/>
        <div style={{display:'flex',gap:9,marginTop:14}}><Btn icon={Send} full onClick={()=>saveComment(commentModal?.stagId,commentModal?.rapId)}>Enregistrer On-Chain</Btn><Btn variant="ghost" onClick={()=>setCommentModal(null)}>Annuler</Btn></div>
      </Modal>
      <Modal open={!!rapportModal} onClose={()=>setRapportModal(null)} title={`Rapport — ${rapportModal?.stag?.nom}`}>
        {rapportModal&&<><ML label="Semaine" value={rapportModal.rap.sem}/><ML label="TX Hash" value={rapportModal.rap.hash} color="var(--sky)"/><div style={{marginTop:13,padding:13,background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}}>{rapportModal.rap.text}</div>{rapportModal.rap.comment&&<div style={{marginTop:9,padding:'8px 11px',background:'var(--sky-dim)',borderRadius:'var(--r-sm)',fontSize:11,color:'var(--sky)'}}>💬 {rapportModal.rap.comment}</div>}<div style={{marginTop:14}}><Btn variant="ghost" full onClick={()=>setRapportModal(null)}>Fermer</Btn></div></>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ÉVALUATION SC6 (Encadrant + Tuteur)
// ══════════════════════════════════════════════════════════
const Evaluation = ({ role }) => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [note,setNote]=useState(15);
  const [remarques,setRemarques]=useState('');
  const [validated,setValidated]=useState(false);
  const [rapportModal,setRapportModal]=useState(false);
  const pct=role==='encadrant'?40:60;

  const valider=()=>{
    if(!remarques.trim()){toast('Ajoutez des remarques avant de valider !','error');return;}
    sign(`SC6.valider(note:${note}/20, role:${role})`,()=>setValidated(true));
  };
  const noteAutre=role==='encadrant'?18:16;
  const noteTuteur=role==='tuteur'?note:noteAutre;
  const noteEnc=role==='encadrant'?note:noteAutre;
  const noteFinale=(noteTuteur*0.6+noteEnc*0.4).toFixed(1);

  return (
    <div className="sc-fade">
      <PageHeader title="Évaluation du Rapport Final" subtitle="SC6 — RapportManager"/>
      {validated&&<Alrt type="success" message={`✓ Note ${note}/20 enregistrée on-chain. Note finale : ${noteFinale}/20`}/>}
      <Alrt type="info" message={`Votre note compte pour ${pct}% de la note finale. (Tuteur 60% + Encadrant 40%)`}/>
      <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:18}}>
        <GlassCard glow={!validated}>
          <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:16}}>
            <div style={{width:36,height:36,borderRadius:11,background:'var(--acid-dim)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'var(--acid)'}}>A</div>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>Amine Filali</div>
              <div style={{fontSize:11,color:'var(--text-secondary)'}}>Rapport v3 — Développeur Blockchain Junior</div>
            </div>
          </div>
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:58,fontWeight:900,color:note>=16?'var(--acid)':note>=10?'var(--amber)':'var(--crimson)',fontFamily:'var(--font-mono)',lineHeight:1,transition:'color 0.3s'}}>{note}</div>
            <div style={{fontSize:15,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>/20</div>
          </div>
          <input type="range" min={0} max={20} step={0.5} value={note} onChange={e=>setNote(parseFloat(e.target.value))} disabled={validated}
            style={{width:'100%',accentColor:'var(--acid)',cursor:validated?'not-allowed':'pointer',marginBottom:5}}/>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
            {[0,5,10,15,20].map(v=><span key={v} style={{fontSize:9,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{v}</span>)}
          </div>
          <Txta label="Remarques (archivées on-chain)" placeholder="Points forts, axes d'amélioration..." rows={4} value={remarques} onChange={e=>setRemarques(e.target.value)}/>
          <div style={{marginTop:13}}><Btn icon={validated?CheckCircle:Key} full onClick={valider} disabled={validated}>{validated?'✓ Évaluation soumise on-chain':'Valider & Signer via MetaMask — SC6.valider()'}</Btn></div>
        </GlassCard>
        <div>
          <Card style={{marginBottom:13}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:11}}>Rapport à évaluer</div>
            <ML label="CID IPFS" value={fakeCID()} color="var(--sky)"/>
            <ML label="Version" value="v3 — Finale"/>
            <ML label="Déposé le" value="20 Nov 2025"/>
            <ML label="Taille" value="4.2 MB PDF"/>
            <div style={{marginTop:11}}><Btn variant="secondary" icon={Eye} full onClick={()=>setRapportModal(true)}>Consulter le rapport PDF</Btn></div>
          </Card>
          <Card>
            <div style={{fontSize:12,fontWeight:700,marginBottom:11}}>Calcul SC6</div>
            <ML label="Tuteur (60%)" value={`${role==='tuteur'?note:noteAutre}/20`} color="var(--amber)"/>
            <ML label="Encadrant (40%)" value={`${role==='encadrant'?note:noteAutre}/20`} color="var(--sky)"/>
            <Divider label="Note finale"/>
            <div style={{textAlign:'center',padding:'8px 0'}}>
              <div style={{fontSize:36,fontWeight:900,color:'var(--acid)',fontFamily:'var(--font-mono)',transition:'all 0.3s'}}>{noteFinale}</div>
              <div style={{fontSize:10,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>/20 — Calculé par SC6</div>
            </div>
          </Card>
        </div>
      </div>
      <Modal open={rapportModal} onClose={()=>setRapportModal(false)} title="Rapport Final — Amine Filali" wide>
        <div style={{padding:16,background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',fontSize:13,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:14}}>
          <strong style={{color:'var(--text-primary)'}}>Rapport de stage — Développeur Blockchain Junior</strong><br/><br/>
          Durant ce stage de 3 mois chez TechCorp SA, j'ai travaillé sur le développement de smart contracts Solidity.
          J'ai implémenté les contrats SC1 à SC7, configuré un nœud Hardhat local, et intégré IPFS pour le stockage décentralisé.
          Principales réalisations : déploiement de 7 smart contracts, intégration MetaMask, interface React.js.
        </div>
        <div style={{display:'flex',gap:9}}><Btn variant="ghost" full onClick={()=>setRapportModal(false)}>Fermer</Btn></div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ENCADRANT — CONVENTIONS
// ══════════════════════════════════════════════════════════
const EncConvention = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [conventions,setConventions]=useState([
    {id:1,conv:'#CONV-008',etudiant:'Amine Filali', offre:'Dev Blockchain',  signed:false,cid:fakeCID()},
    {id:2,conv:'#CONV-009',etudiant:'Sara Karimi',  offre:'CyberSec Analyst',signed:false,cid:fakeCID()},
  ]);
  const sign2=(id)=>sign('SC4.signerConvention(role:encadrant)',()=>setConventions(c=>c.map(x=>x.id===id?{...x,signed:true}:x)));
  return (
    <div className="sc-fade">
      <PageHeader title="Conventions à Valider" subtitle="SC4 — ConventionManager"/>
      <Alrt type="info" message="Votre signature est requise pour activer les conventions de stage de vos étudiants."/>
      <div style={{display:'grid',gap:13}}>
        {conventions.map(c=>(
          <GlassCard key={c.id} glow={c.signed}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:5}}>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--acid)'}}>{c.conv}</span>
                  {c.signed?<Tag label="SIGNÉ ✓" color="acid"/>:<Tag label="EN ATTENTE" color="amber"/>}
                </div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{c.etudiant} — {c.offre}</div>
                <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{c.cid}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <Btn small variant="ghost" icon={Download} onClick={()=>toast(`PDF ${c.conv}...`,'info')}>PDF</Btn>
                {!c.signed&&<Btn icon={Key} small onClick={()=>sign2(c.id)}>Signer via MetaMask</Btn>}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// SIGNER ATTESTATION SC7
// ══════════════════════════════════════════════════════════
const EncCertif = ({ role }) => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [attestations,setAttestations]=useState([
    {id:1,etudiant:'Amine Filali', note:'17.2/20',cid:fakeCID(),signed:false},
    {id:2,etudiant:'Sara Karimi',  note:'16.8/20',cid:fakeCID(),signed:false},
  ]);
  const [detailModal,setDetailModal]=useState(null);
  const handleSign=(id)=>sign(`SC7.signer(role:${role}, id:${id})`,()=>setAttestations(a=>a.map(x=>x.id===id?{...x,signed:true}:x)));
  return (
    <div className="sc-fade">
      <PageHeader title="Signer les Attestations" subtitle="SC7 — CertifManager"/>
      <Alrt type="info" message="SC7 exige 3 signatures (Tuteur RH + Encadrant + Admin) avant génération du QR Code."/>
      <div style={{display:'grid',gap:13}}>
        {attestations.map(a=>(
          <GlassCard key={a.id} glow={a.signed}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:5}}>
                  <span style={{fontSize:14,fontWeight:700}}>{a.etudiant}</span>
                  {a.signed?<Tag label="SIGNÉ ✓" color="acid"/>:<Tag label="EN ATTENTE" color="amber"/>}
                </div>
                <div style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>Note : {a.note} · {a.cid}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <Btn small variant="ghost" icon={Eye} onClick={()=>setDetailModal(a)}>Détails</Btn>
                {!a.signed&&<Btn icon={Key} small onClick={()=>handleSign(a.id)}>Signer SC7</Btn>}
                {a.signed&&<div style={{display:'flex',alignItems:'center',gap:7,padding:'7px 12px',background:'var(--acid-dim)',border:'1px solid var(--border-hi)',borderRadius:'var(--r-md)'}}><CheckCircle size={13} style={{color:'var(--acid)'}}/><span style={{fontSize:12,color:'var(--acid)',fontFamily:'var(--font-mono)'}}>Signé on-chain</span></div>}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={!!detailModal} onClose={()=>setDetailModal(null)} title={`Attestation — ${detailModal?.etudiant}`}>
        {detailModal&&<><ML label="Note finale" value={detailModal.note} color="var(--acid)"/><ML label="CID IPFS" value={detailModal.cid} color="var(--sky)"/><ML label="Statut" value={detailModal.signed?'SIGNÉ ✓':'EN ATTENTE'} color={detailModal.signed?'var(--acid)':'var(--amber)'}/><div style={{marginTop:14}}><Btn variant="ghost" full onClick={()=>setDetailModal(null)}>Fermer</Btn></div></>}
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// TUTEUR — SUIVI HEBDO
// ══════════════════════════════════════════════════════════
const TutSuivi = () => {
  const {sign}=useMetaMask(); const toast=useToast();
  const [presences,setPresences]=useState([
    {id:1,etudiant:'Amine Filali', semaine:'Semaine 6',jours:[true,true,true,true,true], note:'',validé:false},
    {id:2,etudiant:'Sara Karimi',  semaine:'Semaine 8',jours:[true,true,false,true,true],note:'',validé:false},
  ]);
  const [noteModal,setNoteModal]=useState(null);
  const [noteText,setNoteText]=useState('');

  const toggleJour=(pid,ji)=>{
    setPresences(p=>p.map(x=>x.id===pid?{...x,jours:x.jours.map((j,i)=>i===ji?!j:j)}:x));
  };
  const valider=(id)=>sign('SC5.validerPresences()',()=>setPresences(p=>p.map(x=>x.id===id?{...x,validé:true}:x)));
  const saveNote=()=>{
    if(!noteText.trim()){toast('Écrivez une observation !','error');return;}
    setPresences(p=>p.map(x=>x.id===noteModal?{...x,note:noteText}:x));
    toast('Observation enregistrée','success'); setNoteModal(null); setNoteText('');
  };
  const jours=['Lun','Mar','Mer','Jeu','Ven'];

  return (
    <div className="sc-fade">
      <PageHeader title="Suivi Hebdomadaire" subtitle="SC5 — SuiviManager"/>
      <Alrt type="info" message="Enregistrez les présences et observations hebdomadaires de vos stagiaires on-chain."/>
      <div style={{display:'grid',gap:13}}>
        {presences.map(p=>(
          <GlassCard key={p.id}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:13}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{p.etudiant}</div>
                <div style={{fontSize:11,color:'var(--text-secondary)'}}>{p.semaine}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:p.jours.filter(Boolean).length>=4?'var(--acid)':'var(--amber)'}}>{p.jours.filter(Boolean).length}/5 jours</span>
                {p.validé?<Tag label="VALIDÉ ✓" color="acid"/>:<Tag label="EN ATTENTE" color="amber"/>}
              </div>
            </div>
            <div style={{display:'flex',gap:9,marginBottom:13}}>
              {jours.map((j,i)=>(
                <button key={i} onClick={()=>!p.validé&&toggleJour(p.id,i)} disabled={p.validé}
                  style={{flex:1,padding:'10px 0',borderRadius:'var(--r-md)',background:p.jours[i]?'var(--acid-dim)':'var(--bg-surface)',border:`1px solid ${p.jours[i]?'var(--border-hi)':'var(--border)'}`,color:p.jours[i]?'var(--acid)':'var(--text-muted)',fontSize:11,fontWeight:600,transition:'all 0.15s',cursor:p.validé?'default':'pointer',textAlign:'center'}}>
                  <div style={{marginBottom:3}}>{p.jours[i]?'✓':'—'}</div>
                  <div style={{fontSize:9,fontFamily:'var(--font-mono)'}}>{j}</div>
                </button>
              ))}
            </div>
            {p.note&&<div style={{padding:'8px 11px',background:'var(--sky-dim)',border:'1px solid var(--sky-dim)',borderRadius:'var(--r-sm)',fontSize:11,color:'var(--sky)',marginBottom:11}}>💬 {p.note}</div>}
            <div style={{display:'flex',gap:8}}>
              {!p.validé&&<Btn small icon={CheckCircle} onClick={()=>valider(p.id)}>Valider présences SC5</Btn>}
              <Btn small variant="ghost" icon={MessageSquare} onClick={()=>{setNoteModal(p.id);setNoteText(p.note||'');}}>Observation</Btn>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={!!noteModal} onClose={()=>setNoteModal(null)} title="Ajouter une observation">
        <Txta label="Observation hebdomadaire (archivée on-chain)" placeholder="Comportement, compétences, difficultés..." rows={4} value={noteText} onChange={e=>setNoteText(e.target.value)}/>
        <div style={{display:'flex',gap:9,marginTop:14}}><Btn icon={Save} full onClick={saveNote}>Enregistrer</Btn><Btn variant="ghost" onClick={()=>setNoteModal(null)}>Annuler</Btn></div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════
function AppInner() {
  const [authStep, setAuthStep] = useState('select'); // 'select' | 'metamask' | 'app'
  const [pendingRole, setPendingRole] = useState(null);
  const [role, setRole] = useState(null);
  const [view, setView] = useState('dashboard');
  const [account, setAccount] = useState('');

  const handleRoleSelect = (r) => {
    setPendingRole(r);
    setAuthStep('metamask');
  };

  const handleMetaMaskConfirm = () => {
    const cfg = ROLE_CONFIG[pendingRole];
    setAccount(cfg.wallet);
    setRole(pendingRole);
    setView('dashboard');
    setAuthStep('app');
  };

  const handleMetaMaskReject = () => {
    setPendingRole(null);
    setAuthStep('select');
  };

  const logout = () => {
    setRole(null);
    setPendingRole(null);
    setView('dashboard');
    setAccount('');
    setAuthStep('select');
  };

  const renderView = () => {
    const V = {
      dashboard:       <Dashboard role={role} account={account}/>,
      admin_users:     <AdminUsers/>,
      reseau:          <Reseau/>,
      admin_stats:     <AdminStats/>,
      admin_litiges:   <AdminLitiges/>,
      rh_offres:       <RhOffres/>,
      rh_candidats:    <RhCandidats/>,
      rh_convention:   <RhConvention/>,
      rh_verif:        <RhVerif/>,
      enc_certif:      <EncCertif role={role}/>,
      matching:        <Matching/>,
      candidature:     <Candidature/>,
      convention:      <Convention/>,
      suivi:           <Suivi/>,
      rapport:         <Rapport/>,
      certif:          <Certif account={account}/>,
      enc_suivi:       <EncSuivi/>,
      evaluation:      <Evaluation role={role}/>,
      enc_convention:  <EncConvention/>,
      tut_suivi:       <TutSuivi/>,
    };
    return V[view] || <Dashboard role={role} account={account}/>;
  };

  return (
    <>
      <GlobalStyles/>

      {authStep === 'select' && <RoleSelector onSelect={handleRoleSelect}/>}

      {authStep === 'metamask' && (
        <>
          <RoleSelector onSelect={handleRoleSelect}/>
          <MetaMaskPopup role={pendingRole} onConfirm={handleMetaMaskConfirm} onReject={handleMetaMaskReject}/>
        </>
      )}

      {authStep === 'app' && (
        <div className="hex-bg" style={{display:'flex',minHeight:'100vh'}}>
          <Sidebar role={role} view={view} setView={setView} account={account} onLogout={logout}/>
          <main style={{flex:1,padding:'34px 42px',overflowY:'auto',minWidth:0}}>
            {renderView()}
          </main>
        </div>
      )}
    </>
  );
}

export default function StageChain() {
  return <ToastProvider><AppInner/></ToastProvider>;
}