import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, formatDate } from '@/lib/utils';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const { 
    getConversations, 
    getMessages, 
    sendMessage, 
    markAsRead,
    simulateReply 
  } = useChatStore();

  const conversations = user ? getConversations(user.id) : [];
  const messages = activeConversation ? getMessages(activeConversation) : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (activeConversation && user) {
      markAsRead(activeConversation, user.id);
    }
  }, [activeConversation, user]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || !user) return;

    await sendMessage(activeConversation, user.id, messageInput);
    setMessageInput('');

    // Simulate reply from other user
    const conversation = conversations.find(c => c.id === activeConversation);
    if (conversation) {
      const otherUserId = conversation.participants.find(p => p !== user.id);
      if (otherUserId) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          simulateReply(activeConversation, otherUserId);
        }, 2000 + Math.random() * 2000);
      }
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversation);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-orange-600 transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {!activeConversation ? (
              // Conversations List
              <>
                <div className="p-4 bg-orange-500 text-white">
                  <h3 className="font-semibold text-lg">Messages</h3>
                  <p className="text-sm text-white/80">{conversations.length} conversations</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start a conversation from a villa page</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {conversations.map((conversation) => (
                        <motion.button
                          key={conversation.id}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                          onClick={() => setActiveConversation(conversation.id)}
                          className="w-full p-4 flex items-center text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conversation.otherUser?.avatar} />
                              <AvatarFallback className="bg-orange-100 text-orange-600">
                                {getInitials(conversation.otherUser?.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 truncate">
                                {conversation.otherUser?.name}
                              </h4>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className={`text-sm truncate ${
                                conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                              }`}>
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Chat View
              <>
                {/* Header */}
                <div className="p-4 bg-orange-500 text-white flex items-center">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="mr-3 hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activeConv?.otherUser?.avatar} />
                    <AvatarFallback className="bg-white text-orange-600">
                      {getInitials(activeConv?.otherUser?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <h4 className="font-medium">{activeConv?.otherUser?.name}</h4>
                    <p className="text-xs text-white/80">
                      {activeConv?.otherUser?.role === 'owner' ? 'Villa Owner' : 'Guest'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <p>No messages yet</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isMe = message.senderId === user.id;
                      const showTimestamp = index === 0 || 
                        new Date(message.timestamp).getDate() !== 
                        new Date(messages[index - 1].timestamp).getDate();

                      return (
                        <div key={message.id}>
                          {showTimestamp && (
                            <div className="text-center my-4">
                              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                                isMe
                                  ? 'bg-orange-500 text-white rounded-br-md'
                                  : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                              }`}
                            >
                              <p>{message.content}</p>
                              <span className={`text-xs mt-1 block ${
                                isMe ? 'text-white/70' : 'text-gray-400'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                                {isMe && message.isRead && (
                                  <span className="ml-1">✓✓</span>
                                )}
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
