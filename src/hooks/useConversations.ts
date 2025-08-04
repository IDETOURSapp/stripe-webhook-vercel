import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { Message } from '../types/database';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          match:matches(
            *,
            client:profiles!matches_client_id_fkey(*),
            provider:profiles!matches_provider_id_fkey(*)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: user.user.id,
            content,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
};