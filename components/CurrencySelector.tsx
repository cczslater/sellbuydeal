'use client';
import { useState } from 'react';

export default function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  const currentCurrency = currencies.find(c => c.code === selectedCurrency);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-700 hover:text-[#004080] cursor-pointer whitespace-nowrap"
      >
        <span className="text-sm font-medium">{currentCurrency?.symbol} {selectedCurrency}</span>
        <i className={`ri-arrow-down-s-line text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  setSelectedCurrency(currency.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                  selectedCurrency === currency.code ? 'bg-blue-50 text-[#004080]' : 'text-gray-700'
                }`}
              >
                <span>{currency.symbol} {currency.name}</span>
                {selectedCurrency === currency.code && (
                  <i className="ri-check-line text-[#004080]"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}