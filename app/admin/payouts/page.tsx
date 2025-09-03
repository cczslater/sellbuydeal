'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin, isAdminAuthenticated } from '../../../lib/admin-auth';
import { 
  getPayoutRequests, 
  updatePayoutRequest, 
  PayoutRequest 
} from '../../../lib/commission';
import { supabase } from '../../../lib/supabase';
export const dynamic = "force-dynamic";
export default function AdminPayouts() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    
    loadPayouts();
  }, [router]);

  const loadPayouts = async () => {
    setLoading(true);
    const data = await getPayoutRequests();
    
    // Enrich with seller information
    const enrichedData = await Promise.all(
      data.map(async (payout) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', payout.seller_id)
          .single();
        
        return {
          ...payout,
          seller_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
          seller_email: profile?.email || 'Unknown'
        };
      })
    );
    
    setPayouts(enrichedData as any);
    setLoading(false);
  };

  const filteredPayouts = payouts.filter(payout => {
    if (filter === 'all') return true;
    return payout.status === filter;
  });

  const handleStatusUpdate = async (payoutId: number, newStatus: string, adminNotes?: string) => {
    setProcessing(payoutId);
    
    try {
      const success = await updatePayoutRequest(payoutId, { 
        status: newStatus,
        admin_notes: adminNotes 
      });
      
      if (success) {
        await loadPayouts();
        setShowModal(false);
        setSelectedPayout(null);
        alert(`Payout ${newStatus} successfully!`);
      } else {
        alert('Failed to update payout request.');
      }
    } catch (error) {
      console.error('Error updating payout:', error);
      alert('An error occurred while updating the payout.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      paypal: 'ri-paypal-line',
      bank: 'ri-bank-line',
      crypto: 'ri-coin-line'
    };
    return icons[method as keyof typeof icons] || 'ri-bank-card-line';
  };

  const currentAdmin = getCurrentAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payout requests...</p>
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
              <nav className="flex space-x-6">
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-red-600 cursor-pointer">
                  Dashboard
                </Link>
                <Link href="/admin/commissions" className="text-gray-600 hover:text-red-600 cursor-pointer">
                  Commissions
                </Link>
                <span className="text-red-600 font-medium">Payout Management</span>
              </nav>
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payout Management</h1>
          <p className="text-gray-600">Review and process seller payout requests</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All Requests', count: payouts.length },
                  { key: 'pending', label: 'Pending', count: payouts.filter(p => p.status === 'pending').length },
                  { key: 'processing', label: 'Processing', count: payouts.filter(p => p.status === 'processing').length },
                  { key: 'completed', label: 'Completed', count: payouts.filter(p => p.status === 'completed').length },
                  { key: 'failed', label: 'Failed', count: payouts.filter(p => p.status === 'failed').length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm cursor-pointer whitespace-nowrap ${
                      filter === tab.key
                        ? 'bg-white text-red-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                Total Pending: <span className="font-semibold">
                  ${payouts.filter(p => p.status === 'pending')
                    .reduce((sum, p) => sum + p.final_payout_amount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="divide-y">
            {filteredPayouts.length > 0 ? (
              filteredPayouts.map((payout: any) => (
                <div key={payout.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className={`${getPaymentMethodIcon(payout.payout_method)} text-xl text-gray-600`}></i>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-semibold text-gray-900">{payout.seller_name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                            {payout.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{payout.seller_email}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Requested: {new Date(payout.requested_at).toLocaleDateString()}</span>
                          <span>Method: {payout.payout_method.toUpperCase()}</span>
                          <span>Request #{payout.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${payout.final_payout_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>Request: ${payout.requested_amount.toFixed(2)}</div>
                        {payout.total_commission > 0 && (
                          <div>Commission: -${payout.total_commission.toFixed(2)}</div>
                        )}
                        {payout.total_promotion_fees > 0 && (
                          <div>Promo Fees: -${payout.total_promotion_fees.toFixed(2)}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedPayout(payout);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap"
                      >
                        View Details
                      </button>
                      
                      {payout.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(payout.id, 'processing')}
                            disabled={processing === payout.id}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
                          >
                            Process
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(payout.id, 'failed', 'Rejected by admin')}
                            disabled={processing === payout.id}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {payout.status === 'processing' && (
                        <button
                          onClick={() => handleStatusUpdate(payout.id, 'completed')}
                          disabled={processing === payout.id}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          {processing === payout.id ? 'Processing...' : 'Mark Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-bank-line text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No payout requests</h4>
                <p className="text-gray-600">
                  {filter === 'all' ? 'No payout requests have been submitted yet.' : `No ${filter} payout requests found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Details Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Payout Request Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Seller Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Name:</span> {(selectedPayout as any).seller_name}</p>
                    <p><span className="text-gray-600">Email:</span> {(selectedPayout as any).seller_email}</p>
                    <p><span className="text-gray-600">Seller ID:</span> {selectedPayout.seller_id}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payout Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Status:</span> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPayout.status)}`}>
                        {selectedPayout.status}
                      </span>
                    </p>
                    <p><span className="text-gray-600">Method:</span> {selectedPayout.payout_method.toUpperCase()}</p>
                    <p><span className="text-gray-600">Requested:</span> {new Date(selectedPayout.requested_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Financial Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Earnings:</span>
                    <span className="font-medium">${selectedPayout.requested_amount.toFixed(2)}</span>
                  </div>
                  {selectedPayout.total_commission > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Platform Commission:</span>
                      <span>-${selectedPayout.total_commission.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedPayout.total_promotion_fees > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Promotion Fees:</span>
                      <span>-${selectedPayout.total_promotion_fees.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Final Payout Amount:</span>
                    <span className="text-green-600">${selectedPayout.final_payout_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedPayout.payout_details && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payment Method Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(selectedPayout.payout_details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedPayout.admin_notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Admin Notes</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">{selectedPayout.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Close
                </button>
                {selectedPayout.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedPayout.id, 'processing')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                    >
                      Start Processing
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedPayout.id, 'failed', 'Rejected after review')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap"
                    >
                      Reject Request
                    </button>
                  </>
                )}
                {selectedPayout.status === 'processing' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedPayout.id, 'completed')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 cursor-pointer whitespace-nowrap"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
