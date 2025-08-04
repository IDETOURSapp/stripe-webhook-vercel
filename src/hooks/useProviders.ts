import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

export const useProviders = () => {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'provider')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ providerId }: { providerId: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) {
        throw new Error('No user logged in');
      }
      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            client_id: session.session.user.id,
            provider_id: providerId,
            status: 'pending',
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) {
        throw new Error('No user logged in');
      }
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_provider_id_fkey(full_name, user_type)
        `)
        .eq('client_id', session.session.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache de 5 minutos
  });
};