
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ImportedListing {
  title: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  condition: string;
  quantity: number;
  shipping: string;
}

export default function EbayImporter({ onImportComplete }: { onImportComplete?: () => void }) {
  const [importMethod, setImportMethod] = useState<'url' | 'csv'>('url');
  const [ebayUrl, setEbayUrl] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedListings, setImportedListings] = useState<ImportedListing[]>([]);
  const [selectedListings, setSelectedListings] = useState<Set<number>>(new Set());
  const [importProgress, setImportProgress] = useState(0);

  const handleUrlImport = async () => {
    if (!ebayUrl.trim()) return;
    
    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate eBay API call - In real implementation, you'd use eBay's API
      setImportProgress(25);
      
      // Mock eBay listing data extraction
      const mockListing: ImportedListing = {
        title: "Premium Wireless Bluetooth Headphones with Noise Cancellation",
        price: 89.99,
        description: "High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.",
        images: [
          "https://readdy.ai/api/search-image?query=premium%20wireless%20bluetooth%20headphones%20black%20sleek%20modern%20design%20with%20noise%20cancellation%20technology%20professional%20studio%20quality&width=400&height=400&seq=ebay1&orientation=squarish",
          "https://readdy.ai/api/search-image?query=bluetooth%20headphones%20side%20view%20showing%20comfort%20padding%20and%20adjustable%20headband%20premium%20materials&width=400&height=400&seq=ebay2&orientation=squarish"
        ],
        category: "Electronics",
        condition: "New",
        quantity: 5,
        shipping: "Free shipping"
      };

      setImportProgress(75);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setImportedListings([mockListing]);
      setSelectedListings(new Set([0]));
      setImportProgress(100);
      
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      setImportProgress(50);
      
      // Parse CSV data
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const listings: ImportedListing[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;
        
        const listing: ImportedListing = {
          title: values[headers.indexOf('title')] || 'Imported Item',
          price: parseFloat(values[headers.indexOf('price')] || '0'),
          description: values[headers.indexOf('description')] || 'No description available',
          images: [
            "https://readdy.ai/api/search-image?query=imported%20marketplace%20product%20generic%20item%20clean%20simple%20background%20professional&width=400&height=400&seq=csv" + i + "&orientation=squarish"
          ],
          category: values[headers.indexOf('category')] || 'Other',
          condition: values[headers.indexOf('condition')] || 'Used',
          quantity: parseInt(values[headers.indexOf('quantity')] || '1'),
          shipping: values[headers.indexOf('shipping')] || 'Standard'
        };
        
        listings.push(listing);
      }
      
      setImportProgress(100);
      setImportedListings(listings);
      setSelectedListings(new Set(listings.map((_, index) => index)));
      
    } catch (error) {
      console.error('CSV import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handlePublishSelected = async () => {
    const selectedItems = importedListings.filter((_, index) => 
      selectedListings.has(index)
    );
    
    if (selectedItems.length === 0) return;
    
    setIsImporting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Import selected listings to products table
      for (const listing of selectedItems) {
        await supabase.from('products').insert({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
          quantity: listing.quantity,
          images: listing.images,
          seller_id: user.id,
          status: 'active',
          shipping_info: listing.shipping,
          imported_from: 'ebay'
        });
      }
      
      // Clear imported data
      setImportedListings([]);
      setSelectedListings(new Set());
      
      if (onImportComplete) {
        onImportComplete();
      }
      
    } catch (error) {
      console.error('Publishing failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleListingSelection = (index: number) => {
    const newSelection = new Set(selectedListings);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedListings(newSelection);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <i className="ri-download-cloud-line text-blue-600"></i>
        </div>
        <h2 className="text-xl font-semibold">eBay Listing Importer</h2>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setImportMethod('url')}
            className={`px-4 py-2 rounded-lg border ${
              importMethod === 'url' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <i className="ri-link mr-2"></i>
            Import by URL
          </button>
          <button
            onClick={() => setImportMethod('csv')}
            className={`px-4 py-2 rounded-lg border ${
              importMethod === 'csv' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <i className="ri-file-text-line mr-2"></i>
            Import CSV
          </button>
        </div>

        {importMethod === 'url' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              eBay Listing URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={ebayUrl}
                onChange={(e) => setEbayUrl(e.target.value)}
                placeholder="https://www.ebay.com/itm/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isImporting}
              />
              <button
                onClick={handleUrlImport}
                disabled={isImporting || !ebayUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isImporting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Importing...
                  </>
                ) : (
                  <>
                    <i className="ri-download-line mr-2"></i>
                    Import
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Paste the full eBay listing URL to import product details automatically
            </p>
          </div>
        )}

        {importMethod === 'csv' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                className="hidden"
                id="csv-upload"
                disabled={isImporting}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <i className="ri-file-upload-line text-gray-400 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload CSV file
                  </p>
                  <p className="text-xs text-gray-500">
                    Or drag and drop your eBay export file
                  </p>
                </div>
              </label>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <p className="font-medium mb-1">Required CSV columns:</p>
              <p>title, price, description, category, condition, quantity, shipping</p>
            </div>
          </div>
        )}
      </div>

      {isImporting && importProgress > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Import Progress</span>
            <span className="text-sm text-gray-500">{importProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {importedListings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Imported Listings ({importedListings.length})
            </h3>
            <button
              onClick={handlePublishSelected}
              disabled={selectedListings.size === 0 || isImporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <i className="ri-check-line mr-2"></i>
              Publish Selected ({selectedListings.size})
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {importedListings.map((listing, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedListings.has(index)}
                    onChange={() => toggleListingSelection(index)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {listing.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-medium text-green-600">
                        ${listing.price}
                      </span>
                      <span>{listing.category}</span>
                      <span>{listing.condition}</span>
                      <span>Qty: {listing.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {importedListings.length === 0 && !isImporting && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="ri-download-cloud-line text-gray-400 text-2xl"></i>
          </div>
          <p className="text-sm">No listings imported yet</p>
          <p className="text-xs">Use the import options above to get started</p>
        </div>
      )}
    </div>
  );
}
