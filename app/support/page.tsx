
'use client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../components/AuthProvider';
import Link from 'next/link';

interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  message: string;
  priority: 'low' | 'standard' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  assigned_to?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  last_reply?: string;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'agent';
  message: string;
  timestamp: string;
  agent_name?: string;
}

export default function SupportPage() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Live Chat States
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatConnected, setChatConnected] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [agentInfo, setAgentInfo] = useState({
    name: 'Sarah Wilson',
    status: 'online',
    avatar: 'SW'
  });

  // Form states
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'standard' as 'low' | 'standard' | 'high' | 'critical',
    category: '',
    attachments: [] as File[]
  });

  const categories = [
    'Account Issues',
    'Payment & Billing',
    'Technical Problems',
    'Listing Issues',
    'Seller Support',
    'Buyer Protection',
    'Platform Features',
    'Bug Report',
    'Feature Request',
    'Other'
  ];

  useEffect(() => {
    if (user) {
      loadUserTickets();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Initialize chat when opened
  useEffect(() => {
    if (showLiveChat && chatMessages.length === 0) {
      initializeChat();
    }
  }, [showLiveChat]);

  const loadUserTickets = async () => {
    try {
      // Mock data for demonstration
      const mockTickets: SupportTicket[] = [
        {
          id: 1,
          ticket_number: 'TK-2024-001',
          subject: 'Unable to upload product images',
          message: "I'm having trouble uploading images to my product listing. The upload button doesn't seem to work.",
          priority: 'high',
          status: 'in_progress',
          category: 'Technical Problems',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          last_reply: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          ticket_number: 'TK-2024-002',
          subject: 'Payment not processed',
          message: 'My payment was deducted but the order status shows as pending. Please help.',
          priority: 'critical',
          status: 'open',
          category: 'Payment & Billing',
          created_at: '2024-01-14T16:20:00Z',
          updated_at: '2024-01-14T16:20:00Z'
        },
        {
          id: 3,
          ticket_number: 'TK-2024-003',
          subject: 'Account verification issue',
          message: 'I submitted my documents for verification but haven\'t heard back in 3 days.',
          priority: 'standard',
          status: 'resolved',
          category: 'Account Issues',
          created_at: '2024-01-12T09:15:00Z',
          updated_at: '2024-01-13T11:45:00Z',
          last_reply: '2024-01-13T11:45:00Z'
        }
      ];
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeChat = () => {
    setChatConnected(true);
    const welcomeMessage: ChatMessage = {
      id: 1,
      sender: 'agent',
      message: `Hello${user?.email ? ` ${profile?.first_name || 'there'}` : ''}! I'm Sarah from the support team. How can I help you today?`,
      timestamp: new Date().toISOString(),
      agent_name: 'Sarah Wilson'
    };
    setChatMessages([welcomeMessage]);
  };

  const handleStartChat = () => {
    if (!user) {
      alert('Please sign in to start a live chat with our support team.');
      return;
    }
    setShowLiveChat(true);
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !chatConnected) return;

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate typing indicator
    setTypingIndicator(true);

    // Simulate agent response
    setTimeout(() => {
      setTypingIndicator(false);
      const agentResponse = generateAgentResponse(userMessage.message);
      const agentMessage: ChatMessage = {
        id: chatMessages.length + 2,
        sender: 'agent',
        message: agentResponse,
        timestamp: new Date().toISOString(),
        agent_name: agentInfo.name
      };
      setChatMessages(prev => [...prev, agentMessage]);
    }, 1500 + Math.random() * 1000);
  };

  const generateAgentResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('payment') || message.includes('billing') || message.includes('refund')) {
      return "I understand you're having payment-related concerns. Let me help you with that. Can you please provide your order number or transaction ID? I'll look into the payment status for you.";
    }

    if (message.includes('upload') || message.includes('image') || message.includes('photo')) {
      return "I see you're having trouble uploading images. This is usually caused by file size or format issues. Please make sure your images are in JPG, PNG, or WEBP format and under 10MB each. Have you tried clearing your browser cache?";
    }

    if (message.includes('account') || message.includes('verification') || message.includes('login')) {
      return "Account issues can be frustrating. I'm here to help! Can you tell me more about the specific problem you're experiencing? Are you having trouble logging in or is it related to account verification?";
    }

    if (message.includes('seller') || message.includes('listing') || message.includes('product')) {
      return "I'd be happy to help with your seller-related question! Whether it's about creating listings, managing products, or seller features, I can guide you through it. What specifically would you like assistance with?";
    }

    if (message.includes('thank') || message.includes('thanks')) {
      return "You're very welcome! I'm glad I could help. Is there anything else you'd like assistance with today? I'm here whenever you need support.";
    }

    if (message.includes('bye') || message.includes('goodbye')) {
      return "Thank you for chatting with us today! If you need any further assistance, don't hesitate to reach out. Have a great day! 😊";
    }

    // Default responses
    const responses = [
      "Thank you for reaching out! I understand your concern. Can you provide more details about the issue so I can assist you better?",
      "I'm here to help! Let me look into this for you. Could you please share any error messages or specific details about what you're experiencing?",
      "I see what you're asking about. This is definitely something we can resolve together. Can you walk me through the steps you've already tried?",
      "Thanks for bringing this to my attention. I want to make sure we get this resolved for you quickly. Let me ask a few questions to better understand the situation."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !ticketForm.subject || !ticketForm.message || !ticketForm.category) return;

    try {
      // In a real app, this would submit to your backend
      const newTicket: SupportTicket = {
        id: Date.now(),
        ticket_number: `TK-2024-${String(tickets.length + 1).padStart(3, '0')}`,
        subject: ticketForm.subject,
        message: ticketForm.message,
        priority: ticketForm.priority,
        status: 'open',
        category: ticketForm.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTickets(prev => [newTicket, ...prev]);
      setTicketForm({
        subject: '',
        message: '',
        priority: 'standard',
        category: '',
        attachments: []
      });
      setShowNewTicketForm(false);

      alert('Your support ticket has been submitted successfully! We\'ll get back to you soon.');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTicketForm(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const removeAttachment = (index: number) => {
    setTicketForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'standard': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-purple-600 bg-purple-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'open') return ['open', 'in_progress'].includes(ticket.status);
    if (activeFilter === 'resolved') return ['resolved', 'closed'].includes(ticket.status);
    return ticket.priority === activeFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-customer-service-line text-2xl text-blue-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Center Access</h2>
            <p className="text-gray-600 mb-6">Please sign in to access support tickets and submit new requests</p>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/login" className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                Sign In
              </Link>
              <Link href="/register" className="border border-[#004080] text-[#004080] px-6 py-3 rounded-lg font-medium hover:bg-blue-50 cursor-pointer whitespace-nowrap">
                Create Account
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#004080] to-blue-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Support Center</h1>
              <p className="text-blue-100 mb-4">Get help with your marketplace experience</p>
              <div className="flex items-center space-x-6">
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">Total Tickets: {tickets.length}</span>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">
                    Open: {tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => setShowNewTicketForm(true)}
                className="bg-white text-[#004080] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 cursor-pointer whitespace-nowrap flex items-center space-x-2"
              >
                <i className="ri-add-line"></i>
                <span>New Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-question-line text-xl text-blue-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
            <p className="text-gray-600 text-sm mb-4">Find quick answers to common questions</p>
            <Link href="/help" className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer">
              Browse FAQ →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-chat-3-line text-xl text-green-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-4">Chat with our support team instantly</p>
            <button
              onClick={handleStartChat}
              className="text-green-600 hover:text-green-700 font-medium text-sm cursor-pointer"
            >
              Start Chat →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-book-line text-xl text-purple-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Guide</h3>
            <p className="text-gray-600 text-sm mb-4">Learn how to use our platform</p>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm cursor-pointer">
              View Guide →
            </button>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Support Tickets</h3>
              <button
                onClick={() => setShowNewTicketForm(true)}
                className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap flex items-center space-x-2"
              >
                <i className="ri-add-line"></i>
                <span>New Ticket</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              {['all', 'open', 'resolved', 'critical', 'high', 'standard', 'low'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-[#004080] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                        <span className="text-sm text-gray-500">#{ticket.ticket_number}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{ticket.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <i className="ri-folder-line"></i>
                          <span>{ticket.category}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <i className="ri-time-line"></i>
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </span>
                        {ticket.last_reply && (
                          <span className="flex items-center space-x-1">
                            <i className="ri-reply-line"></i>
                            <span>Last reply: {new Date(ticket.last_reply).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/support/ticket/${ticket.id}`}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      {ticket.status === 'closed' && (
                        <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 cursor-pointer whitespace-nowrap">
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-ticket-line text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {activeFilter === 'all' ? 'No support tickets yet' : `No ${activeFilter} tickets found`}
                </h4>
                <p className="text-gray-600 mb-6">
                  {activeFilter === 'all'
                    ? 'Create your first support ticket if you need help'
                    : `Try adjusting your filter to see more tickets`}
                </p>
                {activeFilter === 'all' && (
                  <button
                    onClick={() => setShowNewTicketForm(true)}
                    className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Create First Ticket
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Chat Modal */}
      {showLiveChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-sm">{agentInfo.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{agentInfo.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span className="text-xs text-green-100">Online • Typically replies instantly</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowLiveChat(false)}
                  className="text-white hover:text-green-200 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#004080] text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {typingIndicator && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">{agentInfo.name} is typing</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!newMessage.trim() || !chatConnected}
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer whitespace-nowrap ${
                    newMessage.trim() && chatConnected
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <i className="ri-send-plane-line"></i>
                </button>
              </div>

              {/* Chat Status */}
              <div className="flex items-center justify-center mt-2">
                {chatConnected ? (
                  <span className="flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Connected • Secure chat
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Connecting...
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t p-4 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Account help',
                  'Payment issue',
                  'Technical support',
                  'Seller question'
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setNewMessage(action);
                      setTimeout(() => sendChatMessage(), 100);
                    }}
                    className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Submit New Support Ticket</h3>
                <button
                  onClick={() => setShowNewTicketForm(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="standard">Standard</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue in detail. Include any relevant information that might help us assist you."
                    rows={6}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] resize-none"
                    required
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {ticketForm.message.length}/500 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-upload-cloud-line text-xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-600 mb-1">Click to upload files</p>
                      <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB each</p>
                    </label>
                  </div>

                  {ticketForm.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {ticketForm.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <i className="ri-file-line text-gray-400"></i>
                            <span className="text-sm text-gray-600">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <i className="ri-information-line text-blue-600 mt-0.5"></i>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Before submitting</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Check our FAQ for quick answers</li>
                        <li>• Include screenshots or files if relevant</li>
                        <li>• Provide detailed steps to reproduce the issue</li>
                        <li>• You'll receive email notifications for replies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#004080] text-white py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
