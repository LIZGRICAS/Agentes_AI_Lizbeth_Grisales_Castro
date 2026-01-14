
import { Assistant } from '../types';
import { INITIAL_ASSISTANTS } from '../constants';

// Aseguramos persistencia en el objeto window para evitar reseteos por duplicidad de carga de módulos
const DB_KEY = '_assistantDb';

const getDb = (): Assistant[] => {
  if (typeof window !== 'undefined') {
    if (!(window as any)[DB_KEY]) {
      console.log('[Service] Inicializando DB persistente...');
      (window as any)[DB_KEY] = [...INITIAL_ASSISTANTS];
    }
    return (window as any)[DB_KEY];
  }
  return [...INITIAL_ASSISTANTS];
};

const setDb = (newDb: Assistant[]) => {
  if (typeof window !== 'undefined') {
    (window as any)[DB_KEY] = newDb;
    console.log('[Service] DB actualizada correctamente. Items restantes:', newDb.length);
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const assistantsService = {
  getAssistants: async (): Promise<Assistant[]> => {
    await delay(300);
    return [...getDb()];
  },

  getAssistantById: async (id: string): Promise<Assistant | undefined> => {
    await delay(200);
    return getDb().find(a => a.id === id);
  },

  createAssistant: async (assistant: Omit<Assistant, 'id'>): Promise<Assistant> => {
    await delay(600);
    const newAssistant = { ...assistant, id: Math.random().toString(36).substr(2, 9) };
    setDb([...getDb(), newAssistant]);
    return newAssistant;
  },

  updateAssistant: async (assistant: Assistant): Promise<Assistant> => {
    await delay(600);
    setDb(getDb().map(a => a.id === assistant.id ? assistant : a));
    return assistant;
  },

  deleteAssistant: async (id: string): Promise<void> => {
    console.log(`[Service] Ejecutando DELETE para ID: ${id}`);
    await delay(500);
    
    // Simulación del 10% de error requerida
    if (Math.random() < 0.1) {
      console.error('[Service] Error simulado (10%)');
      throw new Error("El sistema de archivos de IA está ocupado. Intenta de nuevo.");
    }

    const current = getDb();
    const filtered = current.filter(a => a.id !== id);
    
    if (filtered.length === current.length) {
      console.warn(`[Service] El asistente con ID ${id} no existía.`);
      throw new Error("Asistente no encontrado.");
    }

    setDb(filtered);
    console.log(`[Service] Eliminación completada para ID: ${id}`);
  },

  saveRules: async (id: string, rules: string): Promise<void> => {
    await delay(400);
    setDb(getDb().map(a => a.id === id ? { ...a, rules } : a));
  }
};
