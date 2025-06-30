import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Confession = Database['public']['Tables']['confessions']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];

export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('confessions')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          if (isMountedRef.current) {
            setError(error.message);
            setIsConnected(false);
          }
        } else {
          console.log('✅ Supabase connected successfully');
          if (isMountedRef.current) {
            setIsConnected(true);
            setError(null);
          }
        }
      } catch (err) {
        console.error('Connection test failed:', err);
        if (isMountedRef.current) {
          setError('Failed to connect to Supabase');
          setIsConnected(false);
        }
      }
    };

    testConnection();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { isConnected, error };
}

export function useConfessions() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchConfessions = async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        if (isMountedRef.current) {
          setError(error.message);
        }
        console.error('Error fetching confessions:', error);
      } else {
        if (isMountedRef.current) {
          setConfessions(data || []);
          setError(null);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Failed to fetch confessions');
      }
      console.error('Fetch error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const createConfession = async (confession: {
    content: string;
    tag: string;
    roast: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('confessions')
        .insert([
          {
            ...confession,
            reactions: { laugh: 0, skull: 0, shocked: 0, cry: 0 },
            poll: { you: 0, them: 0, both: 0 },
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating confession:', error);
        return { success: false, error: error.message };
      }

      // Refresh the list only if component is still mounted
      if (isMountedRef.current) {
        await fetchConfessions();
      }
      return { success: true, data };
    } catch (err) {
      console.error('Create error:', err);
      return { success: false, error: 'Failed to create confession' };
    }
  };

  const updateReaction = async (confessionId: string, reactionType: string) => {
    try {
      // First get the current confession
      const { data: confession, error: fetchError } = await supabase
        .from('confessions')
        .select('reactions')
        .eq('id', confessionId)
        .single();

      if (fetchError || !confession) {
        console.error('Error fetching confession for reaction update:', fetchError);
        return false;
      }

      // Update the reaction count
      const updatedReactions = {
        ...confession.reactions,
        [reactionType]: (confession.reactions[reactionType] || 0) + 1,
      };

      const { error } = await supabase
        .from('confessions')
        .update({ reactions: updatedReactions })
        .eq('id', confessionId);

      if (error) {
        console.error('Error updating reaction:', error);
        return false;
      }

      // Refresh the list only if component is still mounted
      if (isMountedRef.current) {
        await fetchConfessions();
      }
      return true;
    } catch (err) {
      console.error('Reaction update error:', err);
      return false;
    }
  };

  const updatePoll = async (confessionId: string, voteType: 'you' | 'them' | 'both') => {
    try {
      // First get the current confession
      const { data: confession, error: fetchError } = await supabase
        .from('confessions')
        .select('poll')
        .eq('id', confessionId)
        .single();

      if (fetchError || !confession) {
        console.error('Error fetching confession for poll update:', fetchError);
        return false;
      }

      // Update the poll count
      const updatedPoll = {
        ...confession.poll,
        [voteType]: (confession.poll[voteType] || 0) + 1,
      };

      const { error } = await supabase
        .from('confessions')
        .update({ poll: updatedPoll })
        .eq('id', confessionId);

      if (error) {
        console.error('Error updating poll:', error);
        return false;
      }

      // Refresh the list only if component is still mounted
      if (isMountedRef.current) {
        await fetchConfessions();
      }
      return true;
    } catch (err) {
      console.error('Poll update error:', err);
      return false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchConfessions();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    confessions,
    loading,
    error,
    fetchConfessions,
    createConfession,
    updateReaction,
    updatePoll,
  };
}

export function useComments(confessionId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchComments = async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('confession_id', confessionId)
        .order('created_at', { ascending: true });

      if (error) {
        if (isMountedRef.current) {
          setError(error.message);
        }
        console.error('Error fetching comments:', error);
      } else {
        if (isMountedRef.current) {
          setComments(data || []);
          setError(null);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Failed to fetch comments');
      }
      console.error('Fetch error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const createComment = async (text: string, author?: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            confession_id: confessionId,
            text,
            author: author || `User${Math.floor(Math.random() * 1000)}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        return { success: false, error: error.message };
      }

      // Refresh comments only if component is still mounted
      if (isMountedRef.current) {
        await fetchComments();
      }
      return { success: true, data };
    } catch (err) {
      console.error('Create comment error:', err);
      return { success: false, error: 'Failed to create comment' };
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    if (confessionId) {
      fetchComments();

      // Set up real-time subscription for comments
      const subscription = supabase
        .channel(`comments:${confessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `confession_id=eq.${confessionId}`,
          },
          (payload) => {
            console.log('New comment received:', payload);
            if (isMountedRef.current) {
              setComments((current) => [...current, payload.new as Comment]);
            }
          }
        )
        .subscribe();

      return () => {
        isMountedRef.current = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [confessionId]);

  return {
    comments,
    loading,
    error,
    createComment,
    fetchComments,
  };
}

export function useChatMessages(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchMessages = async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        if (isMountedRef.current) {
          setError(error.message);
        }
        console.error('Error fetching messages:', error);
      } else {
        if (isMountedRef.current) {
          setMessages(data || []);
          setError(null);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Failed to fetch messages');
      }
      console.error('Fetch error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const sendMessage = async (text: string, isBot: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: roomId,
            text,
            is_bot: isBot,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
      }

      // Refresh messages only if component is still mounted
      if (isMountedRef.current) {
        await fetchMessages();
      }
      return { success: true, data };
    } catch (err) {
      console.error('Send message error:', err);
      return { success: false, error: 'Failed to send message' };
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    if (roomId) {
      fetchMessages();

      // Set up real-time subscription
      const subscription = supabase
        .channel(`chat_messages:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            console.log('New message received:', payload);
            if (isMountedRef.current) {
              setMessages((current) => [...current, payload.new as ChatMessage]);
            }
          }
        )
        .subscribe();

      return () => {
        isMountedRef.current = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [roomId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages,
  };
}