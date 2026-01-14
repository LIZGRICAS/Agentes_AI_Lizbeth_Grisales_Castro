import React from 'react';
import { Assistant } from '../types';
import { Button } from './ui/Button';
import { useAssistantStore } from '../store/assistants.store';
import { useRouter } from "next/navigation";

interface AssistantCardProps {
  assistant: Assistant;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const AssistantCard: React.FC<AssistantCardProps> = ({ assistant, onDelete, isDeleting }) => {
  const { openModal } = useAssistantStore();
  const router = useRouter();

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openModal('edit', assistant.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(assistant.id);
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-[1.8rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-rose/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-rose/10 transition-colors z-0 pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
        <div className="flex flex-col gap-1 md:gap-2 pr-2">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-brand-rose/10 text-brand-rose text-[8px] md:text-[10px] font-extrabold rounded-full uppercase tracking-widest border border-brand-rose/20">
              {assistant.language}
            </span>
            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-brand-orange/10 text-brand-orange text-[8px] md:text-[10px] font-extrabold rounded-full uppercase tracking-widest border border-brand-orange/20">
              {assistant.tone}
            </span>
            {assistant.audioEnabled && (
              <span className="px-2 py-0.5 md:px-3 md:py-1 bg-emerald-100 text-emerald-600 text-[8px] md:text-[10px] font-extrabold rounded-full uppercase tracking-widest border border-emerald-200 flex items-center gap-1">
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v18l-6-6H2V9h4l6-6zm5 9c0-1.77-1.02-3.29-2.5-4.03v8.05C15.98 15.29 17 13.77 17 12z"/></svg>
                Audio
              </span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 group-hover:text-brand-rose transition-colors leading-tight">
            {assistant.name}
          </h3>
        </div>
        
        <div className="flex gap-1.5 md:gap-2 relative z-[30]">
          <button 
            type="button"
            onClick={handleEdit} 
            className="w-8 h-8 md:w-10 md:h-10 text-gray-400 hover:text-brand-rose hover:bg-brand-rose/5 rounded-lg md:rounded-xl transition-all flex items-center justify-center bg-white border border-gray-100 shadow-sm active:scale-90"
            title="Editar"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
          
          <button 
            type="button"
            onClick={handleDelete} 
            disabled={isDeleting}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl transition-all flex items-center justify-center bg-white border border-gray-100 shadow-sm active:scale-90 ${
              isDeleting ? 'opacity-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100'
            }`}
            title="Eliminar"
          >
            {isDeleting ? (
              <svg className="animate-spin w-4 h-4 md:w-5 md:h-5 text-brand-rose" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8 line-clamp-3 leading-relaxed min-h-[3.5rem] md:min-h-[4.5rem] relative z-10 flex-grow italic">
        {assistant.rules || "Sin reglas de entrenamiento configuradas..."}
      </p>

      <div className="relative z-20 mt-auto">
        <Button 
          variant="brand" 
          className="w-full justify-between pr-3 pl-6 md:pr-4 md:pl-8 group/btn h-12 md:h-14" 
          onClick={() => router.push(`/assistant/${assistant.id}`)}
        >
          <span className="font-extrabold tracking-tight text-xs md:text-base">Entrenar SuperPoder</span>
          <div className="bg-white/20 p-1.5 md:p-2 rounded-lg md:rounded-xl group-hover/btn:bg-white/30 transition-colors">
            <svg className="w-4 h-4 md:w-5 md:h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </div>
        </Button>
      </div>
    </div>
  );
};