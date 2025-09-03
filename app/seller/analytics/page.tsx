
'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';
import { getCurrentUser } from '../../../lib/auth';

export default function SellerAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    views: 0,
    sales: 0,
    revenue: 0,
    conversion: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        // In a real app, this would fetch from database
        // For now, showing empty state with 0 values
        setAnalyticsData({
          views: 0,
          sales: 0,
          revenue: 0,
          conversion: 0
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const stats = [
    {
      label: 'Total Views',
      value: analyticsData.views.toLocaleString(),
      change: '+0%',
      changeType: 'neutral' as const,
      icon: 'ri-eye-line',
      color: 'bg-blue-500'
    },
    {
      label: 'Total Sales',
      value: analyticsData.sales.toString(),
      change: '+0%',
      changeType: 'neutral' as const,
      icon: 'ri-shopping-cart-line',
      color: 'bg-green-500'
    },
    {
      label: 'Revenue',
      value: `$${analyticsData.revenue.toFixed(2)}`,
      change: '+0%',
      changeType: 'neutral' as const,
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-purple-500'
    },
    {
      label: 'Conversion Rate',
      value: `${analyticsData.conversion.toFixed(1)}%`,
      change: '+0%',
      changeType: 'neutral' as const,
      icon: 'ri-line-chart-line',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                <p className="text-gray-600">Track your store performance and sales metrics</p>
              </div>
              <div className="flex items-center space-x-3">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                >
                  {timeRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                  <i className="ri-download-line mr-2"></i>
                  Export Report
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                    <i className={`${stat.icon} text-xl text-white`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Views Over Time</h3>
                <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-more-2-line text-xl"></i>
                </button>
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-bar-chart-line text-2xl text-gray-400"></i>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No data available</h4>
                  <p className="text-gray-600">Start selling to see your view analytics</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Sales Performance</h3>
                <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-more-2-line text-xl"></i>
                </button>
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-line-chart-line text-2xl text-gray-400"></i>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No sales data</h4>
                  <p className="text-gray-600">Your sales chart will appear here</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Products</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-trophy-line text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No top products yet</h4>
                <p className="text-gray-600 text-sm">Your best-selling products will appear here</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Traffic Sources</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-global-line text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No traffic data</h4>
                <p className="text-gray-600 text-sm">Traffic source breakdown will show here</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Insights</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-heart-line text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No customer data</h4>
                <p className="text-gray-600 text-sm">Customer behavior insights will appear here</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
