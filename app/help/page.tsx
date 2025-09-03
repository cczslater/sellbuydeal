'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const helpCategories = [
    {
      title: 'Buying',
      icon: 'ri-shopping-cart-line',
      description: 'Learn how to buy items safely',
      articles: [
        { title: 'How to place an order', href: '#buying-order' },
        { title: 'Payment methods', href: '#buying-payment' },
        { title: 'Tracking your order', href: '#buying-tracking' },
        { title: 'Returns and refunds', href: '#buying-returns' }
      ]
    },
    {
      title: 'Selling',
      icon: 'ri-store-line',
      description: 'Start selling your items',
      articles: [
        { title: 'Create your first listing', href: '/sell' },
        { title: 'Set competitive prices', href: '#selling-pricing' },
        { title: 'Manage your inventory', href: '#selling-inventory' },
        { title: 'Handle customer inquiries', href: '#selling-inquiries' }
      ]
    },
    {
      title: 'Auctions',
      icon: 'ri-hammer-line',
      description: 'Participate in live auctions',
      articles: [
        { title: 'How bidding works', href: '#auction-bidding' },
        { title: 'Auction types explained', href: '#auction-types' },
        { title: 'Winning strategies', href: '#auction-strategies' },
        { title: 'Payment for won auctions', href: '#auction-payment' }
      ]
    },
    {
      title: 'Account & Security',
      icon: 'ri-shield-check-line',
      description: 'Protect your account',
      articles: [
        { title: 'Account verification', href: '#account-verification' },
        { title: 'Two-factor authentication', href: '#account-2fa' },
        { title: 'Privacy settings', href: '#account-privacy' },
        { title: 'Report suspicious activity', href: '#account-report' }
      ]
    }
  ];

  const faqData = {
    buying: [
      {
        id: 'buying-order',
        question: 'How to place an order',
        answer: 'To place an order: 1) Browse products and click on the item you want. 2) Review product details, shipping info, and seller ratings. 3) Click "Add to Cart" or "Buy Now". 4) Enter your shipping address and payment method. 5) Review your order and click "Place Order". You\'ll receive a confirmation email with tracking information.'
      },
      {
        id: 'buying-payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely through our encrypted payment system. Your payment information is never stored on our servers.'
      },
      {
        id: 'buying-tracking',
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by: 1) Logging into your account and clicking "My Orders". 2) Entering your tracking number on our tracking page. 3) Most orders are delivered within 3-7 business days depending on your location.'
      },
      {
        id: 'buying-returns',
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for most items. Returns are accepted if: 1) Item is unused and in original packaging. 2) Return is initiated within 30 days of delivery. 3) Item is not personalized or custom-made. To start a return, go to "My Orders" and click "Return Item". Return shipping is free for defective items.'
      }
    ],
    selling: [
      {
        id: 'selling-pricing',
        question: 'How do I set competitive prices?',
        answer: 'To set competitive prices: 1) Research similar items on our platform and other marketplaces. 2) Consider your item\'s condition, age, and rarity. 3) Factor in shipping costs and marketplace fees. 4) Use our suggested pricing tool for guidance. 5) Start slightly higher and adjust based on interest. Remember, competitive pricing increases your chances of a quick sale.'
      },
      {
        id: 'selling-inventory',
        question: 'How do I manage my inventory?',
        answer: 'Manage your inventory through the Seller Dashboard: 1) View all your active listings in one place. 2) Update prices, quantities, and descriptions easily. 3) Set up automatic relisting for expired items. 4) Track which items are getting views and watchers. 5) Use bulk editing tools for multiple items. Keep your inventory updated to avoid overselling.'
      },
      {
        id: 'selling-inquiries',
        question: 'How do I handle customer inquiries?',
        answer: 'Handle customer inquiries professionally: 1) Respond to messages within 24 hours. 2) Be honest about item condition and shipping times. 3) Provide additional photos if requested. 4) Use our message templates for common questions. 5) Offer bundle deals for multiple purchases. Good communication leads to positive reviews and repeat customers.'
      }
    ],
    auctions: [
      {
        id: 'auction-bidding',
        question: 'How does bidding work?',
        answer: 'Auction bidding is straightforward: 1) Find an auction item you want. 2) Enter your maximum bid amount. 3) Our system will automatically bid for you up to your maximum. 4) If someone outbids you, you\'ll be notified. 5) The highest bidder when the auction ends wins. Always bid only what you\'re willing to pay, including shipping costs.'
      },
      {
        id: 'auction-types',
        question: 'What types of auctions do you have?',
        answer: 'We offer several auction types: 1) Standard Auctions - traditional highest bid wins format. 2) Reserve Auctions - seller sets a minimum price that must be met. 3) Buy It Now Auctions - option to purchase immediately at a fixed price. 4) Penny Auctions - bids increase the price by small amounts. Each type has different strategies and rules.'
      },
      {
        id: 'auction-strategies',
        question: 'What are good bidding strategies?',
        answer: 'Effective bidding strategies include: 1) Set a maximum budget and stick to it. 2) Bid in the final minutes to avoid bidding wars. 3) Research the item\'s value beforehand. 4) Factor in shipping costs and taxes. 5) Watch multiple similar auctions. 6) Don\'t get emotional - stay rational about pricing. Remember, there will always be other opportunities.'
      },
      {
        id: 'auction-payment',
        question: 'How do I pay for won auctions?',
        answer: 'Payment for won auctions: 1) You\'ll receive a payment invoice immediately after winning. 2) Payment is due within 3 days of auction end. 3) Use the same payment methods as regular purchases. 4) Some sellers may offer payment plans for high-value items. 5) Item ships once payment is confirmed. Failure to pay may result in account restrictions.'
      }
    ],
    account: [
      {
        id: 'account-verification',
        question: 'How do I verify my account?',
        answer: 'Account verification increases trust and unlocks features: 1) Go to Account Settings > Verification. 2) Upload a clear photo of your government-issued ID. 3) Provide proof of address (utility bill or bank statement). 4) For sellers, add business registration if applicable. 5) Verification typically takes 1-3 business days. Verified accounts get better visibility and higher buyer confidence.'
      },
      {
        id: 'account-2fa',
        question: 'How do I enable two-factor authentication?',
        answer: 'Enable 2FA for better security: 1) Go to Account Settings > Security. 2) Click "Enable Two-Factor Authentication". 3) Scan the QR code with an authenticator app (Google Authenticator, Authy). 4) Enter the 6-digit code from your app. 5) Save your backup codes in a safe place. You\'ll need to enter a code from your phone each time you log in.'
      },
      {
        id: 'account-privacy',
        question: 'How can I control my privacy settings?',
        answer: 'Manage your privacy in Account Settings: 1) Control who can see your profile and activity. 2) Choose whether to show your real name or username. 3) Set email notification preferences. 4) Control targeted advertising settings. 5) Manage what information is shared with sellers/buyers. 6) You can also request to download or delete your personal data.'
      },
      {
        id: 'account-report',
        question: 'How do I report suspicious activity?',
        answer: 'Report suspicious activity immediately: 1) Use the "Report" button on listings or messages. 2) Contact our support team with details. 3) Provide screenshots as evidence. 4) Never share personal or financial information outside our platform. 5) Be wary of deals that seem too good to be true. We investigate all reports within 24 hours and take appropriate action.'
      }
    ]
  };

  const popularTopics = [
    { title: 'How to return an item', category: 'buying', id: 'buying-returns' },
    { title: 'Tracking my order', category: 'buying', id: 'buying-tracking' },
    { title: 'Payment not processed', category: 'buying', id: 'buying-payment' },
    { title: 'Change shipping address', category: 'account', id: 'account-verification' },
    { title: 'Cancel my order', category: 'buying', id: 'buying-order' },
    { title: 'Seller not responding', category: 'selling', id: 'selling-inquiries' }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setExpandedFaq(id);
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-gray-600 mb-8">Find answers to common questions and get support</p>
          
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#004080] text-lg"
            />
            <button className="absolute right-2 top-2 w-12 h-12 bg-[#004080] rounded-full flex items-center justify-center text-white hover:bg-blue-700 cursor-pointer">
              <i className="ri-search-line"></i>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#004080] rounded-full flex items-center justify-center mb-4">
                <i className={`${category.icon} text-2xl text-white`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="space-y-2">
                {category.articles.map((article, idx) => (
                  <Link 
                    key={idx} 
                    href={article.href}
                    onClick={article.href.startsWith('#') ? (e) => {
                      e.preventDefault();
                      scrollToSection(article.href.substring(1));
                    } : undefined}
                    className="block text-sm text-[#004080] hover:text-blue-700 cursor-pointer"
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8 mb-12">
          {Object.entries(faqData).map(([category, faqs]) => (
            <div key={category} className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">{category} FAQ</h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} id={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                      <i className={`ri-arrow-${expandedFaq === faq.id ? 'up' : 'down'}-s-line text-gray-400`}></i>
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(topic.id)}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer text-left"
              >
                <i className="ri-question-line text-[#004080]"></i>
                <span className="text-gray-900">{topic.title}</span>
                <i className="ri-arrow-right-s-line text-gray-400 ml-auto"></i>
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Still need help?</h3>
          <div className="flex justify-center space-x-4">
            <Link href="/contact" className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
              Contact Support
            </Link>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap">
              Live Chat
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}