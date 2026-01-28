import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Conversation = Tables<'conversations'>;
type Message = Tables<'messages'>;

interface ConversationWithDetails extends Conversation {
  other_party_name: string;
  other_party_avatar?: string | null;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

interface MessageWithSender extends Message {
  sender_name?: string | null;
  sender_avatar?: string | null;
}

export function useChat(conversationId?: string) {
  const { user, userRole } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [conversationDetails, setConversationDetails] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch all conversations for the user
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's supplier profile ID if they are a supplier
      let supplierProfileId: string | null = null;
      if (userRole === 'supplier') {
        const { data: supplierProfile } = await supabase
          .from('supplier_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        supplierProfileId = supplierProfile?.id || null;
      }

      // Fetch conversations
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get all unique buyer IDs and supplier IDs
      const buyerIds = [...new Set(conversationsData.map(c => c.buyer_id))];
      const supplierIds = [...new Set(conversationsData.map(c => c.supplier_id))];

      // Fetch buyer profiles
      const { data: buyerProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', buyerIds);

      // Fetch supplier profiles
      const { data: supplierProfiles } = await supabase
        .from('supplier_profiles')
        .select('id, company_name, logo_url')
        .in('id', supplierIds);

      // Fetch last message for each conversation
      const conversationIds = conversationsData.map(c => c.id);
      const { data: lastMessages } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      // Fetch unread counts per conversation
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('conversation_id, id')
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      // Build lookup maps
      const buyerMap = new Map(buyerProfiles?.map(p => [p.user_id, p]) || []);
      const supplierMap = new Map(supplierProfiles?.map(p => [p.id, p]) || []);
      
      // Group messages by conversation to get the first (most recent) one
      const lastMessageMap = new Map<string, { content: string; created_at: string; sender_id: string }>();
      lastMessages?.forEach(msg => {
        if (!lastMessageMap.has(msg.conversation_id)) {
          lastMessageMap.set(msg.conversation_id, msg);
        }
      });

      // Count unread messages per conversation
      const unreadCountMap = new Map<string, number>();
      unreadMessages?.forEach(msg => {
        const count = unreadCountMap.get(msg.conversation_id) || 0;
        unreadCountMap.set(msg.conversation_id, count + 1);
      });

      // Build enhanced conversations
      const isBuyer = userRole === 'buyer' || !supplierProfileId;
      const enhancedConversations: ConversationWithDetails[] = conversationsData.map(conv => {
        let otherPartyName = 'Unknown';
        let otherPartyAvatar: string | null = null;

        if (isBuyer || conv.buyer_id !== user.id) {
          // Current user is buyer or viewing as buyer, show supplier info
          const supplier = supplierMap.get(conv.supplier_id);
          if (supplier) {
            otherPartyName = supplier.company_name;
            otherPartyAvatar = supplier.logo_url;
          }
        } else {
          // Current user is supplier, show buyer info
          const buyer = buyerMap.get(conv.buyer_id);
          if (buyer) {
            otherPartyName = buyer.full_name || 'Buyer';
            otherPartyAvatar = buyer.avatar_url;
          }
        }

        // Determine other party based on role
        if (conv.buyer_id === user.id) {
          // User is the buyer, show supplier
          const supplier = supplierMap.get(conv.supplier_id);
          if (supplier) {
            otherPartyName = supplier.company_name;
            otherPartyAvatar = supplier.logo_url;
          }
        } else if (supplierProfileId && conv.supplier_id === supplierProfileId) {
          // User is the supplier, show buyer
          const buyer = buyerMap.get(conv.buyer_id);
          if (buyer) {
            otherPartyName = buyer.full_name || 'Buyer';
            otherPartyAvatar = buyer.avatar_url;
          }
        }

        return {
          ...conv,
          other_party_name: otherPartyName,
          other_party_avatar: otherPartyAvatar,
          last_message: lastMessageMap.get(conv.id) || null,
          unread_count: unreadCountMap.get(conv.id) || 0,
        };
      });

      setConversations(enhancedConversations);
      
      // Calculate total unread
      const totalUnread = enhancedConversations.reduce((sum, c) => sum + c.unread_count, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, userRole]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async () => {
    if (!user || !conversationId) return;

    try {
      setLoading(true);

      // Fetch conversation details first
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();

      if (convError || !convData) {
        throw new Error('Conversation not found');
      }

      // Get other party details
      let otherPartyName = 'Unknown';
      let otherPartyAvatar: string | null = null;

      if (convData.buyer_id === user.id) {
        // User is buyer, get supplier info
        const { data: supplier } = await supabase
          .from('supplier_profiles')
          .select('company_name, logo_url')
          .eq('id', convData.supplier_id)
          .maybeSingle();
        if (supplier) {
          otherPartyName = supplier.company_name;
          otherPartyAvatar = supplier.logo_url;
        }
      } else {
        // User is supplier, get buyer info
        const { data: buyer } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', convData.buyer_id)
          .maybeSingle();
        if (buyer) {
          otherPartyName = buyer.full_name || 'Buyer';
          otherPartyAvatar = buyer.avatar_url;
        }
      }

      setConversationDetails({
        ...convData,
        other_party_name: otherPartyName,
        other_party_avatar: otherPartyAvatar,
        last_message: null,
        unread_count: 0,
      });

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(messagesData || []);

      // Mark unread messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, conversationId]);

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return { error: new Error('Invalid input') };

    try {
      setSending(true);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { data, error: null };
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setSending(false);
    }
  };

  // Start or get existing conversation with a supplier
  const startConversation = async (supplierId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to start a conversation',
        variant: 'destructive',
      });
      return { data: null, error: new Error('Not authenticated') };
    }

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('supplier_id', supplierId)
        .maybeSingle();

      if (existingConv) {
        return { data: existingConv, error: null };
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          supplier_id: supplierId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Conversation started',
        description: 'You can now send messages to this supplier',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          
          // Mark as read if it's from the other party
          if (newMessage.sender_id !== user.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  // Initial fetch based on context
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    } else {
      fetchConversations();
    }
  }, [conversationId, fetchMessages, fetchConversations]);

  return {
    conversations,
    messages,
    conversationDetails,
    loading,
    sending,
    unreadCount,
    sendMessage,
    startConversation,
    refetchConversations: fetchConversations,
    refetchMessages: fetchMessages,
  };
}
