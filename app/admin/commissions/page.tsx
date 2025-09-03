
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin, isAdminAuthenticated } from '../../../lib/admin-auth';
import { 
  getCommissionSettings, 
  updateCommissionSetting, 
  CommissionSetting 
} from '../../../lib/commission';

export default function AdminCommissions() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<CommissionSetting>>({});
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getCommissionSettings();
    setSettings(data);
    setLoading(false);
  };

  const startEditing = (setting: CommissionSetting) => {
    setEditingId(setting.id);
    setFormData({
      commission_rate: setting.commission_rate,
      is_active: setting.is_active
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({});
  };

  const saveChanges = async (id: number) => {
    setSaving(id);
    
    try {
      const success = await updateCommissionSetting(id, formData);
      
      if (success) {
        await loadSettings();
        setEditingId(null);
        setFormData({});
        alert('Commission setting updated successfully!');
      } else {
        alert('Failed to update commission setting.');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('An error occurred while updating the setting.');
    } finally {
      setSaving(null);
    }
  };

  const getListingTypeLabel = (type: string) => {
    const labels = {
      buy_it_now: 'Buy It Now',
      make_offer: 'Make Offer',
      classified: 'Classified Ads'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getListingTypeIcon = (type: string) => {
    const icons = {
      buy_it_now: 'ri-shopping-cart-line',
      make_offer: 'ri-hand-coin-line',
      classified: 'ri-newspaper-line'
    };
    return icons[type as keyof typeof icons] || 'ri-price-tag-line';
  };

  const getListingTypeColor = (type: string) => {
    const colors = {
      buy_it_now: 'bg-green-100 text-green-800',
      make_offer: 'bg-blue-100 text-blue-800',
      classified: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const currentAdmin = getCurrentAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading commission settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img 
                src="https://static.readdy.ai/image/bb0d13c218f42a008c0d02bcafa2e2fe/8d1459ee78c57e6563140773fddfbd4c.png" 
                alt="Marketplace Logo" 
                className="h-8 w-auto"
              />
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                Admin Panel
              </span>
            </Link>
            <nav className="flex space-x-6">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-red-600 cursor-pointer">
                Dashboard
              </Link>
              <span className="text-red-600 font-medium">Commission Settings</span>
              <Link href="/admin/promotions" className="text-gray-600 hover:text-red-600 cursor-pointer">
                Promotions
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {currentAdmin?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{currentAdmin?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Settings</h1>
          <p className="text-gray-600">Configure commission rates for different listing types</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Listing Type Commission Rates</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Set commission percentages that will be deducted when sellers cash out their earnings
                </p>
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Applied at Cashout
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {settings.map((setting) => (
              <div key={setting.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getListingTypeColor(setting.listing_type)}`}>
                      <i className={`${getListingTypeIcon(setting.listing_type)} text-xl`}></i>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {getListingTypeLabel(setting.listing_type)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Commission rate for {setting.listing_type.replace('_', ' ')} transactions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      {editingId === setting.id ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="50"
                              value={formData.commission_rate || ''}
                              onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                              className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <span className="ml-2 text-gray-600">%</span>
                          </div>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.is_active || false}
                              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer mr-2"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                          </label>
                        </div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-gray-900">
                            {setting.commission_rate}%
                          </div>
                          <div className="text-sm text-gray-500">Commission Rate</div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      {editingId === setting.id ? (
                        <>
                          <button
                            onClick={() => saveChanges(setting.id)}
                            disabled={saving === setting.id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
                          >
                            {saving === setting.id ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving === setting.id}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${setting.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {setting.is_active ? 'Active' : 'Inactive'}
                          </span>
                          
                          <button
                            onClick={() => startEditing(setting)}
                            className="text-red-600 hover:text-red-700 font-medium cursor-pointer whitespace-nowrap"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-information-line text-blue-600 text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">How Commission System Works</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• <strong>Immediate Earnings:</strong> When items sell, full amount is credited to seller's account</p>
                  <p>• <strong>Commission Deduction:</strong> Commission is calculated and deducted only during cashout</p>
                  <p>• <strong>Promotion Fees:</strong> Any unpaid promotion costs are also deducted at cashout</p>
                  <p>• <strong>Transparent Process:</strong> Sellers see exactly what they'll receive before requesting payout</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-calculator-line text-green-600 text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Commission Examples</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• <strong>$100 Buy It Now:</strong> Seller earns $95 (5% commission = $5)</p>
                  <p>• <strong>$50 Make Offer:</strong> Seller earns $47.50 (5% commission = $2.50)</p>
                  <p>• <strong>$200 Classified Ad:</strong> Seller earns $194 (3% commission = $6)</p>
                  <p>• <strong>Plus Promotion Fees:</strong> Deducted from final payout amount</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
