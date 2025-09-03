
'use client';
import { useState } from 'react';

interface VideoUploaderProps {
  onVideoSelect: (file: File | null) => void;
  currentVideo?: string;
}

export default function VideoUploader({ onVideoSelect, currentVideo }: VideoUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [hasPremiumUpgrade, setHasPremiumUpgrade] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video file must be less than 100MB');
      return;
    }

    setSelectedFile(file);
    onVideoSelect(file);
    
    // Show premium modal if user hasn't upgraded yet
    if (!hasPremiumUpgrade) {
      setShowPremiumModal(true);
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setShowPremiumModal(false);
          return 100;
        }
        return prev + 8;
      });
    }, 150);
  };

  const handlePremiumUpgrade = () => {
    // Set flag that user has premium upgrade
    setHasPremiumUpgrade(true);
    simulateUpload();
  };

  const handleSkipUpgrade = () => {
    // Remove the video selection if user skips
    setSelectedFile(null);
    onVideoSelect(null);
    setShowPremiumModal(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900">Product Video</h4>
            <p className="text-sm text-gray-600">Videos get 5x more engagement</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
            Premium +$2.99
          </div>
        </div>

        {selectedFile && hasPremiumUpgrade ? (
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#004080] to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <i className="ri-play-line text-2xl text-white"></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">
                  {selectedFile?.name || 'product-video.mp4'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : 'Video ready'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                    ✓ Premium Upgraded
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    📱 Mobile Optimized
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setHasPremiumUpgrade(false);
                  onVideoSelect(null);
                  setUploadProgress(0);
                }}
                className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-200 transition-colors cursor-pointer"
              >
                <i className="ri-delete-bin-line text-lg"></i>
              </button>
            </div>
            
            {isUploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
                  <span>Processing premium video...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#004080] to-purple-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">✨ Optimizing for maximum engagement...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="border-3 border-dashed border-purple-300 rounded-3xl p-12 text-center bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <i className="ri-video-add-line text-3xl text-white"></i>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">Add Product Video</h4>
            <p className="text-gray-600 mb-2">Show your item in action</p>
            <p className="text-sm text-gray-500 mb-6">MP4, MOV, AVI • Max 100MB • Premium feature</p>
            
            <div className="space-y-4">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <label 
                htmlFor="video-upload"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
              >
                Select Video File
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-purple-200">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="ri-eye-line text-green-600 text-lg"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">5x More Views</p>
                  <p className="text-xs text-gray-600">Videos dramatically increase engagement</p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-purple-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="ri-speed-line text-blue-600 text-lg"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Sell 3x Faster</p>
                  <p className="text-xs text-gray-600">Videos build trust and confidence</p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-purple-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="ri-medal-line text-purple-600 text-lg"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Premium Badge</p>
                  <p className="text-xs text-gray-600">Stand out from other listings</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-vip-crown-line text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium Video Upload</h3>
              <p className="text-purple-100">Professional video hosting with maximum impact</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-check-line text-green-600"></i>
                  </div>
                  <span className="text-gray-700">Lightning-fast streaming</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-check-line text-green-600"></i>
                  </div>
                  <span className="text-gray-700">Auto-optimized for all devices</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-check-line text-green-600"></i>
                  </div>
                  <span className="text-gray-700">Premium video badge</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-check-line text-green-600"></i>
                  </div>
                  <span className="text-gray-700">Priority in search results</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Premium Video Upgrade</p>
                    <p className="text-sm text-gray-600">Added to your listing total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">+$2.99</p>
                    <p className="text-xs text-gray-500">Worth $10+ value</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line text-blue-600 mt-0.5"></i>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Payment Information</p>
                    <p className="text-xs text-blue-700">
                      The $2.99 video upgrade will be charged when you create your listing. You can pay with card or marketplace credits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSkipUpgrade}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Skip Video
                </button>
                <button
                  onClick={handlePremiumUpgrade}
                  className="flex-1 bg-gradient-to-r from-[#FFA500] to-orange-600 text-white py-3 rounded-2xl font-bold hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
                >
                  Add to Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
