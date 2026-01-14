import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assistantsService } from '../services/assistants.service';
import { Assistant } from '../types';

export const useAssistants = () => {
  return useQuery({
    queryKey: ['assistants'],
    queryFn: assistantsService.getAssistants
  });
};

export const useAssistant = (id: string) => {
  return useQuery({
    queryKey: ['assistant', id],
    queryFn: () => assistantsService.getAssistantById(id),
    enabled: !!id
  });
};

export const useCreateAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assistantsService.createAssistant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    }
  });
};

export const useUpdateAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assistantsService.updateAssistant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
      queryClient.invalidateQueries({ queryKey: ['assistant', data.id] });
    }
  });
};

export const useDeleteAssistant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assistantsService.deleteAssistant(id),
    // Optimistic Update: Actualizamos el cache antes de que el servidor responda
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['assistants'] });
      const previousAssistants = queryClient.getQueryData<Assistant[]>(['assistants']);

      if (previousAssistants) {
        queryClient.setQueryData<Assistant[]>(['assistants'], 
          previousAssistants.filter(a => a.id !== id)
        );
      }

      return { previousAssistants };
    },
    // Si la mutación falla, revertimos al estado anterior (Rollback)
    onError: (err, id, context) => {
      if (context?.previousAssistants) {
        queryClient.setQueryData(['assistants'], context.previousAssistants);
      }
      console.error('[Mutation] Error en borrado (Rollback ejecutado):', err);
    },
    // Siempre invalidamos al final para asegurar sincronización total
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    }
  });
};

export const useSaveRules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rules }: { id: string, rules: string }) => assistantsService.saveRules(id, rules),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assistant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    }
  });
};