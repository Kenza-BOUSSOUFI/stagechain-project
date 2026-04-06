// src/styles/GlobalStyles.js
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg: #03060f;
      --bg2: #060d1a;
      --bg3: #0a1628;
      --bg4: #0d1f3c;
      --bgh: #102340;
      --br: rgba(0,240,160,0.08);
      --brm: rgba(0,240,160,0.18);
      --brh: rgba(0,240,160,0.35);
      --ac: #00f0a0;
      --acd: rgba(0,240,160,0.12);
      --acg: rgba(0,240,160,0.25);
      --am: #f5a623;
      --amd: rgba(245,166,35,0.12);
      --cr: #f5384b;
      --crd: rgba(245,56,75,0.12);
      --sk: #38b2f5;
      --skd: rgba(56,178,245,0.12);
      --vi: #a78bfa;
      --vid: rgba(167,139,250,0.12);
      --t1: #e2f0ff;
      --t2: #7a9cc0;
      --t3: #3d5a7a;
      --fm: 'Share Tech Mono', monospace;
      --fu: 'Outfit', sans-serif;
      --r1: 6px;
      --r2: 12px;
      --r3: 20px;
    }

    html, body, #root {
      height: 100%;
      background: var(--bg);
      color: var(--t1);
      font-family: var(--fu);
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar {
      width: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--brm);
      border-radius: 99px;
    }

    button {
      cursor: pointer;
      border: none;
      background: none;
      font-family: var(--fu);
    }

    input, textarea, select {
      font-family: var(--fu);
      outline: none;
      color: var(--t1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-14px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse2 {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }

    @keyframes blink {
      50% { opacity: 0; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px var(--acg); }
      50% { box-shadow: 0 0 50px var(--acg), 0 0 100px var(--acg); }
    }

    @keyframes mmIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes particle {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 0.8; }
      100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
    }

    .fi { animation: fadeIn 0.3s ease forwards; }
    .fu { animation: fadeUp 0.5s ease forwards; }
    .spin { animation: spin 1s linear infinite; }
    .pulse { animation: pulse2 2s ease-in-out infinite; }
    .blink { animation: blink 1.2s step-start infinite; }
    .float { animation: float 3s ease-in-out infinite; }
    .glow { animation: glow 2s ease-in-out infinite; }

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--ac);
      opacity: 0;
      animation: particle linear infinite;
    }
  `}</style>
);

export default GS;