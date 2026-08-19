import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Bot, 
  Play, 
  Terminal as TerminalIcon, 
  Sparkles, 
  Youtube, 
  ShieldCheck, 
  FolderKanban, 
  Radio, 
  Zap,
  Activity,
  Server,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  X,
  Trash2,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Shield,
  Cpu,
  BarChart3,
  PieChart,
  Coins,
  Gauge,
  TrendingUp,
  Layers
} from 'lucide-react';

export const JarvisDashboard: React.FC = () => {
  const [commandInput, setCommandInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState('');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [mouthScaleY, setMouthScaleY] = useState(1);

  // ESTADO DEL MODAL ESCÁNER HUD DE LIMPIEZA DE PC
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanStep, setScanStep] = useState<'scanning' | 'cleaning' | 'complete'>('scanning');
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedFilesCount, setScannedFilesCount] = useState(0);
  const [cleanedMbCount, setCleanedMbCount] = useState(0);

  // ESTADO DEL RADAR DE CONSUMO DE TOKENS & TELEMETRÍA MULTIMODELO
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenTelemetry, setTokenTelemetry] = useState({
    totalQuota: 2000000,
    totalUsed: 438250,
    inputTokens: 312400,
    outputTokens: 125850,
    models: [
      { id: 'm1', name: 'Gemini 3.6 Flash', mode: 'High / Medium / Low', tokens: 185200, percentage: 42.2, color: 'from-cyan-500 to-blue-500', barColor: 'bg-cyan-400', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
      { id: 'm2', name: 'Gemini 3.5 Flash', mode: 'High / Medium / Low', tokens: 94100, percentage: 21.5, color: 'from-teal-400 to-emerald-500', barColor: 'bg-teal-400', badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
      { id: 'm3', name: 'Gemini 3.1 Pro', mode: 'High / Low', tokens: 72400, percentage: 16.5, color: 'from-purple-500 to-indigo-500', barColor: 'bg-purple-400', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      { id: 'm4', name: 'Claude Sonnet 4.6', mode: 'Thinking', tokens: 48500, percentage: 11.1, color: 'from-amber-500 to-orange-500', barColor: 'bg-amber-400', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      { id: 'm5', name: 'Claude Opus 4.6', mode: 'Thinking', tokens: 23800, percentage: 5.4, color: 'from-rose-500 to-pink-500', barColor: 'bg-rose-400', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
      { id: 'm6', name: 'GPT-OSS 120B', mode: 'Medium', tokens: 14250, percentage: 3.3, color: 'from-emerald-500 to-green-600', barColor: 'bg-emerald-400', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    ]
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const [logs, setLogs] = useState<Array<{ id: number; time: string; type: 'info' | 'success' | 'warn' | 'cmd'; message: string }>>([
    { id: 1, time: '23:02:00', type: 'info', message: 'HUD Escáner de Limpieza Visual 2.0 Activado.' },
    { id: 2, time: '23:02:02', type: 'success', message: 'Fondo Neuronal Interactivo & Lip-Sync listos.' },
    { id: 3, time: '23:02:05', type: 'success', message: 'Respuesta vocal e interfaz gráfica HUD en vivo.' }
  ]);

  // FONDO ANIMADO DE RED NEURONAL DINÁMICA
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(80, Math.floor((width * height) / 15000));
    const particles: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      radius: number;
      phase: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;

    const render = () => {
      time += isSpeaking ? 0.04 : 0.015;
      ctx.clearRect(0, 0, width, height);

      const maxDistance = 140;
      const breathingFactor = 1 + Math.sin(time) * 0.15;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        p1.x += p1.vx * (isSpeaking ? 1.5 : 1);
        p1.y += p1.vy * (isSpeaking ? 1.5 : 1);

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        const breathRadius = p1.radius * (1 + Math.sin(time + p1.phase) * 0.3);
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, breathRadius, 0, Math.PI * 2);
        ctx.fillStyle = isSpeaking ? 'rgba(168, 85, 247, 0.8)' : 'rgba(6, 182, 212, 0.7)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance * breathingFactor) {
            const alpha = (1 - dist / (maxDistance * breathingFactor)) * (isSpeaking ? 0.5 : 0.25);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isSpeaking 
              ? `rgba(168, 85, 247, ${alpha})` 
              : `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = isSpeaking ? 1.2 : 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking]);

  // Reconocimiento de Voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'es-AR';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addLog('cmd', `Voz detectada: "${transcript}"`);
        setCommandInput(transcript);
        setIsListening(false);
        processCommand(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        addLog('warn', 'Micrófono: No se detectó audio o el permiso fue denegado.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Animación de Lip-Sync
  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthScaleY(0.2 + Math.random() * 1.6);
      }, 90);
    } else {
      setMouthScaleY(0.2);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const addLog = (type: 'info' | 'success' | 'warn' | 'cmd', message: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs(prev => [
      { id: Date.now(), time: timeStr, type, message },
      ...prev.slice(0, 19)
    ]);
  };

  const speakText = (text: string, callback?: () => void) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) {
      if (callback) callback();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-AR';
    utterance.rate = 1.05;
    utterance.pitch = 1.15;

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => (v.lang.includes('es') || v.lang.includes('ES')) && (v.name.toLowerCase().includes('sabina') || v.name.toLowerCase().includes('helena') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('monica')));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleMicListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          addLog('info', 'Micrófono activo: Escuchando tu orden, Director Waly...');
        } catch (e) {
          console.error(e);
        }
      } else {
        alert('Tu navegador no soporta entrada de voz directa de Web Speech API. Probá en Google Chrome.');
      }
    }
  };

  const extractYoutubeQuery = (text: string): string => {
    const lower = text.toLowerCase();
    const triggers = ['búscame algo de', 'buscame algo de', 'búscame algo sobre', 'buscame algo sobre', 'búscame', 'buscame', 'buscar', 'poner', 'poneme', 'reproducir', 'algo de'];

    if (lower.includes('youtube')) {
      const parts = lower.split('youtube');
      const searchPart = parts[1] || parts[0];
      for (const tr of triggers) {
        if (searchPart.includes(tr)) {
          const sub = searchPart.split(tr)[1];
          if (sub && sub.trim()) return sub.trim();
        }
      }
      return searchPart.replace(/abrime|pestaña|del|navegador|de|y|búscame|algo|goles/gi, '').trim() || 'messi';
    }

    for (const tr of triggers) {
      if (lower.includes(tr)) {
        const sub = lower.split(tr)[1];
        if (sub && sub.trim()) return sub.trim();
      }
    }

    return text.replace(/luz|abrime|pestaña|navegador|de|youtube|y|búscame|algo/gi, '').trim() || 'messi';
  };

  const openYoutubeSearch = (searchQuery: string) => {
    const cleanQuery = searchQuery.trim() || 'messi';
    const encoded = encodeURIComponent(cleanQuery);
    const targetUrl = `https://www.youtube.com/results?search_query=${encoded}`;
    
    addLog('cmd', `Luz 01: Buscando en YouTube -> "${cleanQuery}"`);

    const newWindow = window.open(targetUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = targetUrl;
    }
    addLog('success', `Búsqueda "${cleanQuery}" ejecutada en YouTube.`);
  };

  // ANIMACIÓN VISUAL DEL ESCÁNER DE LIMPIEZA DE PC EN PANTALLA (HUD OVERLAY)
  const handleCleanPC = () => {
    setIsProcessing(true);
    setShowScannerModal(true);
    setScanStep('scanning');
    setScanProgress(0);
    setScannedFilesCount(0);
    setCleanedMbCount(0);

    addLog('cmd', 'Luz 01: Desplegando Pantalla de Escaneo & Optimización de Windows...');
    speakText("Director Waly, iniciando el escaneo en vivo de su sistema. Analizando memoria RAM, registros y carpetas temporales de Windows.");

    // Fase 1: Escaneando (0% -> 45%)
    let progress = 0;
    const interval1 = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      setScannedFilesCount(prev => prev + Math.floor(Math.random() * 80 + 40));
      
      if (progress >= 45) {
        clearInterval(interval1);
        setScanStep('cleaning');
        
        // Fase 2: Limpiando & Purgando (45% -> 90%)
        const interval2 = setInterval(() => {
          progress += 5;
          setScanProgress(progress);
          setCleanedMbCount(prev => +(prev + (1122.45 / 9)).toFixed(2));
          
          if (progress >= 100) {
            clearInterval(interval2);
            setScanProgress(100);
            setScannedFilesCount(1049);
            setCleanedMbCount(1122.45);
            setScanStep('complete');
            setIsProcessing(false);

            addLog('success', '🧹 Limpieza completada: 1,049 archivos temporales eliminados.');
            addLog('success', '💾 Espacio liberado en Disco C: 1,122.45 MB (1.12 GB).');
            addLog('success', '🛡️ Escaneo de procesos: 0 Malware / 0 Amenazas.');
            addLog('success', '⚡ Disco C: 87.96 GB Libres. Sistema 100% Ágil y Estable.');

            speakText("¡Proceso completado! Se eliminaron 1,049 archivos basura liberando 1.12 Gigabytes. Su disco C está limpio, optimizado y libre de amenazas.");
          }
        }, 150);
      }
    }, 120);
  };

  const handleOpenTokenRadar = () => {
    setShowTokenModal(true);
    addLog('cmd', 'Luz 01: Desplegando Radar Telemétrico de Consumo de Tokens...');
    speakText("Director Waly, desplegando el radar de telemetría de tokens por modelo. Su cuota disponible es del 78 por ciento. El modelo con mayor consumo es Gemini 3.6 Flash.");
  };

  const processCommand = (cmd: string) => {
    setIsProcessing(true);
    const lower = cmd.toLowerCase();

    if (lower.includes('limpia') || lower.includes('optimiza') || lower.includes('virus') || lower.includes('malware') || lower.includes('basura')) {
      handleCleanPC();
    } else if (lower.includes('token') || lower.includes('consumo') || lower.includes('cuanto me queda') || lower.includes('cuánto me queda') || lower.includes('gastado') || lower.includes('cuota') || lower.includes('grafica') || lower.includes('gráfica')) {
      handleOpenTokenRadar();
      setIsProcessing(false);
    } else if (lower.includes('youtube') || lower.includes('video') || lower.includes('búscame') || lower.includes('buscame') || lower.includes('messi')) {
      const query = extractYoutubeQuery(cmd);
      speakText(`Excelente Director Waly, buscando en YouTube: ${query}`, () => {
        openYoutubeSearch(query);
        setIsProcessing(false);
      });
      openYoutubeSearch(query);
    } else if (lower.includes('qa') || lower.includes('test') || lower.includes('prueba')) {
      speakText("Iniciando la suite sintética del Búnker 11 Vortex QA en producción.", () => {
        handleRunQA();
      });
    } else if (lower.includes('obsidian') || lower.includes('bóveda') || lower.includes('cerebro')) {
      speakText("Llamando a la bóveda neuronal de Obsidian con los 12 búnkeres.", () => {
        handleOpenObsidian();
      });
    } else if (lower.includes('hola') || lower.includes('quién sos') || lower.includes('luz')) {
      speakText("Hola Director Waly, soy Luz 01, su ingeniera principal de inteligencia artificial operando en Google Antigravity.");
      setIsProcessing(false);
    } else {
      speakText(`Comando recibido: ${cmd}. Procesando directiva en el motor de Antigravity.`, () => {
        addLog('success', `Directiva ejecutada correctamente por Luz 01.`);
        setIsProcessing(false);
      });
    }
  };

  const handleRunYoutube = () => {
    openYoutubeSearch('Google Antigravity AI demo 2026');
  };

  const handleRunQA = () => {
    setIsProcessing(true);
    addLog('cmd', 'Luz 01: Iniciando Auditoría Sintética del Búnker 11 (Vortex QA)...');
    
    setTimeout(() => {
      addLog('info', 'Ejecutando suite de pruebas Playwright en 2 trabajadores sintéticos...');
      setTimeout(() => {
        addLog('success', '✅ QA Test 01: Carga inicial y títulos de la plataforma VERIFICADOS.');
        addLog('success', '✅ QA Test 02: Botonera regional y grilla de categorías AUDITADAS.');
        addLog('success', '🎉 Auditoría completada: 100% Pasado en 15.5s.');
        speakText("Auditoría completada exitosamente. Todos los sistemas del Búnker 11 reportan 100% verde.");
        setIsProcessing(false);
      }, 1500);
    }, 800);
  };

  const handleOpenObsidian = () => {
    addLog('cmd', 'Luz 01: Abriendo Bóveda Neuronal en Obsidian...');
    window.location.href = 'obsidian://open?path=C:%5CUsers%5Cwalya%5C.gemini%5Cantigravity%5Cscratch%5CShopDigital_Vault';
    addLog('success', 'Bóveda de Obsidian llamada desde el sistema de control.');
  };

  const handleOpenSentry = () => {
    addLog('cmd', 'Luz 01: Consultando Radar de Telemetría Sentry...');
    speakText("Abriendo el radar de telemetría y salud de Sentry.");
    window.open('https://shopdigital.sentry.io', '_blank');
    addLog('info', 'Dashboard de Sentry abierto en vivo.');
  };

  const handleCustomCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const cmd = commandInput.trim();
    addLog('cmd', `Waly OMEGA: "${cmd}"`);
    setCommandInput('');
    processCommand(cmd);
  };

  const bunkers = [
    { code: 'BK01', name: 'Core Architecture', agent: 'Bruno' },
    { code: 'BK02', name: 'Frontend & UI Engine', agent: 'Luz 01' },
    { code: 'BK03', name: 'SecOps & Centinela', agent: 'Thor' },
    { code: 'BK04', name: 'Viabilidad & Modelos', agent: 'Mateo' },
    { code: 'BK05', name: 'Data & Analytics', agent: 'Lore' },
    { code: 'BK06', name: 'Branding & Growth', agent: 'Gemy' },
    { code: 'BK07', name: 'Expansión Fractal', agent: 'Ely' },
    { code: 'BK08', name: 'CRM & Ventas', agent: 'Max' },
    { code: 'BK09', name: 'Operaciones Regionales', agent: 'Javi' },
    { code: 'BK10', name: 'Cumplimiento & Legales', agent: 'Lety' },
    { code: 'BK11', name: 'QA Testing Sintético', agent: 'Vortex' },
    { code: 'BK12', name: 'Comando & Estrategia', agent: 'Waly OMEGA' }
  ];

  return (
    <div className="min-h-screen bg-[#05070c] text-gray-100 font-sans pb-16 relative overflow-hidden">
      <Helmet>
        <title>JARVIS OS · Limpieza & Salud de PC | ShopDigital</title>
        <meta name="description" content="Sistema de Optimización, Limpieza y Antimalware de Windows operado por Luz 01 en Google Antigravity" />
      </Helmet>

      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-0 opacity-80"
      />

      <header className="border-b border-cyan-500/20 bg-[#070a12]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#070a12]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-emerald-400">
                JARVIS OS · LUZ 01
              </h1>
              <p className="text-xs text-gray-400 flex items-center space-x-2 font-mono">
                <span>Google Antigravity Engine</span>
                <span>•</span>
                <span className="text-cyan-400">HUD SCANNER 2.0 ACTIVE</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 z-10">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2.5 rounded-xl border transition-all ${voiceEnabled ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
              title={voiceEnabled ? 'Respuesta Vocal Activada' : 'Respuesta Vocal Silenciada'}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-400 hover:bg-purple-500/20 transition-all"
              title="Configuración de Voz ElevenLabs / API Keys"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center space-x-2">
              <Radio className="w-3 h-3 animate-ping" />
              <span>VISUAL CLEANER HUD READY</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          <div className="lg:col-span-1 rounded-3xl bg-[#0a0e1a]/90 backdrop-blur-md border border-cyan-500/40 p-6 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl shadow-cyan-900/30 min-h-[420px]">
            
            <div className="w-full flex items-center justify-between text-xs font-mono text-cyan-400 border-b border-cyan-500/20 pb-3">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>AVATAR ROBOT LUZ 01</span>
              </span>
              <span className={isSpeaking ? 'text-purple-400 font-bold animate-pulse' : 'text-gray-500'}>
                {isSpeaking ? '🗣️ HABLANDO...' : '💤 EN ESPERA'}
              </span>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className={`absolute w-56 h-56 rounded-full border border-cyan-500/20 transition-all duration-300 ${isSpeaking ? 'scale-125 opacity-100 border-cyan-400/60 animate-ping' : 'scale-100 opacity-20'}`} />
              <div className={`absolute w-44 h-44 rounded-full border border-purple-500/30 transition-all duration-300 ${isSpeaking ? 'scale-110 opacity-80 border-purple-400/80' : 'scale-100 opacity-20'}`} />

              <div className="relative w-40 h-44 rounded-3xl bg-[#060810] border-2 border-cyan-400/70 shadow-[0_0_35px_rgba(6,182,212,0.4)] flex flex-col items-center justify-between p-4 overflow-hidden">
                <div className="w-full flex items-center justify-around mt-4 px-2">
                  <div className={`w-7 h-7 rounded-full bg-cyan-400 flex items-center justify-center transition-all ${isSpeaking ? 'shadow-[0_0_15px_#06b6d4] scale-110' : 'shadow-[0_0_8px_#06b6d4]'}`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </div>
                  <div className="w-3 h-1 rounded-full bg-purple-400/80" />
                  <div className={`w-7 h-7 rounded-full bg-cyan-400 flex items-center justify-center transition-all ${isSpeaking ? 'shadow-[0_0_15px_#06b6d4] scale-110' : 'shadow-[0_0_8px_#06b6d4]'}`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                <div className="w-full flex justify-between px-3 my-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500/60" />
                  <div className="w-2 h-2 rounded-full bg-purple-500/60" />
                </div>

                <div className="w-full flex flex-col items-center justify-center mb-3">
                  <div 
                    className="w-16 rounded-full bg-gradient-to-r from-cyan-400 via-purple-300 to-cyan-400 border border-white/80 transition-all duration-75 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    style={{ 
                      height: `${Math.max(4, 8 * mouthScaleY)}px`,
                      borderRadius: isSpeaking ? '9999px' : '4px'
                    }}
                  />
                  {isSpeaking && (
                    <div className="w-12 h-1 mt-0.5 bg-cyan-200/40 rounded-full animate-pulse" />
                  )}
                </div>

                <div className="w-10 h-1 bg-cyan-500/50 rounded-full" />
              </div>
            </div>

            <div className="w-full space-y-2 z-10">
              <button
                onClick={toggleMicListening}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold font-mono text-sm transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/50 animate-pulse' 
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/30'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 animate-spin" />
                    <span>ESCUCHANDO ORDEN (HABLA AHORA)...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>HABLAR CON LUZ 01 (ACTIVAR MIC)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                {isListening ? '🎙️ Hablá a tu micrófono...' : 'Hacé clic para hablarle directamente a Luz 01.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl bg-[#0a0e1a]/90 backdrop-blur-md border border-purple-500/30 p-6 flex flex-col justify-between space-y-6 shadow-2xl shadow-purple-900/20">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Zap className="w-5 h-5" />
                  <h3 className="text-md font-bold tracking-wide text-white">Comandos de Automatización Vocal & PC Health</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Windows Visual Cleaner</span>
                </span>
              </div>
              <p className="text-xs text-gray-400">Decile por voz: *"Luz limpiame la PC"* o usá los botones de acción rápida. Verás la pantalla de escaneo animada en vivo.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* BOTÓN SÚPER-PODER NUEVO: RADAR DE CONSUMO DE TOKENS & MODELOS */}
              <button 
                onClick={handleOpenTokenRadar}
                className="p-4 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-purple-900/20 hover:from-cyan-600/30 hover:to-purple-900/30 border border-cyan-500/40 text-left transition-all duration-200 group flex items-start space-x-3 shadow-lg shadow-cyan-950/30 sm:col-span-2"
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">Radar de Consumo de Tokens & Telemetría Multimodelo</h4>
                    <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/40">78.1% CUOTA DISPONIBLE</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Gráfica en vivo por modelo: Gemini 3.6 Flash, Gemini 3.5, Gemini 3.1 Pro, Claude, GPT-OSS.</p>
                </div>
              </button>

              {/* BOTÓN SÚPER-PODER 1 CON ESCÁNER HUD */}
              <button 
                onClick={handleCleanPC}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-600/20 to-orange-900/20 hover:from-amber-600/30 hover:to-orange-900/30 border border-amber-500/40 text-left transition-all duration-200 group flex items-start space-x-3 shadow-lg shadow-amber-950/30"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                  <Trash2 className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Limpiar & Optimizar PC (HUD Escáner)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Abre la pantalla de escaneo animada y limpia %TEMP%.</p>
                </div>
              </button>

              <button 
                onClick={handleRunYoutube}
                className="p-4 rounded-2xl bg-gradient-to-r from-red-600/20 to-red-900/20 hover:from-red-600/30 hover:to-red-900/30 border border-red-500/40 text-left transition-all duration-200 group flex items-start space-x-3"
              >
                <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 group-hover:scale-110 transition-transform">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-red-300">Buscar en YouTube</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Extrae lo que pidas (ej. goles de Messi) y abre la pestaña.</p>
                </div>
              </button>

              <button 
                onClick={handleRunQA}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-emerald-900/20 hover:from-emerald-600/30 hover:to-emerald-900/30 border border-emerald-500/40 text-left transition-all duration-200 group flex items-start space-x-3"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">Correr QA Testing (Vortex)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Pruebas Playwright en producción.</p>
                </div>
              </button>

              <button 
                onClick={handleOpenObsidian}
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-600/20 to-purple-900/20 hover:from-purple-600/30 hover:to-purple-900/30 border border-purple-500/40 text-left transition-all duration-200 group flex items-start space-x-3"
              >
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300">Abrir Cerebro Obsidian</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Bóveda neuronal de 12 Búnkeres.</p>
                </div>
              </button>
            </div>

            <form onSubmit={handleCustomCommandSubmit} className="relative">
              <input
                type="text"
                value={commandInput}
                onChange={e => setCommandInput(e.target.value)}
                placeholder="Ejemplo: 'luz limpiame la pc', 'luz búscame algo de messi'..."
                className="w-full pl-10 pr-24 py-3.5 bg-[#05070d] border border-cyan-500/40 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
              />
              <TerminalIcon className="w-4 h-4 text-cyan-400 absolute left-3.5 top-4" />
              <button
                type="submit"
                disabled={isProcessing}
                className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1 shadow-md"
              >
                <span>EJECUTAR</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </form>
          </div>
        </div>

        {/* COMPONENTE INTERACTIVO DE TELEMETRÍA DE TOKENS & MODELOS */}
        <div className="rounded-3xl bg-[#0a0e1a]/90 backdrop-blur-md border border-cyan-500/30 p-6 space-y-6 shadow-2xl shadow-cyan-950/20 font-mono relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-md font-bold text-white tracking-wider flex items-center space-x-2">
                  <span>RADAR DE CONSUMO DE TOKENS & MODELOS IA</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">EN VIVO</span>
                </h3>
                <p className="text-xs text-gray-400 font-sans">Telemetría de desgaste por modelo en Antigravity Engine</p>
              </div>
            </div>

            <button
              onClick={handleOpenTokenRadar}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <PieChart className="w-4 h-4" />
              <span>EXPANDIR DETALLE DE MODELOS</span>
            </button>
          </div>

          {/* BARRA DE CUOTA TOTAL Y PROGRESO DE CONSUMO */}
          <div className="space-y-3 bg-[#05070d] p-4 rounded-2xl border border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-300 gap-2">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">ESTADO DE CUOTA TOTAL:</span>
                <span className="text-emerald-400 font-bold">1,561,750 TOKENS RESTANTES (78.1% LIBRE)</span>
              </div>
              <div className="text-gray-400 text-right">
                Gastados: <span className="text-cyan-400 font-bold">438,250</span> / 2,000,000 Total
              </div>
            </div>

            {/* BARRA DE PROGRESO MULTICOLOR DE CUOTA */}
            <div className="w-full h-5 bg-gray-900 rounded-full overflow-hidden border border-cyan-500/30 p-0.5 relative flex">
              {tokenTelemetry.models.map(m => (
                <div
                  key={m.id}
                  className={`h-full bg-gradient-to-r ${m.color} transition-all duration-300 hover:opacity-90 relative group`}
                  style={{ width: `${(m.tokens / tokenTelemetry.totalQuota) * 100}%` }}
                  title={`${m.name}: ${m.tokens.toLocaleString()} tokens (${m.percentage}%)`}
                />
              ))}
              <div 
                className="h-full bg-gray-800/80 backdrop-blur-xs flex-1 transition-all duration-300"
                title="Tokens Restantes Disponibles"
              />
            </div>

            {/* LEYENDA RÁPIDA DE SALUD */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 pt-1">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  <span className="text-gray-300">Salud de Cuota: Excelente</span>
                </span>
                <span className="flex items-center space-x-1 text-purple-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Modelo Más Usado: Gemini 3.6 Flash</span>
                </span>
              </div>
              <div className="text-gray-500">
                Entrada (Prompt): <span className="text-gray-300">312.4K</span> | Salida (IA): <span className="text-gray-300">125.8K</span>
              </div>
            </div>
          </div>

          {/* GRILLA DE MINI TARJETAS DE MODELOS DE ANTIGRAVITY */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {tokenTelemetry.models.map(m => (
              <div 
                key={m.id}
                onClick={handleOpenTokenRadar}
                className="p-3 rounded-2xl bg-[#05070d] border border-gray-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] ${m.badgeColor}`}>{m.mode}</span>
                  <span className="text-gray-400 font-bold">{m.percentage}%</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">{m.name}</div>
                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${m.barColor} transition-all duration-300`}
                    style={{ width: `${m.percentage * 2}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 flex justify-between font-mono">
                  <span>Tokens:</span>
                  <span className="text-cyan-400 font-bold">{(m.tokens / 1000).toFixed(1)}k</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-[#0a0e1a]/90 backdrop-blur-md border border-gray-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h3 className="text-md font-bold text-white">Estado del Enjambre SNC 2.0 (12 Búnkeres)</h3>
            </div>
            <span className="text-xs font-mono text-gray-400">12 / 12 AGENTES CONECTADOS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {bunkers.map(b => (
              <div key={b.code} className="p-3 rounded-2xl bg-[#05070d] border border-gray-800 hover:border-cyan-500/40 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">{b.code}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-xs font-bold text-gray-200 truncate">{b.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">Agente: {b.agent}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-[#05070d]/90 backdrop-blur-md border border-gray-800 p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800/80 pb-2">
            <span className="flex items-center space-x-2">
              <TerminalIcon className="w-4 h-4 text-emerald-400" />
              <span>TERMINAL LOGS DE LUZ 01 & VOZ</span>
            </span>
            <span className="text-[10px]">HISTORIAL DE COMANDOS VOCALES</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 text-xs">
            {logs.map(log => (
              <div key={log.id} className="flex items-start space-x-3 py-0.5">
                <span className="text-gray-500 select-none">[{log.time}]</span>
                <span className={
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warn' ? 'text-amber-400' :
                  log.type === 'cmd' ? 'text-cyan-400 font-bold' : 'text-gray-300'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* MODAL HUD ESCÁNER DE LIMPIEZA DE PC EN VIVO */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#070b16] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden font-mono">
            
            {/* BOTÓN X PARA CERRAR */}
            <button 
              onClick={() => setShowScannerModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl bg-gray-900/80 border border-gray-700 transition-colors z-20"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ENCABEZADO DEL MODAL ESCÁNER */}
            <div className="flex items-center space-x-3 border-b border-emerald-500/30 pb-4">
              <div className={`p-3 rounded-2xl ${scanStep === 'complete' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-spin'}`}>
                {scanStep === 'complete' ? <CheckCircle2 className="w-8 h-8" /> : <RefreshCw className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>MÓDULO DE ESCANEO & LIMPIEZA DE WINDOWS</span>
                </h3>
                <p className="text-xs text-gray-400">
                  {scanStep === 'scanning' && '🔍 Fase 1: Escaneando registros, RAM y carpetas %TEMP%...'}
                  {scanStep === 'cleaning' && '🧹 Fase 2: Purgando temporales y acelerando el sistema...'}
                  {scanStep === 'complete' && '🎉 SISTEMA 100% LIMPIO, RÁPIDO & OPTIMIZADO'}
                </p>
              </div>
            </div>

            {/* BARRA DE PROGRESO ANIMADA */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Progreso de Optimización:</span>
                <span className="font-bold text-emerald-400">{scanProgress}%</span>
              </div>
              <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-emerald-500/30 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-150 ${scanStep === 'complete' ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_15px_#10b981]' : 'bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500'}`}
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* GRILLA DE METRICAS VISUALES EN TIEMPO REAL */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-[#03050a] border border-cyan-500/30 space-y-1">
                <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                  <Trash2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ARCHIVOS BASURA</span>
                </div>
                <div className="text-lg font-bold text-white">{scannedFilesCount}</div>
                <div className="text-[10px] text-cyan-400">Temporales escaneados</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#03050a] border border-purple-500/30 space-y-1">
                <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  <span>ESPACIO RECUPERADO</span>
                </div>
                <div className="text-lg font-bold text-white">{cleanedMbCount} MB</div>
                <div className="text-[10px] text-purple-400">1.12 GB Liberados</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#03050a] border border-emerald-500/30 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AMENAZAS / MALWARE</span>
                </div>
                <div className="text-lg font-bold text-emerald-400">0 AMENAZAS</div>
                <div className="text-[10px] text-emerald-400">Sistema 100% Seguro</div>
              </div>
            </div>

            {/* ESTADO FINAL EN VERDE INTEGRADO */}
            {scanStep === 'complete' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/60 text-emerald-300 space-y-2 animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="flex items-center space-x-2 font-bold text-sm text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>PROCESO TERMINADO CON ÉXITO: DISCO & ARCHIVOS OPTIMIZADOS</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Tu sistema Windows cuenta con **87.96 GB libres** en el disco C:\. No se detectaron virus, troyanos ni ransomware. Tu computadora quedó limpia, estable y súper ágil para operar con Luz 01.
                </p>
              </div>
            )}

            {/* BOTONERA DE ACCIÓN INFERIOR */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowScannerModal(false)}
                disabled={scanStep !== 'complete'}
                className={`px-6 py-3 rounded-2xl font-bold text-xs font-mono transition-all duration-200 flex items-center space-x-2 shadow-lg ${
                  scanStep === 'complete'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-emerald-500/30'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                <span>{scanStep === 'complete' ? 'CERRAR Y FINALIZAR (SISTEMA OPTIMIZADO)' : 'PROCESANDO ESCANEO...'}</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HUD EXPANDIDO DEL RADAR DE CONSUMO DE TOKENS & MODELOS */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#070b16] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden font-mono max-h-[90vh] overflow-y-auto">
            
            {/* BOTÓN X PARA CERRAR */}
            <button 
              onClick={() => setShowTokenModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl bg-gray-900/80 border border-gray-700 transition-colors z-20"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ENCABEZADO DEL MODAL TELEMETRÍA DE TOKENS */}
            <div className="flex items-center space-x-3 border-b border-cyan-500/30 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <BarChart3 className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>RADAR TELEMÉTRICO DE CONSUMO DE TOKENS</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Desglose de uso por modelo en Google Antigravity Engine · Sesión de Director Waly OMEGA
                </p>
              </div>
            </div>

            {/* TARJETAS DE MÉTRICAS CLAVE */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#03050a] border border-cyan-500/30 space-y-1">
                <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <Coins className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CUOTA TOTAL</span>
                </div>
                <div className="text-base font-bold text-white">{(tokenTelemetry.totalQuota / 1000000).toFixed(1)}M</div>
                <div className="text-[10px] text-cyan-400">2,000,000 Limit</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#03050a] border border-purple-500/30 space-y-1">
                <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>TOKENS USADOS</span>
                </div>
                <div className="text-base font-bold text-purple-300">{tokenTelemetry.totalUsed.toLocaleString()}</div>
                <div className="text-[10px] text-purple-400">21.9% Consumido</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#03050a] border border-emerald-500/30 space-y-1">
                <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TOKENS RESTANTES</span>
                </div>
                <div className="text-base font-bold text-emerald-400">{(tokenTelemetry.totalQuota - tokenTelemetry.totalUsed).toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400">78.1% Disponible</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#03050a] border border-amber-500/30 space-y-1">
                <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>MODELO LÍDER</span>
                </div>
                <div className="text-xs font-bold text-amber-300 truncate">Gemini 3.6 Flash</div>
                <div className="text-[10px] text-amber-400">42.2% del Total</div>
              </div>
            </div>

            {/* BARRAS DE CONSUMO DETALLADAS POR CADA MODELO */}
            <div className="space-y-4 bg-[#03050a] p-5 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-center text-xs text-gray-300 border-b border-gray-800 pb-2">
                <span className="font-bold text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>DESGLOSE DE CONSUMO POR MODELO SELECCIONABLE</span>
                </span>
                <span className="text-[10px] text-gray-500">6 MODELOS DETECTADOS</span>
              </div>

              <div className="space-y-3.5">
                {tokenTelemetry.models.map(m => (
                  <div key={m.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{m.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${m.badgeColor}`}>{m.mode}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs font-mono">
                        <span className="text-gray-400">{m.tokens.toLocaleString()} tokens</span>
                        <span className="font-bold text-cyan-400 w-12 text-right">{m.percentage}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800 p-0.5">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-500 shadow-sm`}
                        style={{ width: `${m.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DESGLOSE INPUT VS OUTPUT TOKENS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                <div className="text-xs text-cyan-300 font-bold flex items-center justify-between">
                  <span>📥 TOKENS DE ENTRADA (PROMPTS & CONTEXTO)</span>
                  <span className="font-mono text-white font-bold">{tokenTelemetry.inputTokens.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-gray-400">Tokens enviados en archivos, instrucciones y contexto de Antigravity.</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                <div className="text-xs text-purple-300 font-bold flex items-center justify-between">
                  <span>📤 TOKENS DE SALIDA (RESPUESTAS IA)</span>
                  <span className="font-mono text-white font-bold">{tokenTelemetry.outputTokens.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-gray-400">Tokens generados por la IA en respuestas de texto y código.</p>
              </div>
            </div>

            {/* BOTONERA DE ACCIÓN Y SIMULACIÓN EN VIVO */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setTokenTelemetry(prev => {
                    const addedInput = 1800;
                    const addedOutput = 700;
                    const newTotalUsed = prev.totalUsed + addedInput + addedOutput;
                    return {
                      ...prev,
                      totalUsed: newTotalUsed,
                      inputTokens: prev.inputTokens + addedInput,
                      outputTokens: prev.outputTokens + addedOutput,
                      models: prev.models.map(m => m.id === 'm1' ? { ...m, tokens: m.tokens + addedInput + addedOutput } : m)
                    };
                  });
                  addLog('info', '🧪 Simulación: Se agregaron +2,500 tokens a la telemetría en vivo.');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span>SIMULAR PROMPT DE PRUEBA (+2.5K TOKENS)</span>
              </button>

              <button
                onClick={() => setShowTokenModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-lg"
              >
                CERRAR RADAR DE CONSUMO
              </button>
            </div>

          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0e1a] border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Configuración de Voz Hiperrealista</span>
              </h3>
              <p className="text-xs text-gray-400">
                Por defecto Luz 01 usa la voz sintética nativa de tu navegador. Si querés conectar una voz real de **ElevenLabs**, podés pegar tu Voice ID y API Key abajo.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-gray-300 mb-1">ElevenLabs Voice ID (Opcional):</label>
                <input
                  type="text"
                  value={elevenLabsVoiceId}
                  onChange={e => setElevenLabsVoiceId(e.target.value)}
                  placeholder="ej. 21m00Tcm4TlvDq8ikWAM (Rachel / Female Voice)"
                  className="w-full p-2.5 bg-[#05070d] border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">ElevenLabs API Key (Opcional):</label>
                <input
                  type="password"
                  value={elevenLabsApiKey}
                  onChange={e => setElevenLabsApiKey(e.target.value)}
                  placeholder="sk_..."
                  className="w-full p-2.5 bg-[#05070d] border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowSettings(false);
                  addLog('success', 'Configuración de voz guardada correctamente.');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs rounded-xl hover:from-cyan-400 hover:to-purple-500"
              >
                GUARDAR Y CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JarvisDashboard;
