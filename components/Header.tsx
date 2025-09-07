
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { getWebsiteSettings, WebsiteSettings } from '../lib/admin-settings';
import WishlistMatchNotifier from './WishlistMatchNotifier';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile, loading, signOut } = useAuth();

  // Load website settings to apply admin configurations
  useEffect(() => {
    const loadWebsiteSettings = async () => {
      try {
        const settings = await getWebsiteSettings();
        setWebsiteSettings(settings);
      } catch (error) {
        console.error('Error loading website settings:', error);
      }
    };

    loadWebsiteSettings();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const primaryColor = websiteSettings?.primaryColor || '#004080';

  return (
    <header className="bg-white shadow-sm border-b w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
import Logo from '../public/sbdlogorsz1.png';
<Link href="/" className="flex items-center">
  <img 
    src="/sbdlogorsz1.png" 
    alt="SellbuyDeal Logo" 
    className="h-10 w-auto"
  />
</Link>




            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/browse" className="text-gray-700 hover:text-[#004080] transition-colors cursor-pointer">
                Browse
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-[#004080] transition-colors cursor-pointer">
                Categories
              </Link>
              <Link href="/classifieds" className="text-gray-700 hover:text-[#004080] transition-colors cursor-pointer">
                Classifieds
              </Link>
              <Link href="/sell" className="text-gray-700 hover:text-[#004080] transition-colors cursor-pointer">
                Sell
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/support" className="text-gray-700 hover:text-[#004080] font-medium cursor-pointer">
              Support
            </Link>
            <Link href="/help" className="text-gray-700 hover:text-[#004080] font-medium cursor-pointer">
              Help
            </Link>
            <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-full px-4 py-2">
              <i className="ri-search-line text-gray-500"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anything..."
                className="bg-transparent outline-none text-sm flex-1 min-w-[200px]"
              />
            </form>

            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/sell"
                  className="text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sell Now
                </Link>

                <Link href="/cart" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                  <i className="ri-shopping-cart-line text-xl"></i>
                </Link>

                <WishlistMatchNotifier />
                <Link href="/wishlist" className="p-2 text-gray-600 hover:text-[#004080] cursor-pointer">
                  <i className="ri-heart-line text-xl"></i>
                </Link>

                <Link href="/watchlist" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                  <i className="ri-bookmark-line text-xl"></i>
                </Link>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 cursor-pointer"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {profile?.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden md:block font-medium">
                      {profile ? `${profile.first_name} ${profile.last_name}` : user.email?.split('@')[0]}
                    </span>
                    <i className="ri-arrow-down-s-line"></i>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {profile ? `${profile.first_name} ${profile.last_name}` : user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        {profile && (
                          <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                            {profile.account_type}
                          </span>
                        )}
                      </div>

                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-user-line mr-2"></i>
                        My Account
                      </Link>

                      {profile?.account_type === 'seller' && (
                        <Link
                          href="/seller/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <i className="ri-dashboard-line mr-2"></i>
                          Seller Dashboard
                        </Link>
                      )}

                      <Link
                        href="/help"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-question-line mr-2"></i>
                        Help & Support
                      </Link>

                      <div className="border-t mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                        >
                          <i className="ri-logout-box-line mr-2"></i>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-[#004080] font-medium cursor-pointer transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 cursor-pointer whitespace-nowrap transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              className="md:hidden cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-4 py-2">
                <i className="ri-search-line text-gray-500"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="bg-transparent outline-none text-sm flex-1"
                />
              </div>
            </form>
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Home
              </Link>
              <Link href="/browse" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Browse
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Categories
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
