
'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <img 
                src="https://static.readdy.ai/image/bb0d13c218f42a008c0d02bcafa2e2fe/8d1459ee78c57e6563140773fddfbd4c.png" 
                alt="MegaMarketplace Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Buy, Sell, and Save More — The Feature-Packed Marketplace with Low Fees, Big Deals, and Endless Possibilities
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#004080] cursor-pointer">
                <i className="ri-facebook-fill"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#004080] cursor-pointer">
                <i className="ri-twitter-fill"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#004080] cursor-pointer">
                <i className="ri-instagram-fill"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#004080] cursor-pointer">
                <i className="ri-youtube-fill"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Buyers</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/categories" className="hover:text-[#FFA500] cursor-pointer">Categories</Link></li>
              <li><Link href="/watchlist" className="hover:text-[#FFA500] cursor-pointer">My Watchlist</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/sell" className="hover:text-[#FFA500] cursor-pointer">Start Selling</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-[#FFA500] cursor-pointer">Seller Dashboard</Link></li>
              <li><Link href="/seller/store/create" className="hover:text-[#FFA500] cursor-pointer">Create Store</Link></li>
              <li><Link href="/seller/fees" className="hover:text-[#FFA500] cursor-pointer">Selling Fees</Link></li>
              <li><Link href="/help/selling" className="hover:text-[#FFA500] cursor-pointer">Seller Guide</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/support" className="text-gray-600 hover:text-[#004080] cursor-pointer">Support Center</Link></li>
              <li><Link href="/help" className="text-gray-600 hover:text-[#004080] cursor-pointer">Help & FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-[#004080] cursor-pointer">Contact Us</Link></li>
              <li><Link href="/returns" className="text-gray-600 hover:text-[#004080] cursor-pointer">Returns & Refunds</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400 mb-4 lg:mb-0">
              <Link href="/privacy" className="hover:text-[#FFA500] cursor-pointer">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#FFA500] cursor-pointer">Terms of Service</Link>
            </div>
            <div className="text-sm text-gray-400">
              2025 MegaMarketplace. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
