
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { signUp } from '../../lib/auth';

export default function RegisterPage() {
  const [accountType, setAccountType] = useState('buyer');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (!formData.terms) {
      setError('Please accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        accountType: accountType as 'buyer' | 'seller'
      });

      setSuccess('Account created successfully! You can now sign in.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-gray-600">Join millions of buyers and sellers</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex space-x-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value="buyer"
                    checked={accountType === 'buyer'}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className={`border-2 rounded-lg p-4 text-center transition-colors ${
                    accountType === 'buyer'
                      ? 'border-[#004080] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <i className="ri-shopping-cart-line text-2xl mb-2 text-[#004080]"></i>
                    <h3 className="font-semibold">Buyer</h3>
                    <p className="text-sm text-gray-600">Shop & buy items</p>
                  </div>
                </label>

                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value="seller"
                    checked={accountType === 'seller'}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className={`border-2 rounded-lg p-4 text-center transition-colors ${
                    accountType === 'seller'
                      ? 'border-[#004080] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <i className="ri-store-2-line text-2xl mb-2 text-[#004080]"></i>
                    <h3 className="font-semibold">Seller</h3>
                    <p className="text-sm text-gray-600">Sell your items</p>
                  </div>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                  required
                  disabled={loading}
                />
                <label className="text-sm text-gray-600">
                  I agree to the <Link href="/terms" className="text-[#004080] hover:text-blue-700">Terms of Service</Link> and <Link href="/privacy" className="text-[#004080] hover:text-blue-700">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFA500] text-white py-3 rounded-lg font-semibold hover:bg-orange-600 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account? <Link href="/login" className="text-[#004080] hover:text-blue-700 font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
