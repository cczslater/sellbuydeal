
'use client';
import Link from 'next/link';

export default function ActiveListings() {
  const listings = [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Active Listings</h3>
        <Link href="/seller/listings" className="text-[#004080] hover:text-blue-700 text-sm font-medium cursor-pointer">
          Manage All
        </Link>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">No active listings</h4>
        <p className="text-gray-600 mb-6">Create your first listing to start selling</p>
        <Link href="/sell/quick" className="w-full bg-[#FFA500] text-white py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap block text-center">
          Create New Listing
        </Link>
      </div>
    </div>
  );
}
