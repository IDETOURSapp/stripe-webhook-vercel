import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages, useSendMessage } from '../hooks/useConversations';
import { useAuth } from '../contexts/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { supabase } from '../config/supabase';

const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: messages, isLoading } = useMessages(conversationId!);
  const sendMessage = useSendMessage();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

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
          // This would trigger a refetch in a real implementation
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => {
          const isOwnMessage = message.sender_id === user?.id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;