import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Conversation, Message } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import {
  MessageSquare,
  Send,
  Home,
  ShieldCheck,
  Search,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvId = searchParams.get('conv');

  const [inputMessage, setInputMessage] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const { data: convsData, refetch: refetchConvs } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const res = await api.get('/chat/conversations');
      return res.data.conversations as Conversation[];
    },
    enabled: !!user
  });

  const conversations = convsData || [];

  useEffect(() => {
    if (convsData && conversations.length > 0) {
      if (!activeConvId || !conversations.some((c) => c.id === activeConvId)) {
        setSearchParams({ conv: conversations[0].id });
      }
    } else if (convsData && conversations.length === 0 && activeConvId) {
      setSearchParams({});
    }
  }, [activeConvId, convsData, conversations, setSearchParams]);

  useEffect(() => {
    if (!socket) return;
    const handleGlobalNewMessage = () => {
      refetchConvs();
    };
    socket.on('new_message', handleGlobalNewMessage);
    return () => {
      socket.off('new_message', handleGlobalNewMessage);
    };
  }, [socket, refetchConvs]);

  const handleStartChatWithUser = async (targetUserId: string) => {
    try {
      const res = await api.post('/chat/conversations', { targetUserId });
      setSearchParams({ conv: res.data.conversation.id });
      refetchConvs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not start conversation');
    }
  };

  const { data: activeConvData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: async () => {
      if (!activeConvId) return null;
      try {
        const res = await api.get(`/chat/conversations/${activeConvId}/messages`);
        return res.data as { conversation: Conversation; messages: Message[] };
      } catch (err: any) {
        if (err.response?.status === 404) {
          setSearchParams({});
        }
        return null;
      }
    },
    enabled: !!activeConvId
  });

  useEffect(() => {
    if (!socket || !activeConvId) return;

    socket.emit('join_conversation', activeConvId);
    console.log('🔌 Joining conversation room:', activeConvId);

    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.conversationId === activeConvId) {
        queryClient.setQueryData(['messages', activeConvId], (oldData: any) => {
          if (!oldData) return { conversation: activeConversation, messages: [newMsg] };
          const existingMessages = oldData.messages || [];
          if (existingMessages.some((m: any) => m.id === newMsg.id)) {
            return oldData;
          }
          return {
            ...oldData,
            messages: [...existingMessages, newMsg]
          };
        });
      }
      refetchConvs();
    };

    const handleUserTyping = (data: { conversationId: string; userName: string }) => {
      if (data.conversationId === activeConvId) {
        setTypingUser(data.userName);
      }
    };

    const handleUserStopTyping = (data: { conversationId: string }) => {
      if (data.conversationId === activeConvId) {
        setTypingUser(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.emit('leave_conversation', activeConvId);
    };
  }, [socket, activeConvId, queryClient, refetchConvs]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeConvData?.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (socket && activeConvId && user) {
      socket.emit('typing_start', {
        conversationId: activeConvId,
        userName: user.firstName,
        userId: user.id
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', {
          conversationId: activeConvId,
          userId: user.id
        });
      }, 1500);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || !activeConvId || !user) return;

    setInputMessage('');

    try {
      if (socket) {
        socket.emit('typing_stop', { conversationId: activeConvId, userId: user.id });
      }

      const res = await api.post(`/chat/conversations/${activeConvId}/messages`, {
        content: textToSend
      });

      const savedMsg = res.data.message;

      queryClient.setQueryData(['messages', activeConvId], (oldData: any) => {
        if (!oldData) return { conversation: activeConversation, messages: [savedMsg] };
        const existingMessages = oldData.messages || [];
        if (existingMessages.some((m: any) => m.id === savedMsg.id)) {
          return oldData;
        }
        return {
          ...oldData,
          messages: [...existingMessages, savedMsg]
        };
      });

      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);

      refetchConvs();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert('Could not deliver message: ' + (err.response?.data?.message || err.message));
    }
  };

  const activeConversation = activeConvData?.conversation || conversations.find((c) => c.id === activeConvId);
  const messages = activeConvData?.messages || [];

  const filteredConversations = conversations.filter((c) => {
    const name = `${c.otherUser?.firstName} ${c.otherUser?.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden h-[780px] flex flex-col md:flex-row">

        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col bg-slate-50/50 ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200/80 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-slate-900">Messages</h2>
              <span className="text-[11px] font-semibold text-slate-400">
                {conversations.length} chats
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 text-xs text-slate-800 focus:outline-none font-medium"
              />
            </div>
          </div>

          {onlineUsers.filter((ou) => ou.userId !== user?.id).length > 0 && (
            <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Logged In Now ({onlineUsers.filter((ou) => ou.userId !== user?.id).length})
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {onlineUsers
                  .filter((ou) => ou.userId !== user?.id)
                  .map((ou) => (
                    <button
                      key={ou.userId}
                      onClick={() => handleStartChatWithUser(ou.userId)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-emerald-200/80 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all flex-shrink-0 group"
                      title={`Chat with ${ou.name}`}
                    >
                      <div className="relative">
                        <UserAvatar avatar={ou.avatar} name={ou.name} size="xs" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate group-hover:text-emerald-700">
                        {ou.name}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active conversations
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === activeConvId;
                const isOnline = c.otherUser?.id ? isUserOnline(c.otherUser.id) : false;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSearchParams({ conv: c.id })}
                    className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-white shadow-card border border-slate-200/80'
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <UserAvatar
                        avatar={c.otherUser?.avatar}
                        name={`${c.otherUser?.firstName || ''} ${c.otherUser?.lastName || ''}`}
                        size="md"
                      />
                      {isOnline ? (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" title="Online now" />
                      ) : (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-300 ring-2 ring-white" title="Offline" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{c.otherUser?.firstName} {c.otherUser?.lastName}</span>
                          {isOnline && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate">
                        {c.lastMessage?.content || 'Started conversation'}
                      </p>

                      {c.property && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-brand-700 font-medium">
                          <Home className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{c.property.title}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>

        <div className={`flex-1 flex flex-col bg-white ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSearchParams({})}
                    className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <UserAvatar
                      avatar={activeConversation.otherUser?.avatar}
                      name={`${activeConversation.otherUser?.firstName || ''} ${activeConversation.otherUser?.lastName || ''}`}
                      size="md"
                    />
                    {activeConversation.otherUser?.id && isUserOnline(activeConversation.otherUser.id) ? (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                    ) : (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-300 ring-2 ring-white" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {activeConversation.otherUser?.firstName} {activeConversation.otherUser?.lastName}
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    </h3>
                    {activeConversation.otherUser?.id && isUserOnline(activeConversation.otherUser.id) ? (
                      <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Online & Active Now
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-medium">Offline</p>
                    )}
                  </div>
                </div>

                {activeConversation.property && (
                  <Link
                    to={`/properties/${activeConversation.property.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold hover:bg-brand-100 transition-colors"
                  >
                    <Home className="w-3.5 h-3.5 text-brand-600" />
                    <span className="max-w-[150px] truncate">{activeConversation.property.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
                {messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <UserAvatar
                          avatar={m.sender?.avatar}
                          name={m.sender?.firstName}
                          size="sm"
                          className="mb-1"
                        />
                      )}

                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-brand-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        <p>{m.content}</p>
                        <span
                          className={`block text-[9px] mt-1 ${
                            isMe ? 'text-brand-100 text-right' : 'text-slate-400 text-left'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {typingUser && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                    <span>{typingUser} is typing...</span>
                  </div>
                )}
              </div>

              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Quick:</span>
                {[
                  'Is this room available?',
                  'Can I visit this Saturday 11 AM?',
                  'Are utilities included in rent?',
                  'Can we schedule a call?'
                ].map((text) => (
                  <button
                    key={text}
                    onClick={() => handleSendMessage(undefined, text)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-[11px] whitespace-nowrap transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-brand-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No Conversation Selected</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Pick a conversation from the left or message a landlord from any property listing.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
