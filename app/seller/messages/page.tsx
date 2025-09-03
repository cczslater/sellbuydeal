
'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';
import { getCurrentUser } from '../../../lib/auth';

interface Conversation {
  id: string;
  buyer_name: string;
  buyer_avatar: string;
  product_title: string;
  product_image: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'archived';
}

interface Message {
  id: string;
  sender: 'buyer' | 'seller';
  content: string;
  timestamp: string;
  type: 'text' | 'offer' | 'system';
  offer?: {
    amount: number;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export default function SellerMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        // In a real app, this would fetch from database
        // For now, showing empty state
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // In a real app, this would fetch messages from database
      // For demo purposes, showing sample messages
      const sampleMessages: Message[] = [
        {
          id: '1',
          sender: 'buyer',
          content: 'Hi! Is this item still available?',
          timestamp: '2024-01-15 10:00',
          type: 'text'
        },
        {
          id: '2',
          sender: 'seller',
          content: 'Yes, it\'s still available! Would you like more details?',
          timestamp: '2024-01-15 10:05',
          type: 'text'
        },
        {
          id: '3',
          sender: 'buyer',
          content: 'Would you consider $450 for this item?',
          timestamp: '2024-01-15 10:10',
          type: 'offer',
          offer: {
            amount: 450,
            status: 'pending'
          }
        }
      ];
      setMessages(sampleMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'seller',
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleOfferResponse = (messageId: string, status: 'accepted' | 'declined') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId && msg.offer
        ? { ...msg, offer: { ...msg.offer, status } }
        : msg
    ));
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeFilter === 'unread') return conv.unread_count > 0;
    if (activeFilter === 'archived') return conv.status === 'archived';
    return conv.status === 'active';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your messages...</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <SellerSidebar />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">Communicate with buyers and manage inquiries</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border h-[600px] flex">
            <div className="w-1/3 border-r flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Conversations</h3>
                  <div className="relative">
                    <select 
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm pr-8"
                    >
                      <option value="all">All</option>
                      <option value="unread">Unread</option>
                      <option value="archived">Archived</option>
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          loadMessages(conversation.id);
                        }}
                        className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={conversation.buyer_avatar}
                            alt={conversation.buyer_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 truncate">{conversation.buyer_name}</h4>
                              {conversation.unread_count > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{conversation.product_title}</p>
                            <p className="text-xs text-gray-500 mt-1">{conversation.last_message_time}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 truncate">{conversation.last_message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center p-6">
                    <div>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-message-2-line text-2xl text-gray-400"></i>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h4>
                      <p className="text-sm text-gray-600">
                        Messages from interested buyers will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-6 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedConversation.buyer_avatar}
                          alt={selectedConversation.buyer_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{selectedConversation.buyer_name}</h4>
                          <p className="text-sm text-gray-600">{selectedConversation.product_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <i className="ri-phone-line text-lg"></i>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <i className="ri-more-2-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                        {message.type === 'offer' ? (
                          <div className={`max-w-xs ${message.sender === 'seller' ? 'bg-blue-100' : 'bg-yellow-100'} rounded-2xl p-4`}>
                            <div className="flex items-center space-x-2 mb-2">
                              <i className="ri-hand-coin-line text-orange-600"></i>
                              <span className="font-semibold text-gray-900">Offer Made</span>
                            </div>
                            <p className="text-2xl font-bold text-[#004080] mb-2">${message.offer?.amount.toFixed(2)}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                message.offer?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                message.offer?.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {message.offer?.status}
                              </span>
                              {message.sender === 'buyer' && message.offer?.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleOfferResponse(message.id, 'accepted')}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleOfferResponse(message.id, 'declined')}
                                    className="text-xs bg-red-600 text-white px-2 py-1 rounded cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
                          </div>
                        ) : (
                          <div className={`max-w-xs ${message.sender === 'seller' ? 'bg-[#004080] text-white' : 'bg-gray-100'} rounded-2xl p-3`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.sender === 'seller' ? 'text-blue-200' : 'text-gray-500'}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-6 border-t">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <button className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                        <i className="ri-attachment-line text-lg"></i>
                      </button>
                      <button
                        onClick={sendMessage}
                        className="w-10 h-10 bg-[#004080] text-white rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer"
                      >
                        <i className="ri-send-plane-line"></i>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-chat-3-line text-3xl text-gray-400"></i>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h4>
                    <p className="text-gray-600">Choose a conversation from the left to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
