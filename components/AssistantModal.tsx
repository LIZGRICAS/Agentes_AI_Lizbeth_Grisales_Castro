
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAssistantStore } from '../store/assistants.store';
import { useAssistants, useCreateAssistant, useUpdateAssistant } from '../hooks/useAssistants';
import { LANGUAGES, TONES } from '../constants';
import { Button } from './ui/Button';
import { Assistant } from '../types';

export const AssistantModal: React.FC = () => {
  const { isModalOpen, modalMode, selectedAssistantId, closeModal } = useAssistantStore();
  const { data: assistants } = useAssistants();
  const createMutation = useCreateAssistant();
  const updateMutation = useUpdateAssistant();

  const [step, setStep] = useState(1);
  const hasResetRef = useRef(false);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<Omit<Assistant, 'id'>>({
    defaultValues: {
      name: '',
      language: 'Español',
      tone: 'Formal',
      responseLength: { short: 30, medium: 40, long: 30 },
      audioEnabled: false,
      rules: ''
    }
  });

  const responseLength = watch('responseLength');
  const nameVal = watch('name');
  const audioEnabled = watch('audioEnabled');
  const isStep1Valid = nameVal?.trim().length >= 3;

  const totalPercentage = (Number(responseLength?.short) || 0) + 
                          (Number(responseLength?.medium) || 0) + 
                          (Number(responseLength?.long) || 0);
  
  const isSumValid = totalPercentage === 100;

  useEffect(() => {
    if (isModalOpen) {
      if (!hasResetRef.current) {
        setStep(1);
        const selected = assistants?.find(a => a.id === selectedAssistantId);
        if (selected && modalMode === 'edit') {
          reset(selected);
        } else {
          reset({
            name: '',
            language: 'Español',
            tone: 'Formal',
            responseLength: { short: 30, medium: 40, long: 30 },
            audioEnabled: false,
            rules: ''
          });
        }
        hasResetRef.current = true;
      }
    } else {
      hasResetRef.current = false;
    }
  }, [isModalOpen, modalMode, selectedAssistantId, assistants, reset]);

  if (!isModalOpen) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isStep1Valid) return;
    setStep(2);
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep(1);
  };

  const onSubmit = (data: Omit<Assistant, 'id'>) => {
    if (!isSumValid) {
      alert('La suma de porcentajes de longitud de respuestas debe ser exactamente 100%.');
      return;
    }
    const payload = {
      ...data,
      responseLength: {
        short: Number(data.responseLength.short),
        medium: Number(data.responseLength.medium),
        long: Number(data.responseLength.long),
      }
    };

    if (modalMode === 'edit' && selectedAssistantId) {
      updateMutation.mutate({ ...payload, id: selectedAssistantId } as Assistant, { onSuccess: closeModal });
    } else {
      createMutation.mutate(payload, { onSuccess: closeModal });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-2xl transition-all duration-500">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] border border-white/40 animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header Compacto con Stepper Minimalista */}
        <div className="pt-8 px-10 pb-6 shrink-0 bg-slate-50/80 border-b border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {modalMode === 'edit' ? 'Editar' : 'Nuevo'} Asistente
              </h2>
            </div>
            <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-brand-rose transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${step >= 1 ? 'text-brand-rose' : 'text-slate-300'}`}>
                  1. Identidad
                </span>
                {step > 1 && (
                  <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className={`h-full transition-all duration-700 ease-out bg-brand-gradient ${step >= 1 ? 'w-full shadow-[0_0_10px_rgba(217,54,84,0.4)]' : 'w-0'}`} />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-1.5">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${step >= 2 ? 'text-brand-rose' : 'text-slate-300'}`}>
                  2. Ajustes
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className={`h-full transition-all duration-700 ease-out bg-brand-gradient ${step === 2 ? 'w-full shadow-[0_0_10px_rgba(217,54,84,0.4)]' : 'w-0'}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-10 pt-8">
          <form id="assistant-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Nombre del Asistente</label>
                  <input 
                    {...register('name', { required: true, minLength: 3 })}
                    placeholder="Ej. Concierge Comercial"
                    autoFocus
                    className="w-full px-7 py-5 border-2 border-slate-100 rounded-[1.5rem] outline-none font-bold text-black bg-slate-50 focus:bg-white focus:border-brand-rose focus:ring-8 focus:ring-brand-rose/5 transition-all text-lg placeholder:text-slate-300"
                  />
                  {errors.name && <p className="text-brand-rose text-[9px] font-black mt-2 uppercase">Mínimo 3 caracteres requeridos.</p>}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Idioma</label>
                    <div className="relative">
                      <select {...register('language')} className="w-full px-7 py-5 border-2 border-slate-100 rounded-[1.5rem] font-bold text-black bg-slate-50 appearance-none focus:bg-white focus:border-brand-rose outline-none transition-all cursor-pointer shadow-sm">
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand-rose">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Tono</label>
                    <div className="relative">
                      <select {...register('tone')} className="w-full px-7 py-5 border-2 border-slate-100 rounded-[1.5rem] font-bold text-black bg-slate-50 appearance-none focus:bg-white focus:border-brand-rose outline-none transition-all cursor-pointer shadow-sm">
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand-rose">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-left-8 fade-in duration-500">
                <div className="bg-slate-50/50 p-8 rounded-[2rem] border-2 border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Balance de Respuestas</h3>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black border transition-all ${isSumValid ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white border-brand-rose/20 text-brand-rose'}`}>
                      {totalPercentage}% / 100%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {(['short', 'medium', 'long'] as const).map((key) => (
                      <div key={key}>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">{key === 'short' ? 'Corta' : key === 'medium' ? 'Media' : 'Larga'}</label>
                        <input 
                          type="number"
                          {...register(`responseLength.${key}`, { valueAsNumber: true })}
                          className="w-full py-5 border-2 border-slate-200 rounded-2xl text-center font-black text-black bg-white focus:border-brand-rose focus:ring-4 focus:ring-brand-rose/5 outline-none transition-all text-xl"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <label className={`flex items-center gap-5 p-7 rounded-[2rem] border-2 transition-all group bg-white shadow-sm cursor-pointer ${audioEnabled ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100 hover:border-brand-rose/20 hover:bg-brand-rose/[0.02]'}`}>
                  <div className="relative flex items-center">
                    <input type="checkbox" {...register('audioEnabled')} className="peer sr-only" />
                    <div className="w-16 h-8 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-all duration-300 peer-checked:shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-8 shadow-md"></div>
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-black block mb-0.5 transition-colors ${audioEnabled ? 'text-emerald-600' : 'text-black group-hover:text-brand-rose'}`}>Salida de Voz AI</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Interacciones por audio</span>
                  </div>
                </label>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4 shrink-0">
          {step === 2 && (
            <Button type="button" variant="ghost" className="flex-1 h-16 rounded-[1.5rem] text-slate-500 font-black uppercase text-[10px] tracking-widest bg-white border-2 border-slate-200 hover:bg-slate-100" onClick={handleBack}>
              Volver
            </Button>
          )}
          
          <Button 
            form={step === 2 ? "assistant-form" : undefined}
            type={step === 2 ? "submit" : "button"}
            variant="primary" 
            className="flex-1 h-16 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] shadow-xl shadow-brand-rose/30 active:scale-95 transition-all" 
            disabled={step === 1 ? !isStep1Valid : !isSumValid} 
            onClick={step === 1 ? handleNext : undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {step === 1 ? (
              <>Siguiente Paso <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></>
            ) : (
              modalMode === 'edit' ? 'Guardar Cambios' : 'Activar IA'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
