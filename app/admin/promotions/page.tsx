'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import AdminAccess from '../../../components/AdminAccess';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getPromotionSettings, updatePromotionSetting, PromotionSetting } from '../../../lib/promotions';

export default function AdminPromotionsPage() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<PromotionSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<PromotionSetting>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getPromotionSettings();
    setSettings(data);
    setLoading(false);
  };

  const startEditing = (setting: PromotionSetting) => {
    setEditingId(setting.id);
    setFormData({
      price: setting.price,
      duration_days: setting.duration_days,
      description: setting.description,
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
      const success = await updatePromotionSetting(id, formData);
      
      if (success) {
        await loadSettings();
        setEditingId(null);
        setFormData({});
        alert('Promotion setting updated successfully!');
      } else {
        alert('Failed to update promotion setting.');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('An error occurred while updating the setting.');
    } finally {
      setSaving(null);
    }
  };

  const getPromotionIcon = (type: string) => {
    const icons = {
      move_to_top: 'ri-arrow-up-line',
      featured_listing: 'ri-star-line',
      homepage_promotion: 'ri-home-line',
      boost_visibility: 'ri-eye-line',
      premium_placement: 'ri-vip-crown-line',
      urgent_badge: 'ri-alarm-line'
    };
    return icons[type as keyof typeof icons] || 'ri-megaphone-line';
  };

  if (!user || !profile) {
    return <AdminAccess />;
  }

  if (profile.account_type !== 'admin') {
    return <AdminAccess />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotion Price Settings</h1>
          <p className="text-gray-600">Manage pricing and settings for listing promotions</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promotion Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {settings.map((setting) => (
                    <tr key={setting.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#004080] rounded-full flex items-center justify-center mr-3">
                            <i className={`${getPromotionIcon(setting.promotion_type)} text-white`}></i>
                          </div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {setting.promotion_type.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === setting.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.price || ''}
                            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 font-medium">
                            ${setting.price.toFixed(2)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === setting.id ? (
                          <input
                            type="number"
                            value={formData.duration_days || ''}
                            onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {setting.duration_days} day{setting.duration_days > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        {editingId === setting.id ? (
                          <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                            rows={2}
                          />
                        ) : (
                          <div className="text-sm text-gray-600 max-w-xs">
                            {setting.description}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === setting.id ? (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.is_active || false}
                              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                              className="rounded border-gray-300 text-[#004080] focus:ring-[#004080]"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                          </label>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            setting.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {setting.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === setting.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => saveChanges(setting.id)}
                              disabled={saving === setting.id}
                              className="text-green-600 hover:text-green-900 cursor-pointer"
                            >
                              {saving === setting.id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={saving === setting.id}
                              className="text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(setting)}
                            className="text-[#004080] hover:text-blue-700 cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-information-line text-blue-600"></i>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Promotion Types Explained</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <p><strong>Move to Top:</strong> Instantly moves listing to top of search results</p>
                  <p><strong>Featured Listing:</strong> Adds featured badge and premium placement</p>
                  <p><strong>Homepage Promotion:</strong> Features listing prominently on homepage</p>
                </div>
                <div>
                  <p><strong>Boost Visibility:</strong> Increases ranking in category and search pages</p>
                  <p><strong>Premium Placement:</strong> Premium positioning across all relevant pages</p>
                  <p><strong>Urgent Badge:</strong> Adds urgent badge to attract immediate attention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}