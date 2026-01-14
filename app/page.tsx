
'use client';

import React, { useState, useEffect } from 'react';
import { useAssistants, useDeleteAssistant } from '../hooks/useAssistants';
import { AssistantCard } from '../components/AssistantCard';
import { Button } from '../components/ui/Button';
import { useAssistantStore } from '../store/assistants.store';
import { AssistantModal } from '../components/AssistantModal';

export default function AssistantsPage() {
  const { data: assistants, isLoading, error } = useAssistants();
  const deleteMutation = useDeleteAssistant();
  const { openModal } = useAssistantStore();
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Auto-ocultar el mensaje de éxito
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const handleDeleteRequest = (id: string) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = () => {
    if (!confirmDeleteId) return;
    
    deleteMutation.mutate(confirmDeleteId, {
      onSuccess: () => {
        setConfirmDeleteId(null);
        setShowSuccessToast(true);
      },
      onError: (err: any) => {
        alert(err.message || "Error al eliminar.");
        setConfirmDeleteId(null);
      }
    });
  };

  const selectedAssistantName = assistants?.find(a => a.id === confirmDeleteId)?.name;

  return (
    <div className="min-h-screen bg-gray-50/50 overflow-x-hidden">
      <section className="bg-brand-navy pt-12 pb-24 md:pt-16 md:pb-32 text-center px-4 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-brand-rose blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-brand-orange blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-4 md:mb-6">
            IA con <span className="text-brand-gradient">SuperPoderes</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-2 md:px-4">
            Construye, entrena y despliega asistentes inteligentes que multiplican tus conversiones automáticamente.
          </p>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4 sm:px-6">
            <Button size="lg" variant="primary" onClick={() => openModal('create')} className="w-full sm:w-auto text-base md:text-lg px-8 md:px-10 h-14 md:h-16 shadow-2xl shadow-brand-rose/40 group">
              <span className="mr-2">Crear Asistente</span>
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-20 relative z-20">
        <div className="bg-white/60 backdrop-blur-2xl p-2 md:p-3 rounded-[2rem] md:rounded-[3.5rem] border border-white/40 shadow-2xl">
          <div className="bg-white p-6 md:p-12 lg:p-14 rounded-[1.8rem] md:rounded-[3rem] shadow-inner min-h-[400px]">
             {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-[300px] md:h-[380px] bg-gray-50 border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] animate-pulse relative overflow-hidden"></div>
                ))}
              </div>
            ) : error ? (
              <div className="py-20 md:py-24 text-center">
                <h3 className="text-2xl md:text-3xl font-black text-brand-navy mb-4 text-red-500">Error de Conexión</h3>
                <Button variant="outline" onClick={() => window.location.reload()}>Reintentar</Button>
              </div>
            ) : !assistants || assistants.length === 0 ? (
              <div className="text-center py-20 md:py-24">
                <h3 className="text-3xl md:text-4xl font-black text-brand-navy mb-6">No hay asistentes</h3>
                <Button variant="primary" size="lg" onClick={() => openModal('create')} className="h-14 md:h-16 px-10">Crear Primer Asistente</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {assistants.map(assistant => (
                  <AssistantCard 
                    key={assistant.id} 
                    assistant={assistant} 
                    onDelete={handleDeleteRequest}
                    isDeleting={deleteMutation.isPending && deleteMutation.variables === assistant.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md p-8 md:p-10 shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-brand-navy text-center mb-2">¿Eliminar Asistente?</h3>
            <p className="text-gray-500 text-center mb-8 font-medium text-sm md:text-base">
              Estás a punto de eliminar a <span className="text-brand-rose font-bold">"{selectedAssistantName}"</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 md:gap-4">
              <Button 
                variant="ghost" 
                className="w-full xs:flex-1 h-12 md:h-14 bg-gray-50 hover:bg-gray-100 text-sm md:text-base" 
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                className="w-full xs:flex-1 h-12 md:h-14 bg-red-500 hover:bg-red-600 shadow-red-200 text-sm md:text-base" 
                onClick={executeDelete}
                isLoading={deleteMutation.isPending}
              >
                Sí, Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de Éxito (Toast) */}
      {showSuccessToast && (
        <div className="fixed bottom-10 right-4 md:right-10 z-[110] animate-in slide-in-from-right-10 duration-500">
          <div className="bg-white border border-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.2)] rounded-[2rem] p-4 pr-8 flex items-center gap-4 backdrop-blur-xl">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">Asistente Eliminado</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Base de datos actualizada</p>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="ml-4 text-slate-300 hover:text-slate-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}

      <AssistantModal />
    </div>
  );
}
