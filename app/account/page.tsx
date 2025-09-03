
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CreditBalance from '../../components/CreditBalance';
import CreditRewards from '../../components/CreditRewards';
import LoyaltyPointsDisplay from '../../components/LoyaltyPointsDisplay';
import LoyaltyRewardsCenter from '../../components/LoyaltyRewardsCenter';
import ListingPromotions from '../../components/ListingPromotions';
import { useAuth } from '../../components/AuthProvider';
import { getCreditHistory, getCreditBalance, CreditTransaction, addCredit, deductCredit } from '../../lib/credits';
import { getLoyaltyPointsBalance, getPointsHistory, LoyaltyPointsBalance, PointsTransaction } from '../../lib/loyalty-points';
import { getPromotionSettings, getUserPromotionHistory } from '../../lib/promotions';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile, loading } = useAuth();
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [creditBalance, setCreditBalanceState] = useState(0);
  const [userListingsCount, setUserListingsCount] = useState(0);

  // Add loyalty points state
  const [loyaltyBalance, setLoyaltyBalance] = useState<LoyaltyPointsBalance | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);

  // Promotions state
  const [promotionHistory, setPromotionHistory] = useState<any[]>([]);
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([]);
  const [showCreditPurchaseModal, setShowCreditPurchaseModal] = useState(false);
  const [creditPurchaseAmount, setCreditPurchaseAmount] = useState(10);
  const [purchaseMethod, setPurchaseMethod] = useState('paypal');

  // Promotion application state
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [promotionDuration, setPromotionDuration] = useState(3);
  const [isApplyingPromotion, setIsApplyingPromotion] = useState(false);

  // Address and Payment state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false
  });
  const [paymentForm, setPaymentForm] = useState({
    type: 'visa',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    await Promise.all([
      loadCreditData(),
      loadLoyaltyData(),
      loadUserListings(),
      loadSavedData(),
      loadPromotionData()
    ]);
  };

  const loadCreditData = async () => {
    if (!user) return;

    const [history, balance] = await Promise.all([
      getCreditHistory(user.id),
      getCreditBalance(user.id)
    ]);

    setCreditHistory(history);
    setCreditBalanceState(balance?.current_balance || 0);
  };

  const loadLoyaltyData = async () => {
    if (!user) return;

    const [balance, history] = await Promise.all([
      getLoyaltyPointsBalance(user.id),
      getPointsHistory(user.id)
    ]);

    setLoyaltyBalance(balance);
    setPointsHistory(history);
  };

  const loadUserListings = async () => {
    // This would normally fetch from database
    // For now, using profile data or default
    setUserListingsCount(3); // Demo data

    // Mock user listings for promotion application
    setUserListings([
      {
        id: '1',
        title: 'iPhone 14 Pro Max - 256GB Space Black',
        price: 999.00,
        category: 'Electronics',
        status: 'active',
        image: 'https://readdy.ai/api/search-image?query=iPhone%2014%20Pro%20Max%20Space%20Black%20product%20photography%20on%20clean%20white%20background&width=100&height=100&seq=iphone14&orientation=squarish'
      },
      {
        id: '2',
        title: 'Vintage Guitar Collection - 1960s Fender',
        price: 2500.00,
        category: 'Musical Instruments',
        status: 'active',
        image: 'https://readdy.ai/api/search-image?query=vintage%20Fender%20guitar%201960s%20classic%20electric%20guitar%20product%20photography%20clean%20background&width=100&height=100&seq=guitar&orientation=squarish'
      },
      {
        id: '3',
        title: 'Designer Handbag - Louis Vuitton',
        price: 1200.00,
        category: 'Fashion',
        status: 'active',
        image: 'https://readdy.ai/api/search-image?query=Louis%20Vuitton%20designer%20handbag%20luxury%20fashion%20product%20photography%20clean%20white%20background&width=100&height=100&seq=handbag&orientation=squarish'
      }
    ]);
  };

  const loadSavedData = async () => {
    // Start with completely empty arrays for new accounts
    setSavedAddresses([]);
    setSavedPaymentMethods([]);
  };

  const loadPromotionData = async () => {
    if (!user) return;

    const [history, available] = await Promise.all([
      getUserPromotionHistory(user.id),
      getPromotionSettings()
    ]);

    setPromotionHistory(history);
    setAvailablePromotions(available);
  };

  // Handle promotion application
  const handleApplyPromotion = async (promotion: any) => {
    if (!user) return;

    setSelectedPromotion(promotion);
    setShowPromotionModal(true);
  };

  const confirmPromotionApplication = async () => {
    if (!user || !selectedPromotion || !selectedListingId) {
      alert('请选择要推广的商品');
      return;
    }

    const totalCost = selectedPromotion.price * promotionDuration;

    if (creditBalance < totalCost) {
      alert(`余额不足！需要 $${totalCost.toFixed(2)}，当前余额 $${creditBalance.toFixed(2)}`);
      return;
    }

    setIsApplyingPromotion(true);

    try {
      // Deduct credits for promotion
      const success = await deductCredit(
        user.id,
        totalCost,
        'promotion_boost',
        `Applied ${selectedPromotion.title} promotion for ${promotionDuration} days`,
        `promo_${selectedListingId}_${Date.now()}`
      );

      if (success) {
        // Reload credit data
        await loadCreditData();

        setShowPromotionModal(false);
        setSelectedPromotion(null);
        setSelectedListingId('');
        setPromotionDuration(3);

        alert(`推广申请成功！您的商品将获得 ${promotionDuration} 天的 ${selectedPromotion.title} 推广效果。`);
      } else {
        alert('推广申请失败，请稍后重试。');
      }
    } catch (error) {
      console.error('Error applying promotion:', error);
      alert('推广申请过程中出现错误，请稍后重试。');
    } finally {
      setIsApplyingPromotion(false);
    }
  };

  const handlePurchaseCredits = async () => {
    if (!user || creditPurchaseAmount <= 0) return;

    // Simulate credit purchase
    const success = await addCredit(
      user.id,
      creditPurchaseAmount,
      `purchase_${purchaseMethod}`,
      `Purchased ${creditPurchaseAmount} credits via ${purchaseMethod}`,
      `purchase_${Date.now()}`
    );

    if (success) {
      await loadCreditData();
      setShowCreditPurchaseModal(false);
      alert(`Successfully purchased $${creditPurchaseAmount} in credits!`);
    } else {
      alert('Failed to purchase credits. Please try again.');
    }
  };

  const handleAddAddress = () => {
    if (!addressForm.fullName || !addressForm.streetAddress || !addressForm.city) {
      alert('Please fill in all required fields');
      return;
    }

    const newAddress = { ...addressForm };
    if (newAddress.isDefault || savedAddresses.length === 0) {
      setSavedAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
      newAddress.isDefault = true;
    }

    setSavedAddresses(prev => [...prev, newAddress]);
    setAddressForm({
      type: 'home',
      fullName: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      isDefault: false
    });
    setShowAddressModal(false);
  };

  const editAddress = (index: number) => {
    setEditingAddress(index);
    setAddressForm(savedAddresses[index]);
    setShowAddressModal(true);
  };

  const handleUpdateAddress = () => {
    if (editingAddress === null) return;

    const updatedAddress = { ...addressForm };
    if (updatedAddress.isDefault) {
      setSavedAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
    }

    setSavedAddresses(prev =>
      prev.map((addr, i) => i === editingAddress ? updatedAddress : addr)
    );

    setEditingAddress(null);
    setAddressForm({
      type: 'home',
      fullName: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      isDefault: false
    });
    setShowAddressModal(false);
  };

  const deleteAddress = (index: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setSavedAddresses(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddPaymentMethod = () => {
    if (!paymentForm.cardNumber || !paymentForm.expiryMonth || !paymentForm.expiryYear || !paymentForm.cvv) {
      alert('Please fill in all required fields');
      return;
    }

    const newPayment = {
      type: paymentForm.type,
      lastFour: paymentForm.cardNumber.slice(-4),
      expiry: `${paymentForm.expiryMonth}/${paymentForm.expiryYear.slice(-2)}`,
      nameOnCard: paymentForm.nameOnCard,
      isDefault: paymentForm.isDefault || savedPaymentMethods.length === 0
    };

    if (newPayment.isDefault) {
      setSavedPaymentMethods(prev => prev.map(method => ({ ...method, isDefault: false })));
    }

    setSavedPaymentMethods(prev => [...prev, newPayment]);
    setPaymentForm({
      type: 'visa',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      nameOnCard: '',
      isDefault: false
    });
    setShowPaymentModal(false);
  };

  const editPaymentMethod = (index: number) => {
    const method = savedPaymentMethods[index];
    setEditingPayment(index);
    setPaymentForm({
      type: method.type,
      cardNumber: '',
      expiryMonth: method.expiry.split('/')[0],
      expiryYear: `20${method.expiry.split('/')[1]}`,
      cvv: '',
      nameOnCard: method.nameOnCard,
      isDefault: method.isDefault
    });
    setShowPaymentModal(true);
  };

  const deletePaymentMethod = (index: number) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setSavedPaymentMethods(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 h-96 bg-gray-200 rounded-2xl"></div>
              <div className="lg:col-span-3 h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-2xl text-gray-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to view your account</p>
            <Link href="/login" className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
              Sign In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const recentOrders = [];
  const watchlist = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
              <p className="text-gray-600">Manage your account, orders, and marketplace rewards</p>
            </div>

            {creditBalance > 0 && (
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-[#FFA500] to-orange-600 text-white px-6 py-3 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <i className="ri-coins-line text-xl"></i>
                    <div>
                      <p className="text-sm opacity-90">Credit Balance</p>
                      <p className="text-xl font-bold">${creditBalance.toFixed(2)}</p>
                    </div>
                  </div>

                </div>

                <button
                  onClick={() => setShowCreditPurchaseModal(true)}
                  className="bg-white border-2 border-[#FFA500] text-[#FFA500] px-4 py-2 rounded-lg font-medium hover:bg-[#FFA500] hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-2"
                >
                  <i className="ri-add-line"></i>
                  <span>Buy Credits</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#004080] to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white font-semibold">
                    {profile.first_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {profile.account_type}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {[{
                  key: 'overview',
                  label: 'Account Overview',
                  icon: 'ri-dashboard-line',
                  badge: null
                }, {
                  key: 'credits',
                  label: 'Marketplace Credits',
                  icon: 'ri-coins-line',
                  badge: creditBalance > 0 ? `$${creditBalance.toFixed(0)}` : null
                }, {
                  key: 'promotions',
                  label: 'Promotions & Boosts',
                  icon: 'ri-megaphone-line',
                  badge: 'New'
                }, {
                  key: 'loyalty',
                  label: 'Loyalty Points',
                  icon: 'ri-trophy-line',
                  badge: loyaltyBalance?.current_balance > 0 ? loyaltyBalance.current_balance.toLocaleString() : null
                }, {
                  key: 'orders',
                  label: 'My Orders',
                  icon: 'ri-shopping-bag-line',
                  badge: null
                }, {
                  key: 'watchlist',
                  label: 'Watchlist',
                  icon: 'ri-heart-line',
                  badge: null
                }, {
                  key: 'messages',
                  label: 'Messages',
                  icon: 'ri-message-line',
                  badge: null
                }, {
                  key: 'profile',
                  label: 'Profile Settings',
                  icon: 'ri-user-line',
                  badge: null
                }, {
                  key: 'addresses',
                  label: 'Addresses',
                  icon: 'ri-map-pin-line',
                  badge: null
                }, {
                  key: 'payment',
                  label: 'Payment Methods',
                  icon: 'ri-bank-card-line',
                  badge: null
                }].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left cursor-pointer transition-all ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-[#004080] to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <i className={`${tab.icon} text-lg`}></i>
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          activeTab === tab.key
                            ? 'bg-white/20 text-white'
                            : tab.badge === 'New'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <CreditBalance />
            <div className="mt-4">
              <LoyaltyPointsDisplay />
            </div>
          </aside>

          <main className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <p className="text-xs text-gray-500 mt-1">This month</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="ri-shopping-bag-line text-xl text-[#004080]"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#FFA500] to-orange-600 rounded-2xl p-6 shadow-sm text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-100 mb-1">Credit Balance</p>
                        <p className="text-2xl font-bold">${creditBalance.toFixed(2)}</p>
                        <p className="text-xs text-orange-200 mt-1">Ready to use</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <i className="ri-coins-line text-xl"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Loyalty Points</p>
                        <p className="text-2xl font-bold text-purple-600">{loyaltyBalance?.current_balance?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-gray-500 mt-1">Lifetime earned</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="ri-trophy-line text-xl text-purple-600"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Active Promotions</p>
                        <p className="text-2xl font-bold text-green-600">3</p>
                        <p className="text-xs text-gray-500 mt-1">Boosting listings</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-rocket-line text-xl text-green-600"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link
                        href="/sell/quick"
                        className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#FFA500] hover:bg-orange-50 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-[#FFA500] rounded-full flex items-center justify-center mr-4">
                          <i className="ri-add-line text-xl text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Create Listing</h4>
                          <p className="text-sm text-gray-600">Sell an item quickly</p>
                        </div>
                      </Link>

                      <button
                        onClick={() => setActiveTab('credits')}
                        className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#004080] hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-[#004080] rounded-full flex items-center justify-center mr-4">
                          <i className="ri-coins-line text-xl text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Buy Credits</h4>
                          <p className="text-sm text-gray-600">Boost your listings</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('promotions')}
                        className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                          <i className="ri-megaphone-line text-xl text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Promote Items</h4>
                          <p className="text-sm text-gray-600">Increase visibility</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="ri-gift-line text-green-600"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-800">Welcome Bonus Received!</p>
                          <p className="text-sm text-green-600">You received $5 marketplace credits</p>
                        </div>
                        <span className="text-sm text-green-600">+$5.00</span>
                      </div>

                      <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-trophy-line text-blue-600"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-blue-800">Loyalty Points Earned</p>
                          <p className="text-sm text-blue-600">Account verification completed</p>
                        </div>
                        <span className="text-sm text-blue-600">+100 pts</span>
                      </div>

                      <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <i className="ri-user-add-line text-purple-600"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-purple-800">Account Created</p>
                          <p className="text-sm text-purple-600">Welcome to our marketplace!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'promotions' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-[#004080] to-blue-700 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Boost Your Listings</h2>
                      <p className="text-blue-100 mb-4">Increase visibility and sell faster with powerful promotion tools</p>
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 rounded-lg px-3 py-2">
                          <span className="text-sm font-medium">Active Promotions: 3</span>
                        </div>
                        <div className="bg-white/20 rounded-lg px-3 py-2">
                          <span className="text-sm font-medium">Credits Available: ${creditBalance.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                        <i className="ri-rocket-2-line text-4xl"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotion Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[{
                    type: 'move_to_top',
                    title: 'Move to Top',
                    description: 'Instantly move your listings to the top of search results',
                    price: 1.99,
                    duration: '3 days',
                    icon: 'ri-arrow-up-line',
                    color: 'blue',
                    popular: false
                  }, {
                    type: 'featured_listing',
                    title: 'Featured Badge',
                    description: 'Add a featured badge and get premium placement',
                    price: 2.99,
                    duration: '7 days',
                    icon: 'ri-star-line',
                    color: 'yellow',
                    popular: true
                  }, {
                    type: 'homepage_promotion',
                    title: 'Homepage Spotlight',
                    description: 'Feature your listing on the main homepage',
                    price: 4.99,
                    duration: '7 days',
                    icon: 'ri-home-line',
                    color: 'purple',
                    popular: false
                  }, {
                    type: 'boost_visibility',
                    title: 'Visibility Boost',
                    description: 'Increase ranking across all relevant search pages',
                    price: 3.49,
                    duration: '5 days',
                    icon: 'ri-eye-line',
                    color: 'green',
                    popular: false
                  }, {
                    type: 'premium_placement',
                    title: 'Premium Placement',
                    description: 'Premium positioning across category and search pages',
                    price: 5.99,
                    duration: '10 days',
                    icon: 'ri-vip-crown-line',
                    color: 'red',
                    popular: false
                  }, {
                    type: 'urgent_badge',
                    title: 'Urgent Badge',
                    description: 'Add an urgent badge to attract immediate attention',
                    price: 1.49,
                    duration: '3 days',
                    icon: 'ri-alarm-line',
                    color: 'orange',
                    popular: false
                  }].map((promo) => (
                    <div key={promo.type} className="bg-white rounded-2xl p-6 shadow-sm border relative overflow-hidden">
                      {promo.popular && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#FFA500] to-orange-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Most Popular
                        </div>
                      )}

                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                          promo.color === 'blue'
                            ? 'bg-blue-100 text-blue-600'
                            : promo.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-600'
                              : promo.color === 'purple'
                                ? 'bg-purple-100 text-purple-600'
                                : promo.color === 'green'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        <i className={`${promo.icon} text-xl`}></i>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{promo.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{promo.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">${promo.price}</span>
                          <span className="text-sm text-gray-500 ml-1">{promo.duration}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyPromotion(promo)}
                        className="w-full bg-gradient-to-r from-[#004080] to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow cursor-pointer whitespace-nowrap"
                      >
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>

                {/* Active Promotions */}
                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Your Active Promotions</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <i className="ri-star-line text-blue-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Featured Listing</h4>
                            <p className="text-sm text-gray-600">iPhone 14 Pro Max - 256GB</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-blue-600">Expires in 3 days</span>
                          <p className="text-xs text-gray-500">$2.99 spent</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <i className="ri-arrow-up-line text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Move to Top</h4>
                            <p className="text-sm text-gray-600">Vintage Guitar Collection</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-green-600">Expires in 1 day</span>
                          <p className="text-xs text-gray-500">$1.99 spent</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <i className="ri-home-line text-purple-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Homepage Spotlight</h4>
                            <p className="text-sm text-gray-600">Designer Handbag</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-purple-600">Expires in 5 days</span>
                          <p className="text-xs text-gray-500">$4.99 spent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'loyalty' && (
              <div className="space-y-8">
                <LoyaltyRewardsCenter />
              </div>
            )}

            {activeTab === 'credits' && (
              <div className="space-y-8">
                {/* Enhanced Credit Overview */}
                <div className="bg-gradient-to-r from-[#FFA500] to-orange-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Marketplace Credits</h2>
                      <p className="text-orange-100 mb-4">Earn and spend credits to boost your listings and save on fees</p>
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-4xl font-bold">${creditBalance.toFixed(2)}</p>
                          <p className="text-orange-200 text-sm">Available Balance</p>
                        </div>
                        <div className="h-12 w-px bg-orange-300 opacity-50"></div>
                        <div>
                          <p className="text-2xl font-bold">$15.00</p>
                          <p className="text-orange-200 text-sm">Lifetime Earned</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => setShowCreditPurchaseModal(true)}
                        className="bg-white text-[#FFA500] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                      >
                        Buy More Credits
                      </button>
                      <p className="text-orange-200 text-sm">Get instant credits</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Credit Rewards & Bonuses</h3>
                    <p className="text-gray-600">Earn credits automatically through marketplace activities</p>
                  </div>
                  <div className="p-6">
                    <CreditRewards userListingsCount={userListingsCount} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Quick Promotions</h3>
                      <p className="text-gray-600 text-sm">Use your credits to promote listings instantly</p>
                    </div>
                    <Link href="/seller/promote" className="text-[#FFA500] hover:text-orange-600 font-medium cursor-pointer">
                      View All Options →
                    </Link>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-[#FFA500] hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-arrow-up-line text-xl text-blue-600"></i>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Move to Top</h4>
                        <p className="text-sm text-gray-600 mb-3">Instantly move listings to top of search</p>
                        <p className="text-lg font-bold text-blue-600 mb-2">From $1.99</p>
                        <button
                          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                        >
                          Apply Now
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-[#FFA500] hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-home-line text-xl text-purple-600"></i>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Homepage Feature</h4>
                        <p className="text-sm text-gray-600 mb-3">Feature your listing on homepage</p>
                        <p className="text-lg font-bold text-purple-600 mb-2">From $4.99</p>
                        <button
                          className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 cursor-pointer whitespace-nowrap"
                        >
                          Apply Now
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-[#FFA500] hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-star-line text-xl text-yellow-600"></i>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Featured Badge</h4>
                        <p className="text-sm text-gray-600 mb-3">Add featured badge and premium placement</p>
                        <p className="text-lg font-bold text-yellow-600 mb-2">From $2.99</p>
                        <button
                          className="w-full bg-yellow-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 cursor-pointer whitespace-nowrap"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Credit Transaction History</h3>
                  </div>
                  <div className="divide-y">
                    {creditHistory.length > 0 ? (
                      creditHistory.map((transaction) => (
                        <div key={transaction.id} className="p-6 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.type === 'earned'
                                  ? 'bg-green-100 text-green-600'
                                  : transaction.type === 'bonus'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-red-100 text-red-600'
                              }`}
                            >
                              <i
                                className={`${transaction.type === 'earned' ? 'ri-arrow-down-line' : transaction.type === 'bonus' ? 'ri-gift-line' : 'ri-arrow-up-line'} text-lg`}
                              ></i>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                              <p className="text-sm text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">
                                Source: {transaction.source.replace(/_/g, ' ')}
                                {transaction.reference_id && ` • Ref: ${transaction.reference_id.slice(-6)}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-lg font-semibold ${
                                transaction.type === 'earned' || transaction.type === 'bonus'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                            </span>
                            <p className="text-xs text-gray-500 mt-1 capitalize">{transaction.type}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-coins-line text-2xl text-gray-400"></i>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Welcome to Marketplace Credits!</h4>
                        <p className="text-gray-600 mb-6">Start listing items and completing activities to earn your first credits</p>
                        <div className="flex items-center justify-center space-x-4">
                          <Link
                            href="/sell"
                            className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap"
                          >
                            Create First Listing
                          </Link>
                          <button
                            onClick={() => setShowCreditPurchaseModal(true)}
                            className="border border-[#FFA500] text-[#FFA500] px-6 py-3 rounded-lg font-medium hover:bg-[#FFA500] hover:text-white cursor-pointer whitespace-nowrap"
                          >
                            Buy Credits
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                </div>
                <div className="p-6 text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                  <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
                  <Link
                    href="/"
                    className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="bg-white rounded-2xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">My Watchlist</h3>
                </div>
                <div className="p-6 text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-heart-line text-2xl text-gray-400"></i>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No items in watchlist</h4>
                  <p className="text-gray-600 mb-6">Save items you're interested in to your watchlist</p>
                  <Link
                    href="/"
                    className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-2xl shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                      <p className="text-gray-600 text-sm">Your conversations with buyers and sellers</p>
                    </div>
                    <button
                      className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap flex items-center space-x-2"
                    >
                      <i className="ri-mail-line"></i>
                      <span>New Message</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-message-line text-2xl text-gray-400"></i>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h4>
                  <p className="text-gray-600 mb-6">Start buying or selling to begin conversations</p>
                  <Link
                    href="/"
                    className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Delivery Addresses</h3>
                      <p className="text-gray-600 text-sm">Manage your shipping and billing addresses</p>
                    </div>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap flex items-center space-x-2"
                    >
                      <i className="ri-add-line"></i>
                      <span>Add Address</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {savedAddresses.length > 0 ? (
                    <div className="space-y-4">
                      {savedAddresses.map((address, index) => (
                        <div key={index} className="border rounded-lg p-4 flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <i
                                className={`${address.type === 'home' ? 'ri-home-line' : 'ri-building-line'} text-blue-600`}
                              ></i>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900 capitalize">{address.type}</h4>
                                {address.isDefault && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Default</span>
                                )}
                              </div>
                              <p className="text-gray-600">{address.fullName}</p>
                              <p className="text-gray-600">{address.streetAddress}</p>
                              <p className="text-gray-600">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                              {address.phone && <p className="text-gray-600">{address.phone}</p>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => editAddress(index)}
                              className="text-gray-400 hover:text-blue-600 cursor-pointer"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => deleteAddress(index)}
                              className="text-gray-400 hover:text-red-600 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-map-pin-line text-2xl text-gray-400"></i>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h4>
                      <p className="text-gray-600 mb-6">Add your delivery addresses for faster checkout</p>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-2xl shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                      <p className="text-gray-600 text-sm">Manage your cards and payment options</p>
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap flex items-center space-x-2"
                    >
                      <i className="ri-add-line"></i>
                      <span>Add Payment Method</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {savedPaymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {savedPaymentMethods.map((method, index) => (
                        <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <i
                                className={`${method.type === 'visa' ? 'ri-visa-line' : method.type === 'mastercard' ? 'ri-mastercard-line' : method.type === 'amex' ? 'ri-bank-card-line' : 'ri-bank-card-line'} text-2xl text-gray-600`}
                              ></i>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900 capitalize">{method.type}</h4>
                                {method.isDefault && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Default</span>
                                )}
                              </div>
                              <p className="text-gray-600">•••• •••• •••• {method.lastFour}</p>
                              <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => editPaymentMethod(index)}
                              className="text-gray-400 hover:text-blue-600 cursor-pointer"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => deletePaymentMethod(index)}
                              className="text-gray-400 hover:text-red-600 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-bank-card-line text-2xl text-gray-400"></i>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No payment methods saved</h4>
                      <p className="text-gray-600 mb-6">Add your cards for quick and secure checkout</p>
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                      >
                        Add Your First Card
                      </button>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <i className="ri-shield-check-line text-blue-600 mt-0.5"></i>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">Secure Payment</h4>
                        <p className="text-sm text-blue-700">
                          Your payment information is encrypted and stored securely. We never share your card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                </div>
                <div className="p-6">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          defaultValue={profile.first_name}
                          placeholder="Enter first name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          defaultValue={profile.last_name}
                          placeholder="Enter last name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={user.email || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue={profile.phone || ''}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                      />
                    </div>

                    <button className="bg-[#004080] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingAddress !== null ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    setAddressForm({
                      type: 'home',
                      fullName: '',
                      streetAddress: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      phone: '',
                      isDefault: false
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    value={addressForm.streetAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                    placeholder="Enter street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="City"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="State"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      placeholder="ZIP Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="Phone number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="defaultAddress"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-[#004080] border-gray-300 rounded focus:ring-[#004080]"
                  />
                  <label htmlFor="defaultAddress" className="ml-2 text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    setAddressForm({
                      type: 'home',
                      fullName: '',
                      streetAddress: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      phone: '',
                      isDefault: false
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAddress !== null ? handleUpdateAddress : handleAddAddress}
                  className="flex-1 bg-[#004080] text-white py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                >
                  {editingAddress !== null ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingPayment !== null ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    setPaymentForm({
                      type: 'visa',
                      cardNumber: '',
                      expiryMonth: '',
                      expiryYear: '',
                      cvv: '',
                      nameOnCard: '',
                      isDefault: false
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="amex">American Express</option>
                    <option value="discover">Discover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                  <input
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card</label>
                  <input
                    type="text"
                    value={paymentForm.nameOnCard}
                    onChange={(e) => setPaymentForm({ ...paymentForm, nameOnCard: e.target.value })}
                    placeholder="Enter name as shown on card"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                    <select
                      value={paymentForm.expiryMonth}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8"
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <select
                      value={paymentForm.expiryYear}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8"
                      required
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                    <input
                      type="text"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, '') })}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="defaultPayment"
                    checked={paymentForm.isDefault}
                    onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-[#004080] border-gray-300 rounded focus:ring-[#004080]"
                  />
                  <label htmlFor="defaultPayment" className="ml-2 text-sm text-gray-700">
                    Set as default payment method
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    setPaymentForm({
                      type: 'visa',
                      cardNumber: '',
                      expiryMonth: '',
                      expiryYear: '',
                      cvv: '',
                      nameOnCard: '',
                      isDefault: false
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="flex-1 bg-[#004080] text-white py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                >
                  {editingPayment !== null ? 'Update Card' : 'Add Card'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Purchase Modal */}
      {showCreditPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Purchase Credits</h3>
                <button
                  onClick={() => setShowCreditPurchaseModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gradient-to-r from-[#FFA500] to-orange-600 rounded-lg p-4 mb-4 text-white">
                  <h4 className="font-semibold">Instant Credit Purchase</h4>
                  <p className="text-sm text-orange-100">Credits are added to your account immediately</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[5, 10, 25, 50, 100, 200].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCreditPurchaseAmount(amount)}
                        className={`p-3 rounded-lg border text-center cursor-pointer transition-colors ${
                          creditPurchaseAmount === amount
                            ? 'border-[#FFA500] bg-orange-50 text-[#FFA500]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold">${amount}</div>
                        <div className="text-xs text-gray-500">{amount} credits</div>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Or enter custom amount:</label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={creditPurchaseAmount}
                      onChange={(e) => setCreditPurchaseAmount(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    {[{
                      value: 'paypal',
                      label: 'PayPal',
                      icon: 'ri-paypal-line',
                      color: 'blue'
                    }, {
                      value: 'card',
                      label: 'Credit/Debit Card',
                      icon: 'ri-bank-card-line',
                      color: 'gray'
                    }, {
                      value: 'applepay',
                      label: 'Apple Pay',
                      icon: 'ri-smartphone-line',
                      color: 'black'
                    }, {
                      value: 'googlepay',
                      label: 'Google Pay',
                      icon: 'ri-google-line',
                      color: 'green'
                    }].map((method) => (
                      <label key={method.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="purchaseMethod"
                          value={method.value}
                          checked={purchaseMethod === method.value}
                          onChange={(e) => setPurchaseMethod(e.target.value)}
                          className="mr-3"
                        />
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            method.color === 'blue'
                              ? 'bg-blue-100 text-blue-600'
                              : method.color === 'gray'
                                ? 'bg-gray-100 text-gray-600'
                                : method.color === 'black'
                                  ? 'bg-gray-800 text-white'
                                  : 'bg-green-100 text-green-600'
                          }`}
                        >
                          <i className={method.icon}></i>
                        </div>
                        <span className="font-medium text-gray-900">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => setShowCreditPurchaseModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchaseCredits}
                  className="flex-1 bg-gradient-to-r from-[#FFA500] to-orange-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow cursor-pointer whitespace-nowrap"
                >
                  Purchase ${creditPurchaseAmount}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Credits never expire • Secure payment processing • Instant activation
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Application Modal */}
      {showPromotionModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">申请推广</h3>
                <button
                  onClick={() => {
                    setShowPromotionModal(false);
                    setSelectedPromotion(null);
                    setSelectedListingId('');
                    setPromotionDuration(3);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gradient-to-r from-[#004080] to-blue-600 rounded-lg p-4 text-white mb-4">
                  <h4 className="font-semibold flex items-center">
                    <i className={`${selectedPromotion.icon} mr-2`}></i>
                    {selectedPromotion.title}
                  </h4>
                  <p className="text-sm text-blue-100 mt-1">{selectedPromotion.description}</p>
                  <p className="text-lg font-bold mt-2">${selectedPromotion.price}/天</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择要推广的商品</label>
                  <select
                    value={selectedListingId}
                    onChange={(e) => setSelectedListingId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8"
                  >
                    <option value="">请选择商品</option>
                    {userListings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.title} - ${listing.price}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedListingId && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={userListings.find(l => l.id === selectedListingId)?.image}
                      alt=""
                      className="w-12 h-12 object-cover object-top rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {userListings.find(l => l.id === selectedListingId)?.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${userListings.find(l => l.id === selectedListingId)?.price}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">推广时长</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 7, 14].map((days) => (
                      <button
                        key={days}
                        onClick={() => setPromotionDuration(days)}
                        className={`p-3 rounded-lg border text-center cursor-pointer transition-colors ${
                          promotionDuration === days
                            ? 'border-[#004080] bg-blue-50 text-[#004080]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold">{days} 天</div>
                        <div className="text-xs text-gray-500">
                          ${(selectedPromotion.price * days).toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">费用明细</p>
                    <p className="text-sm text-gray-600">
                      ${selectedPromotion.price}/天 × {promotionDuration} 天
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[#004080]">
                    ${(selectedPromotion.price * promotionDuration).toFixed(2)}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-orange-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">当前余额</span>
                    <span
                      className={creditBalance >= (selectedPromotion.price * promotionDuration) ? 'text-green-600' : 'text-red-600'}
                    >
                      ${creditBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPromotionModal(false);
                    setSelectedPromotion(null);
                    setSelectedListingId('');
                    setPromotionDuration(3);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  取消
                </button>
                <button
                  onClick={confirmPromotionApplication}
                  disabled={!selectedListingId || isApplyingPromotion || creditBalance < (selectedPromotion.price * promotionDuration)}
                  className="flex-1 bg-gradient-to-r from-[#004080] to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-shadow cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplyingPromotion ? '申请中...' : '确认申请'}
                </button>
              </div>

              {creditBalance < (selectedPromotion.price * promotionDuration) && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-red-600 mb-2">余额不足，需要购买更多积分</p>
                  <button
                    onClick={() => {
                      setShowPromotionModal(false);
                      setShowCreditPurchaseModal(true);
                    }}
                    className="text-[#FFA500] text-sm font-medium hover:text-orange-600 cursor-pointer"
                  >
                    立即购买积分 →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
