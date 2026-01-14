
import React, { useState, useRef, useEffect } from 'react';
import { useAssistantStore } from '../store/assistants.store';
import { useAssistants } from '../hooks/useAssistants';
import { Button } from './ui/Button';
import { Message } from '../types';
import { GoogleGenAI } from "@google/genai";
import { CHAT_MOCK_RESPONSES } from '../constants';

// Subcomponente para el reproductor de voz personalizado
const VoiceMessagePlayer: React.FC<{ url: string, isUser: boolean }> = ({ url, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  return (
    <div className={`mt-3 flex items-center gap-4 p-4 rounded-2xl border transition-all ${isUser ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-100'}`}>
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
      
      {/* Botón de Play Circular y Grande */}
      <button 
        onClick={togglePlay}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 shrink-0 ${
          isUser ? 'bg-white text-brand-rose' : 'bg-brand-rose text-white'
        }`}
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      {/* Barra de Progreso y Detalles */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ${isUser ? 'bg-white' : 'bg-brand-rose'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-[10px] font-black uppercase tracking-tighter ${isUser ? 'text-white/70' : 'text-slate-400'}`}>
            {isPlaying ? 'Reproduciendo...' : 'Nota de voz'}
          </span>
          <a 
            href={url} 
            download 
            className={`p-1.5 rounded-lg transition-colors ${isUser ? 'text-white/50 hover:text-white' : 'text-slate-300 hover:text-brand-rose'}`}
            title="Descargar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
};

interface ChatSimulatorProps {
  assistantId: string;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ assistantId }) => {
  const { chatHistory, addChatMessage, clearChat } = useAssistantStore();
  const { data: assistants } = useAssistants();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('Escribiendo...');
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState<number[]>(new Array(8).fill(0));
  const [hasVoiceSignal, setHasVoiceSignal] = useState(false);
  
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const maxVolumeDetected = useRef<number>(0);

  const assistant = assistants?.find(a => a.id === assistantId);
  const messages = chatHistory[assistantId] || [];

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = allDevices.filter(d => d.kind === 'audioinput');
        setDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (err) {
        setPermissionError(true);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const generateAIResponse = async (userMessage: string, audioData?: { data: string, mimeType: string }) => {
    if (!assistant) return;
    setIsTyping(true);
    setTypingText(audioData ? 'Analizando tu mensaje de voz...' : 'Escribiendo...');
    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      // Si no hay API key, usamos respuestas simuladas locales (requisito de la prueba)
      if (!apiKey) {
        const randomDelay = 1000 + Math.floor(Math.random() * 1000); // 1-2s
        await new Promise((res) => setTimeout(res, randomDelay));

        const text = CHAT_MOCK_RESPONSES[Math.floor(Math.random() * CHAT_MOCK_RESPONSES.length)];
        addChatMessage(assistantId, {
          id: Date.now().toString(),
          text,
          sender: 'assistant',
          timestamp: Date.now()
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemPrompt = `Eres "${assistant.name}". Responde en ${assistant.language} con tono ${assistant.tone}. Si es audio, confirma que has escuchado bien.`;

      const parts: any[] = [];
      if (audioData) {
        parts.push({ inlineData: { data: audioData.data, mimeType: audioData.mimeType } });
        parts.push({ text: userMessage || "Procesa este audio." });
      } else {
        parts.push({ text: userMessage });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts }],
        config: { systemInstruction: systemPrompt }
      });

      addChatMessage(assistantId, {
        id: Date.now().toString(),
        text: (response as any).text || "Entendido.",
        sender: 'assistant',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Gemini Error:", error);
      // Fallback: si hay error con la API, enviamos una respuesta mock
      const text = CHAT_MOCK_RESPONSES[Math.floor(Math.random() * CHAT_MOCK_RESPONSES.length)];
      addChatMessage(assistantId, {
        id: Date.now().toString(),
        text,
        sender: 'assistant',
        timestamp: Date.now()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    setPermissionError(false);
    maxVolumeDetected.current = 0;
    setHasVoiceSignal(false);

    try {
      const constraints = { 
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') await audioContext.resume();
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        const newLevels = [];
        for(let i=0; i<8; i++) {
          const val = dataArray[i * 2] / 255;
          newLevels.push(val);
          sum += val;
        }
        
        const avg = sum / 8;
        if (avg > maxVolumeDetected.current) maxVolumeDetected.current = avg;
        if (avg > 0.02) setHasVoiceSignal(true);

        setVolumeLevel(newLevels);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      
      mediaRecorder.onstop = async () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (chunksRef.current.length === 0) return;
        
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        if (maxVolumeDetected.current < 0.01) {
          alert("¡Se detectó silencio absoluto! \n\nPrueba a seleccionar el Micrófono correcto arriba.");
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(',')[1];
          const audioUrl = URL.createObjectURL(blob);
          if (base64data) {
            addChatMessage(assistantId, {
              id: Date.now().toString(),
              text: "🎤 Nota de voz enviada",
              sender: 'user',
              timestamp: Date.now(),
              audioUrl 
            });
            await generateAIResponse("", { data: base64data, mimeType: mediaRecorder.mimeType });
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Mic error:", err);
      setPermissionError(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setVolumeLevel(new Array(8).fill(0));
    }
  };

  return (
    <div className="flex flex-col h-[500px] border-2 border-slate-100 rounded-[3rem] bg-slate-50/50 overflow-hidden shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <p className="text-base font-black text-slate-900 leading-none mb-1">{assistant?.name}</p>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">IA Conectada</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl border transition-all ${showSettings ? 'bg-brand-rose border-brand-rose text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-brand-rose'}`}
            title="Ajustes de Micrófono"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </button>
          <button onClick={() => clearChat(assistantId)} className="text-[10px] font-black text-slate-400 hover:text-brand-rose px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 uppercase tracking-tighter">Limpiar</button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-6 bg-white border-b border-slate-100 animate-in slide-in-from-top duration-300">
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-center">Selecciona tu Micrófono Físico</label>
          <div className="relative max-w-sm mx-auto">
            <select 
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full pl-5 pr-12 py-3 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 bg-slate-50 outline-none appearance-none focus:border-brand-rose transition-all"
            >
              {devices.length === 0 && <option>No se detectan micrófonos</option>}
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Micrófono ${device.deviceId.slice(0, 5)}...`}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-rose">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-xl border ${
              msg.sender === 'user' ? 'bg-brand-gradient text-white border-transparent' : 'bg-white border-slate-100 text-slate-900 font-medium'
            }`}>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm leading-relaxed">{msg.text}</span>
                {msg.audioUrl && (
                  <VoiceMessagePlayer url={msg.audioUrl} isUser={msg.sender === 'user'} />
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-center gap-3">
            <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 flex gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 bg-brand-rose rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-brand-rose rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{typingText}</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-slate-100">
        {isRecording && (
          <div className={`mb-4 flex items-center justify-center gap-5 p-4 rounded-2xl border transition-all ${hasVoiceSignal ? 'bg-brand-rose/5 border-brand-rose/20' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex gap-1.5 h-8 items-center">
              {volumeLevel.map((level, i) => (
                <div 
                  key={i} 
                  className={`w-2 rounded-full transition-all duration-75 ${hasVoiceSignal ? 'bg-brand-rose' : 'bg-slate-300'}`} 
                  style={{ height: `${Math.max(15, level * 100)}%` }}
                ></div>
              ))}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${hasVoiceSignal ? 'text-brand-rose animate-pulse' : 'text-slate-400'}`}>
              {hasVoiceSignal ? 'Señal de Voz Activa' : 'Sin señal detectada...'}
            </span>
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); if(inputValue.trim()) { generateAIResponse(inputValue); addChatMessage(assistantId, { id: Date.now().toString(), text: inputValue, sender: 'user', timestamp: Date.now() }); setInputValue(''); } }} className="flex gap-4 items-center">
          <button 
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-brand-rose text-white scale-110 shadow-2xl shadow-brand-rose/30 animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-brand-rose hover:text-white hover:rotate-6 shadow-sm'}`}
            title="Mantén para hablar"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
          </button>
          
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isRecording ? "Grabando..." : "Escribe aquí..."}
            className="flex-1 px-6 py-4 border-2 border-slate-50 rounded-2xl font-bold bg-slate-50 outline-none focus:bg-white focus:border-brand-rose transition-all shadow-inner"
            disabled={isTyping || isRecording}
          />
          
          <Button type="submit" variant="primary" className="w-16 h-16 rounded-2xl p-0 shadow-xl" disabled={!inputValue.trim() || isTyping || isRecording}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </Button>
        </form>
      </div>
    </div>
  );
};
