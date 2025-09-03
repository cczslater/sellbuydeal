
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

interface Message {
  id: number;
  sender: 'buyer' | 'seller';
  content: string;
  timestamp: string;
  type: 'text' | 'offer' | 'system';
  offer?: {
    amount: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

interface MessageCenterProps {
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  onClose: () => void;
}

export default function MessageCenter({ productTitle, productImage, sellerId, sellerName, onClose }: MessageCenterProps) {
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'system',
      content: 'Conversation started',
      timestamp: '2024-01-15 10:00',
      type: 'system'
    },
    {
      id: 2,
      sender: 'buyer',
      content: 'Hi! Is this item still available? Could you provide more details about the condition?',
      timestamp: '2024-01-15 10:05',
      type: 'text'
    },
    {
      id: 3,
      sender: 'seller',
      content: 'Yes, it\'s still available! The item is in excellent condition, barely used. I can provide additional photos if needed.',
      timestamp: '2024-01-15 10:12',
      type: 'text'
    },
    {
      id: 4,
      sender: 'buyer',
      content: 'Would you consider $950 for this item?',
      timestamp: '2024-01-15 10:15',
      type: 'offer',
      offer: {
        amount: '$950.00',
        status: 'pending'
      }
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now(),
      sender: 'buyer',
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const sendOffer = () => {
    if (!offerAmount || !user) return;

    const offer: Message = {
      id: Date.now(),
      sender: 'buyer',
      content: `Offer made: ${offerAmount}`,
      timestamp: new Date().toLocaleString(),
      type: 'offer',
      offer: {
        amount: offerAmount,
        status: 'pending'
      }
    };

    setMessages(prev => [...prev, offer]);
    setOfferAmount('');
    setShowOfferForm(false);
  };

  const handleOfferResponse = (messageId: number, status: 'accepted' | 'declined') => {
    if (!user) return;

    setMessages(prev => prev.map(msg => 
      msg.id === messageId && msg.offer
        ? { ...msg, offer: { ...msg.offer, status } }
        : msg
    ));
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-lock-line text-2xl text-red-600"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6">You need to be signed in to contact sellers</p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/login';
              }}
              className="flex-1 bg-[#004080] text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <img 
              src={productImage}
              alt={productTitle}
              className="w-12 h-12 object-cover object-top rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{productTitle}</h3>
              <p className="text-sm text-gray-600">with {sellerName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'system' ? (
                <div className="text-center w-full">
                  <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                    {message.content}
                  </span>
                </div>
              ) : message.type === 'offer' ? (
                <div className={`max-w-xs ${message.sender === 'buyer' ? 'bg-yellow-100' : 'bg-white border'} rounded-2xl p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="ri-hand-coin-line text-yellow-600"></i>
                    <span className="font-semibold text-gray-900">Offer Made</span>
                  </div>
                  <p className="text-2xl font-bold text-[#004080] mb-2">{message.offer?.amount}</p>
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
                <div className={`max-w-xs ${message.sender === 'buyer' ? 'bg-[#004080] text-white' : 'bg-gray-100'} rounded-2xl p-3`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'buyer' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t space-y-3">
          {showOfferForm ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Make an Offer</h4>
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                    disabled={!user}
                  />
                </div>
                <button
                  onClick={sendOffer}
                  disabled={!user}
                  className="bg-[#FFA500] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  Send Offer
                </button>
                <button
                  onClick={() => setShowOfferForm(false)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={user ? "Type your message..." : "Please sign in to send messages"}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!user}
                />
                <button
                  onClick={sendMessage}
                  disabled={!user}
                  className="w-10 h-10 bg-[#004080] text-white rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="ri-send-plane-line"></i>
                </button>
              </div>
              
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowOfferForm(true)}
                  disabled={!user}
                  className="text-[#FFA500] hover:text-orange-600 text-sm font-medium cursor-pointer flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="ri-hand-coin-line"></i>
                  <span>Make an Offer</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
