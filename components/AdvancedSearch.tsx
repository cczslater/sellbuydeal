'use client';
import { useState } from 'react';

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  onClose: () => void;
}

export default function AdvancedSearch({ onSearch, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    condition: [],
    priceMin: '',
    priceMax: '',
    listingType: [],
    location: '',
    distance: '25',
    seller: '',
    shipping: [],
    sortBy: 'relevance',
    timeRange: 'all'
  });

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Automotive', 'Sports & Outdoors',
    'Collectibles & Art', 'Books & Media', 'Health & Beauty', 'Toys & Hobbies',
    'Business & Industrial', 'Jewelry & Watches', 'Musical Instruments'
  ];

  const conditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor'];
  const listingTypes = ['Buy Now', 'Auction', 'Make Offer', 'Classified Ad'];
  const shippingOptions = ['Free Shipping', 'Local Pickup', 'International Shipping'];

  const handleCheckboxChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item: string) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      condition: [],
      priceMin: '',
      priceMax: '',
      listingType: [],
      location: '',
      distance: '25',
      seller: '',
      shipping: [],
      sortBy: 'relevance',
      timeRange: 'all'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder="What are you looking for?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
              >
                <option value="relevance">Best Match</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newly Listed</option>
                <option value="ending">Ending Soonest</option>
                <option value="distance">Distance: Nearest First</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                  placeholder="Min"
                  className="w-32 pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                  placeholder="Max"
                  className="w-32 pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Condition</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {conditions.map(condition => (
                <label key={condition} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.condition.includes(condition)}
                    onChange={() => handleCheckboxChange('condition', condition)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Listing Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {listingTypes.map(type => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.listingType.includes(type)}
                    onChange={() => handleCheckboxChange('listingType', type)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State or ZIP code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters(prev => ({ ...prev, distance: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
              >
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
                <option value="500">Within 500 miles</option>
                <option value="anywhere">Anywhere</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seller</label>
            <input
              type="text"
              value={filters.seller}
              onChange={(e) => setFilters(prev => ({ ...prev, seller: e.target.value }))}
              placeholder="Search by seller name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Options</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {shippingOptions.map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.shipping.includes(option)}
                    onChange={() => handleCheckboxChange('shipping', option)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Listed Within</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
            >
              <option value="all">Any time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={resetFilters}
            className="text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
          >
            Reset All Filters
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-[#004080] text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
            >
              Search Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}