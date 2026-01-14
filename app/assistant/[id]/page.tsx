
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAssistant, useSaveRules } from '../../../hooks/useAssistants';
import { Button } from '../../../components/ui/Button';
import { ChatSimulator } from '../../../components/ChatSimulator';

export default function TrainingPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : (rawId ?? '');
  const navigate = useRouter();
  const { data: assistant, isLoading } = useAssistant(id || '');
  const saveRulesMutation = useSaveRules();

  const [rules, setRules] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (assistant) {
      setRules(assistant.rules);
    }
  }, [assistant]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-rose"></div>
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-brand-navy">Asistente no encontrado</h2>
        <Button onClick={() => navigate.push('/')} className="mt-6 mx-auto">Volver al Dashboard</Button>
      </div>
    );
  }

  const handleSave = () => {
    saveRulesMutation.mutate({ id: assistant.id, rules }, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-1 py-6 md:py-4">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Botón de retroceso reconstruido con color explícito y SVG simplificado para máxima visibilidad */}
        <button 
          onClick={() => navigate.push('/')}
          className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 hover:border-brand-rose/40 transition-all group shrink-0 active:scale-90"
          aria-label="Volver"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transform group-hover:-translate-x-1 transition-transform"
          >
            <path 
              d="M15 19L8 12L15 5" 
              stroke="#D93654" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              {assistant.name}
            </h1>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
              En Entrenamiento
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-rose rounded-full shadow-[0_0_8px_rgba(217,54,84,0.4)]"></span>
              {assistant.language}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-orange rounded-full shadow-[0_0_8px_rgba(233,154,58,0.4)]"></span>
              {assistant.tone}
            </span>
            {assistant.audioEnabled && (
              <span className="flex items-center gap-1.5 text-indigo-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v18l-6-6H2V9h4l6-6zm5 9c0-1.77-1.02-3.29-2.5-4.03v8.05C15.98 15.29 17 13.77 17 12z"/></svg>
                Voz Activa
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Editor de Reglas */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
          
          <div className="flex justify-between items-center mb-6 relative">
            <h3 className="text-xl font-black text-slate-900">Prompt del Sistema</h3>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">Capa de Lógica</span>
          </div>
          
          <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
            Define la personalidad y el alcance de las respuestas. Estos parámetros guiarán el comportamiento de la IA en tiempo real.
          </p>
          
          <textarea 
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="w-full min-h-[200px] p-4 border-2 border-slate-200 rounded-xl bg-slate-50 font-mono text-sm text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-y overflow-scroll shadow-inner"
            placeholder="Ej. Actúa como un experto en ventas de alto impacto..."
          />
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className={`text-sm font-black text-emerald-600 flex items-center gap-3 transition-all duration-500 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
              </div>
              Cambios sincronizados
            </div>
            <Button 
              onClick={handleSave} 
              isLoading={saveRulesMutation.isPending}
              disabled={rules === assistant.rules}
              className="w-full sm:w-auto h-16 px-10 text-sm uppercase tracking-widest shadow-2xl shadow-brand-rose/20 rounded-2xl"
            >
              Actualizar Entrenamiento
            </Button>
          </div>
        </div>

        {/* Simulador */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-2 rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
            <ChatSimulator assistantId={assistant.id} />
          </div>
          
          <div className="bg-brand-rose/5 border border-brand-rose/10 rounded-[2rem] p-6 flex gap-5 items-center">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-rose shrink-0 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-xs text-brand-rose/80 font-bold leading-relaxed uppercase tracking-tight">
              Los cambios en el prompt se inyectan instantáneamente en el núcleo de la IA tras guardar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
