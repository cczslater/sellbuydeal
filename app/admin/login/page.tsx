
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLogin, setCurrentAdmin, getCurrentAdmin } from '../../../lib/admin-auth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const currentAdmin = getCurrentAdmin();
    if (currentAdmin) {
      console.log('Admin already logged in, redirecting...');
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('=== ADMIN LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Password:', password);
      
      const adminUser = await adminLogin(email, password);
      console.log('Login result:', adminUser);
      
      if (adminUser) {
        console.log('✅ Login successful! Setting admin user...');
        setCurrentAdmin(adminUser);
        
        // Verify localStorage was set
        setTimeout(() => {
          const saved = getCurrentAdmin();
          console.log('Verification - Admin saved:', saved?.name);
          
          if (saved) {
            console.log('✅ Redirecting to admin dashboard...');
            window.location.href = '/admin/dashboard';
          } else {
            console.error('❌ Failed to save admin to localStorage');
            setError('Login successful but session could not be saved. Please try again.');
          }
        }, 200);
      } else {
        console.log('❌ Login failed - invalid credentials');
        setError('Invalid email or password. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('❌ Admin login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <i className="ri-admin-line text-2xl text-white"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
          <p className="text-gray-600">Sign in to your admin dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-1">✅ Demo Admin Account (Ready to Use):</p>
            <p className="text-sm text-green-700">📧 Email: admin@admin.com</p>
            <p className="text-sm text-green-700">🔑 Password: admin123</p>
            <p className="text-xs text-green-600 mt-1">Form is pre-filled - just click "Sign In"!</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <i className="ri-error-warning-line text-red-600"></i>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                '🚀 Sign In to Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Main Site
            </Link>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Check browser console (F12) for detailed login debugging information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
