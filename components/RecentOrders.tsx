
'use client';

export default function RecentOrders() {
  const orders = [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <a href="/seller/orders" className="text-[#004080] hover:text-blue-700 text-sm font-medium cursor-pointer">
          View All
        </a>
      </div>
      
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-shopping-cart-line text-2xl text-gray-400"></i>
        </div>
        <p className="text-gray-600 mb-2">No recent orders</p>
        <p className="text-sm text-gray-500">Orders from buyers will appear here</p>
      </div>
    </div>
  );
}
