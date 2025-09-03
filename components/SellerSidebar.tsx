
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '../lib/auth';
import { getUserStore } from '../lib/database';

export default function SellerSidebar() {
  const pathname = usePathname();
  const [userStore, setUserStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/seller/dashboard',
      icon: 'ri-dashboard-line',
      current: pathname === '/seller/dashboard',
    },
    {
      name: 'Listings',
      href: '/seller/listings',
      icon: 'ri-list-check',
      current: pathname === '/seller/listings',
    },
    {
      name: 'Orders',
      href: '/seller/orders',
      icon: 'ri-shopping-cart-line',
      current: pathname === '/seller/orders',
    },
    {
      name: 'Messages',
      href: '/seller/messages',
      icon: 'ri-message-3-line',
      current: pathname === '/seller/messages',
    },
    {
      name: 'Analytics',
      href: '/seller/analytics',
      icon: 'ri-line-chart-line',
      current: pathname === '/seller/analytics',
    },
    {
      name: 'Earnings',
      href: '/seller/earnings',
      icon: 'ri-money-dollar-circle-line',
      current: pathname === '/seller/earnings',
    },
    {
      name: 'Import Listings',
      href: '/seller/import',
      icon: 'ri-download-cloud-line',
      current: pathname === '/seller/import',
    },
    {
      name: 'My Store',
      href: '/seller/store',
      icon: 'ri-store-line',
      current: pathname === '/seller/store',
    },
    {
      name: 'Promote',
      href: '/seller/promote',
      icon: 'ri-megaphone-line',
      current: pathname === '/seller/promote',
    },
    {
      name: 'Settings',
      href: '/seller/settings',
      icon: 'ri-settings-3-line',
      current: pathname === '/seller/settings',
    },
  ];

  useEffect(() => {
    loadUserStore();
  }, []);

  const loadUserStore = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const store = await getUserStore(user.id);
        setUserStore(store);
      }
    } catch (error) {
      console.error('Error loading user store:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-[#004080] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {loading ? 'L' : userStore?.store_name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {loading ? 'Loading...' : userStore?.store_name || 'No Store Yet'}
            </h3>
            <p className="text-sm text-gray-600">
              {loading ? '...' : userStore ? 'Verified Seller' : 'Create Store'}
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer whitespace-nowrap ${
                  item.current
                    ? 'bg-[#004080] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
