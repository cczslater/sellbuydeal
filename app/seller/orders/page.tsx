
'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';
import Link from 'next/link';
import { getCurrentUser } from '../../../lib/auth';

interface Order {
  id: string;
  order_number: string;
  buyer_name: string;
  buyer_email: string;
  product_title: string;
  product_image: string;
  quantity: number;
  price: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  shipping_address: string;
  order_date: string;
  tracking_number?: string;
}

export default function SellerOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const tabs = [
    { id: 'all', label: 'All Orders', count: 0 },
    { id: 'pending', label: 'Pending', count: 0 },
    { id: 'processing', label: 'Processing', count: 0 },
    { id: 'shipped', label: 'Shipped', count: 0 },
    { id: 'delivered', label: 'Delivered', count: 0 },
    { id: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        // In a real app, this would fetch from database
        // For now, showing empty state
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: 'ri-time-line',
      processing: 'ri-loader-line',
      shipped: 'ri-truck-line',
      delivered: 'ri-checkbox-circle-line',
      cancelled: 'ri-close-circle-line'
    };
    return icons[status as keyof typeof icons] || 'ri-information-line';
  };

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(order => order.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
                <p className="text-gray-600">Manage and track your customer orders</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                  <i className="ri-download-line mr-2"></i>
                  Export Orders
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="border-b">
              <nav className="flex space-x-8 px-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[#004080] text-[#004080]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">#{order.order_number}</h4>
                            <p className="text-sm text-gray-600">{order.order_date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            <i className={`${getStatusIcon(order.status)} mr-1`}></i>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${order.total_amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{order.payment_status}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <img
                          src={order.product_image}
                          alt={order.product_title}
                          className="w-16 h-16 object-cover object-top rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{order.product_title}</h5>
                          <p className="text-sm text-gray-600">Qty: {order.quantity}</p>
                          <p className="text-sm text-gray-600">Buyer: {order.buyer_name}</p>
                        </div>
                        <div className="text-right">
                          <button className="text-[#004080] hover:text-blue-700 text-sm font-medium">
                            View Details <i className="ri-arrow-right-line ml-1"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="ri-shopping-bag-line text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {activeTab === 'all' 
                      ? 'Your orders will appear here once customers start purchasing your products.'
                      : `No ${activeTab} orders found.`}
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <Link href="/sell/quick" className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                      Add Product
                    </Link>
                    <Link href="/seller/promote" className="border border-[#004080] text-[#004080] px-6 py-3 rounded-lg font-medium hover:bg-blue-50 cursor-pointer whitespace-nowrap">
                      Promote Listings
                    </Link>
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
