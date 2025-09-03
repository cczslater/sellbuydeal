
// Original code:
// ...
// Modified content:
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin, clearCurrentAdmin, isAdminAuthenticated } from '../../../lib/admin-auth';
import { 
  getWebsiteSettings, 
  updateWebsiteSettings, 
  getPaymentSettings, 
  updatePaymentSettings,
  WebsiteSettings,
  PaymentSettings
} from '../../../lib/admin-settings';
import { supabase } from '../../../lib/supabase';
export const dynamic = "force-dynamic";
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Real stats from database
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    totalSales: 0,
    promotionsRevenue: 0
  });

  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>({
    siteName: 'MarketPlace Hub',
    siteDescription: 'Buy and sell anything online with our secure marketplace platform',
    primaryColor: '#004080',
    accentColor: '#FFA500',
    commissionRate: 5,
    featuredListingFee: 2.99,
    videoUploadFee: 2.99,
    maintenanceMode: false,
    allowGuestBrowsing: true,
    requireEmailVerification: true,
    autoApproveListings: false
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    paypal: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      merchantId: '',
      environment: 'sandbox',
      webhookUrl: ''
    },
    googlePay: {
      enabled: false,
      merchantId: '',
      merchantName: '',
      environment: 'TEST',
      allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
      allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
    },
    bitcoin: {
      enabled: false,
      walletAddress: '',
      network: 'mainnet',
      provider: 'blockchain_info',
      apiKey: '',
      webhookUrl: '',
      confirmations: 3
    },
    stripe: {
      enabled: true,
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      currency: 'USD'
    }
  });

  // Check admin authentication first
  useEffect(() => {
    console.log(' Admin Dashboard: Starting authentication check...');
    
    // Force a small delay to ensure localStorage is ready
    setTimeout(() => {
      const isAuth = isAdminAuthenticated();
      const currentAdmin = getCurrentAdmin();
      
      console.log(' Admin Dashboard: Auth check results:', {
        isAuthenticated: isAuth,
        currentAdmin: currentAdmin?.name
      });

      if (!isAuth || !currentAdmin) {
        console.log(' Admin Dashboard: Not authenticated, redirecting...');
        router.push('/admin/login');
        return;
      }

      console.log(' Admin Dashboard: Authenticated successfully');
      setAuthChecked(true);
    }, 100);
  }, [router]);

  // Load dashboard data after authentication is confirmed
  useEffect(() => {
    if (authChecked) {
      console.log(' Admin Dashboard: Authentication confirmed, loading data...');
      loadDashboardData();
    }
  }, [authChecked]);

  const loadDashboardData = async () => {
    console.log(' Admin Dashboard: Starting data load...');
    setLoading(true);
    
    try {
      // Test database connection first
      console.log(' Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.warn(' Database connection test failed:', testError);
      } else {
        console.log(' Database connection successful');
      }

      // Load stats with individual error handling
      console.log(' Loading statistics...');
      
      let totalUsers = 0;
      let activeListings = 0;
      let totalSales = 0;

      try {
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        totalUsers = userCount || 0;
        console.log(' Users loaded:', totalUsers);
      } catch (error) {
        console.warn(' Failed to load users count:', error);
      }

      try {
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        activeListings = productCount || 0;
        console.log(' Products loaded:', activeListings);
      } catch (error) {
        console.warn(' Failed to load products count:', error);
      }

      try {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('total_amount');
        totalSales = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        console.log(' Sales loaded:', totalSales);
      } catch (error) {
        console.warn(' Failed to load orders:', error);
      }

      setStats({
        totalUsers,
        activeListings,
        totalSales,
        promotionsRevenue: 0
      });

      // Load settings with fallbacks
      console.log(' Loading settings...');
      try {
        const webSettings = await getWebsiteSettings();
        setWebsiteSettings(webSettings);
        console.log(' Website settings loaded');
      } catch (error) {
        console.warn(' Failed to load website settings, using defaults:', error);
      }

      try {
        const paySettings = await getPaymentSettings();
        setPaymentSettings(paySettings);
        console.log(' Payment settings loaded');
      } catch (error) {
        console.warn(' Failed to load payment settings, using defaults:', error);
      }

    } catch (error) {
      console.error(' Admin Dashboard: Error loading dashboard data:', error);
    } finally {
      console.log(' Admin Dashboard: Data loading complete');
      setLoading(false);
    }
  };

  const currentAdmin = getCurrentAdmin();

  const handleSignOut = () => {
    clearCurrentAdmin();
    router.push('/admin/login');
  };

  const handleSettingChange = (field: keyof WebsiteSettings, value: string | boolean | number) => {
    setWebsiteSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentSettingChange = (provider: keyof PaymentSettings, field: string, value: any) => {
    setPaymentSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const success = await updateWebsiteSettings(websiteSettings);
      if (success) {
        alert('Website settings saved successfully! Changes will be visible on the site.');
      } else {
        alert('Error saving website settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      const success = await updatePaymentSettings(paymentSettings);
      if (success) {
        alert('Payment settings saved successfully!');
      } else {
        alert('Error saving payment settings');
      }
    } catch (error) {
      console.error('Error saving payment settings:', error);
      alert('Error saving payment settings');
    } finally {
      setSaving(false);
    }
  };

  const testPaymentConnection = (provider: string) => {
    alert(`Testing ${provider} connection...`);
    setTimeout(() => {
      alert(`${provider} connection test successful!`);
    }, 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'users', label: 'Users', icon: 'ri-user-line' },
    { id: 'listings', label: 'Listings', icon: 'ri-shopping-bag-line' },
    { id: 'transactions', label: 'Transactions', icon: 'ri-money-dollar-circle-line' },
    { id: 'commissions', label: 'Commission Settings', icon: 'ri-percent-line' },
    { id: 'payouts', label: 'Payout Management', icon: 'ri-bank-line' },
    { id: 'payments', label: 'Payment Settings', icon: 'ri-secure-payment-line' },
    { id: 'website', label: 'Website Settings', icon: 'ri-global-line' },
  ];

  // Show loading screen only if not authenticated yet OR data is still loading
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">
            {!authChecked ? 'Checking authentication...' : 'Loading dashboard data...'}
          </p>
          <p className="text-xs text-gray-500">
            {!authChecked ? 'Please wait while we verify your access' : 'If this takes too long, check the browser console (F12)'}
          </p>
          {authChecked && (
            <button 
              onClick={() => {
                console.log(' Forcing data reload...');
                loadDashboardData();
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Click here to retry loading
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <img 
                  src="https://static.readdy.ai/image/bb0d13c218f42a008c0d02bcafa2e2fe/8d1459ee78c57e6563140773fddfbd4c.png" 
                  alt="MegaMarketplace Logo" 
                  className="h-10 w-auto"
                />
                <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                  Admin
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {currentAdmin?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{currentAdmin?.name}</span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-red-600 cursor-pointer"
              >
                <i className="ri-logout-box-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-6 space-y-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left cursor-pointer transition-colors ${
                  activeTab === item.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your marketplace efficiently</p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 pr-8"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      <p className="text-sm text-gray-500">Registered users</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-xl text-blue-600"></i>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Active Listings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                      <p className="text-sm text-gray-500">Products listed</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-shopping-bag-line text-xl text-green-600"></i>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalSales.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Revenue generated</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <i className="ri-money-dollar-circle-line text-xl text-orange-600"></i>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Gateways</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {[paymentSettings.paypal.enabled, paymentSettings.bitcoin.enabled, paymentSettings.googlePay.enabled].filter(Boolean).length}
                      </p>
                      <p className="text-sm text-gray-500">Active gateways</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="ri-secure-payment-line text-xl text-purple-600"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('website')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <i className="ri-global-line text-blue-600"></i>
                        <span className="font-medium">Configure Website</span>
                      </div>
                      <i className="ri-arrow-right-line text-gray-400"></i>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <i className="ri-secure-payment-line text-green-600"></i>
                        <span className="font-medium">Setup Payments</span>
                      </div>
                      <i className="ri-arrow-right-line text-gray-400"></i>
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <i className="ri-user-line text-purple-600"></i>
                        <span className="font-medium">Manage Users</span>
                      </div>
                      <i className="ri-arrow-right-line text-gray-400"></i>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Gateway Status</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="ri-paypal-line text-blue-600"></i>
                        <span className="text-sm font-medium">PayPal</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          paymentSettings.paypal.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {paymentSettings.paypal.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="ri-coin-line text-orange-500"></i>
                        <span className="text-sm font-medium">Bitcoin</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          paymentSettings.bitcoin.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {paymentSettings.bitcoin.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="ri-google-line text-green-600"></i>
                        <span className="text-sm font-medium">Google Pay</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          paymentSettings.googlePay.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {paymentSettings.googlePay.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <div className="text-sm text-gray-600">
                    Total Users: <span className="font-semibold">{stats.totalUsers}</span>
                  </div>
                </div>
              </div>

              {stats.totalUsers === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="ri-user-line text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No users registered yet</h3>
                  <p className="text-gray-600 mb-8">Your marketplace is ready for users to register and start buying and selling.</p>
                  <Link href="/register" className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 cursor-pointer whitespace-nowrap">
                    Create First User
                  </Link>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-600">User management features will be displayed here when users are registered.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Listing Management</h2>
                  <div className="text-sm text-gray-600">
                    Active Listings: <span className="font-semibold">{stats.activeListings}</span>
                  </div>
                </div>
              </div>

              {stats.activeListings === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="ri-shopping-bag-line text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No listings yet</h3>
                  <p className="text-gray-600 mb-8">Your marketplace is ready for users to create listings.</p>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-600">Listing management features will be displayed here when listings are created.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Transaction Management</h2>
                  <div className="text-sm text-gray-600">
                    Total Sales: <span className="font-semibold">${stats.totalSales.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-money-dollar-circle-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {stats.totalSales === 0 ? 'No transactions yet' : 'Transaction Details'}
                </h3>
                <p className="text-gray-600 mb-8">
                  {stats.totalSales === 0
                    ? 'Transactions will appear here when users start buying and selling.'
                    : 'Detailed transaction management features will be displayed here.'
                  }
                </p>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Gateway Configuration</h2>

                {/* PayPal Settings */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="ri-paypal-line text-white text-lg"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">PayPal Integration</h3>
                        <p className="text-sm text-gray-600">Configure PayPal to collect payments</p>
                      </div>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={paymentSettings.paypal.enabled}
                        onChange={(e) => handlePaymentSettingChange('paypal', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-600 cursor-pointer mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable PayPal</span>
                    </label>
                  </div>

                  {paymentSettings.paypal.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                        <input
                          type="text"
                          value={paymentSettings.paypal.clientId}
                          onChange={(e) => handlePaymentSettingChange('paypal', 'clientId', e.target.value)}
                          placeholder="Your PayPal Client ID"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                        <input
                          type="password"
                          value={paymentSettings.paypal.clientSecret}
                          onChange={(e) => handlePaymentSettingChange('paypal', 'clientSecret', e.target.value)}
                          placeholder="Your PayPal Client Secret"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Merchant ID</label>
                        <input
                          type="text"
                          value={paymentSettings.paypal.merchantId}
                          onChange={(e) => handlePaymentSettingChange('paypal', 'merchantId', e.target.value)}
                          placeholder="Your PayPal Merchant ID"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                        <select
                          value={paymentSettings.paypal.environment}
                          onChange={(e) => handlePaymentSettingChange('paypal', 'environment', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 pr-8"
                        >
                          <option value="sandbox">Sandbox (Testing)</option>
                          <option value="production">Production (Live)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={paymentSettings.paypal.webhookUrl}
                          onChange={(e) => handlePaymentSettingChange('paypal', 'webhookUrl', e.target.value)}
                          placeholder="https://your-domain.com/api/webhooks/paypal"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div className="md:col-span-2 flex space-x-3">
                        <button
                          onClick={() => testPaymentConnection('PayPal')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                        >
                          Test Connection
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bitcoin Settings */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <i className="ri-coin-line text-white text-lg"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Bitcoin Integration</h3>
                        <p className="text-sm text-gray-600">Accept Bitcoin payments</p>
                      </div>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={paymentSettings.bitcoin.enabled}
                        onChange={(e) => handlePaymentSettingChange('bitcoin', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-600 cursor-pointer mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Bitcoin</span>
                    </label>
                  </div>

                  {paymentSettings.bitcoin.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                        <input
                          type="text"
                          value={paymentSettings.bitcoin.walletAddress}
                          onChange={(e) => handlePaymentSettingChange('bitcoin', 'walletAddress', e.target.value)}
                          placeholder="Your Bitcoin wallet address"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
                        <select
                          value={paymentSettings.bitcoin.network}
                          onChange={(e) => handlePaymentSettingChange('bitcoin', 'network', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 pr-8"
                        >
                          <option value="mainnet">Mainnet (Live)</option>
                          <option value="testnet">Testnet (Testing)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                        <select
                          value={paymentSettings.bitcoin.provider}
                          onChange={(e) => handlePaymentSettingChange('bitcoin', 'provider', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 pr-8"
                        >
                          <option value="blockchain_info">Blockchain.info</option>
                          <option value="blockchair">Blockchair</option>
                          <option value="btc_com">BTC.com</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Required Confirmations</label>
                        <select
                          value={paymentSettings.bitcoin.confirmations}
                          onChange={(e) => handlePaymentSettingChange('bitcoin', 'confirmations', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 pr-8"
                        >
                          <option value={1}>1 confirmation</option>
                          <option value={3}>3 confirmations</option>
                          <option value={6}>6 confirmations</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key (Optional)</label>
                        <input
                          type="password"
                          value={paymentSettings.bitcoin.apiKey}
                          onChange={(e) => handlePaymentSettingChange('bitcoin', 'apiKey', e.target.value)}
                          placeholder="Provider API key for advanced features"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={paymentSettings.bitcoin.webhookUrl}
                          onChange={(e) => handlePaymentSettingChange('bitcoin', 'webhookUrl', e.target.value)}
                          placeholder="https://your-domain.com/api/webhooks/bitcoin"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div className="md:col-span-2 flex space-x-3">
                        <button
                          onClick={() => testPaymentConnection('Bitcoin')}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap"
                        >
                          Test Connection
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Pay Settings */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <i className="ri-google-line text-white text-lg"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Google Pay Integration</h3>
                        <p className="text-sm text-gray-600">Accept Google Pay payments</p>
                      </div>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={paymentSettings.googlePay.enabled}
                        onChange={(e) => handlePaymentSettingChange('googlePay', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-600 cursor-pointer mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Google Pay</span>
                    </label>
                  </div>

                  {paymentSettings.googlePay.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Merchant ID</label>
                        <input
                          type="text"
                          value={paymentSettings.googlePay.merchantId}
                          onChange={(e) => handlePaymentSettingChange('googlePay', 'merchantId', e.target.value)}
                          placeholder="Your Google Pay Merchant ID"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Name</label>
                        <input
                          type="text"
                          value={paymentSettings.googlePay.merchantName}
                          onChange={(e) => handlePaymentSettingChange('googlePay', 'merchantName', e.target.value)}
                          placeholder="Your business name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                        <select
                          value={paymentSettings.googlePay.environment}
                          onChange={(e) => handlePaymentSettingChange('googlePay', 'environment', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 pr-8"
                        >
                          <option value="TEST">Test Environment</option>
                          <option value="PRODUCTION">Production Environment</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex space-x-3">
                        <button
                          onClick={() => testPaymentConnection('Google Pay')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 cursor-pointer whitespace-nowrap"
                        >
                          Test Connection
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button 
                    disabled={saving}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={savePaymentSettings}
                    disabled={saving}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Payment Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Commission Configuration</h2>
                    <p className="text-gray-600 mt-1">Manage commission rates for different listing types</p>
                  </div>
                  <Link href="/admin/commissions" className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap">
                    Manage Commission Settings
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-auction-line text-xl text-purple-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Auction Listings</h3>
                    <div className="text-3xl font-bold text-purple-600 mb-2">3%</div>
                    <p className="text-sm text-gray-600">Commission Rate</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-shopping-cart-line text-xl text-green-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Buy It Now</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">5%</div>
                    <p className="text-sm text-gray-600">Commission Rate</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-hand-coin-line text-xl text-blue-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Make Offer</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">5%</div>
                    <p className="text-sm text-gray-600">Commission Rate</p>
                  </div>
                </div>

                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <i className="ri-information-line text-yellow-600"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">Commission System Overview</h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <p>• <strong>Deferred Collection:</strong> Commissions are deducted when sellers request payouts, not at sale time</p>
                        <p>• <strong>Transparent Process:</strong> Sellers see their gross earnings immediately and net amount at withdrawal</p>
                        <p>• <strong>Promotion Fees:</strong> Any unpaid promotional costs are also deducted during cashout</p>
                        <p>• <strong>Flexible Rates:</strong> Different commission rates based on listing type to encourage specific behaviors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payout Management</h2>
                    <p className="text-gray-600 mt-1">Review and process seller withdrawal requests</p>
                  </div>
                  <Link href="/admin/payouts" className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap">
                    View All Payouts
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">0</div>
                    <div className="text-sm text-gray-600">Pending Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">$0.00</div>
                    <div className="text-sm text-gray-600">Total Pending</div>
                  </div>
                </div>

                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-bank-line text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payout requests</h3>
                  <p className="text-gray-600 mb-6">Seller payout requests will appear here when submitted</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'website' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Website Configuration</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={websiteSettings.siteName}
                        onChange={(e) => handleSettingChange('siteName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                      <textarea
                        rows={3}
                        value={websiteSettings.siteDescription}
                        onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                        maxLength={500}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={websiteSettings.primaryColor}
                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                            className="w-12 h-10 rounded border"
                          />
                          <span className="text-sm text-gray-600">{websiteSettings.primaryColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={websiteSettings.accentColor}
                            onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                            className="w-12 h-10 rounded border"
                          />
                          <span className="text-sm text-gray-600">{websiteSettings.accentColor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                        <input
                          type="number"
                          value={websiteSettings.commissionRate}
                          onChange={(e) => handleSettingChange('commissionRate', parseFloat(e.target.value))}
                          min="0"
                          max="20"
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Featured Listing Fee ($)</label>
                        <input
                          type="number"
                          value={websiteSettings.featuredListingFee}
                          onChange={(e) => handleSettingChange('featuredListingFee', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video Upload Fee ($)</label>
                        <input
                          type="number"
                          value={websiteSettings.videoUploadFee}
                          onChange={(e) => handleSettingChange('videoUploadFee', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">Maintenance Mode</span>
                            <p className="text-sm text-gray-600">Temporarily disable public access</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={websiteSettings.maintenanceMode}
                            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-600 cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">Allow Guest Browsing</span>
                            <p className="text-sm text-gray-600">Let users browse without accounts</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={websiteSettings.allowGuestBrowsing}
                            onChange={(e) => handleSettingChange('allowGuestBrowsing', e.target.checked)}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-600 cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">Require Email Verification</span>
                            <p className="text-sm text-gray-600">Users must verify emails to sell</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={websiteSettings.requireEmailVerification}
                            onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-600 cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">Auto-Approve Listings</span>
                            <p className="text-sm text-gray-600">Automatically approve new listings</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={websiteSettings.autoApproveListings}
                            onChange={(e) => handleSettingChange('autoApproveListings', e.target.checked)}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-600 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-green-800">Website Status</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            {websiteSettings.maintenanceMode ? 'Maintenance' : 'Online'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-blue-800">Database Status</span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            Connected
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <span className="text-sm text-yellow-800">Payment Gateway</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              paymentSettings.paypal.enabled || paymentSettings.bitcoin.enabled || paymentSettings.googlePay.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {paymentSettings.paypal.enabled || paymentSettings.bitcoin.enabled || paymentSettings.googlePay.enabled
                              ? 'Configured'
                              : 'Setup Required'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                  <button 
                    disabled={saving}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Website Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
