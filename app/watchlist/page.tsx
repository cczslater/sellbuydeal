'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] = useState([]);

  const removeFromWatchlist = (id: number) => {
    setWatchlistItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Watchlist</h1>
          <p className="text-gray-600">Keep track of items you're interested in</p>
        </div>
        
        {watchlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-heart-line text-4xl text-gray-400"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your watchlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding items you're interested in to keep track of them</p>
            <div className="space-x-4">
              <Link href="/browse" className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                Browse Items
              </Link>
              <Link href="/auctions" className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                View Auctions
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover object-top"
                  />
                  <button
                    onClick={() => removeFromWatchlist(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 cursor-pointer"
                  >
                    <i className="ri-heart-fill"></i>
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="text-xl font-bold text-[#004080] mb-2">
                    {item.price}
                  </div>
                  <p className="text-sm text-gray-600">{item.seller}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}