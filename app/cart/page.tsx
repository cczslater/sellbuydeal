'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: 'iPhone 15 Pro Max 256GB - Brand New Sealed',
      price: 1199.00,
      quantity: 1,
      image: 'https://readdy.ai/api/search-image?query=iPhone%2015%20Pro%20Max%20in%20professional%20product%20photography%2C%20premium%20smartphone%20on%20clean%20white%20background%20with%20elegant%20shadows&width=150&height=150&seq=cart-iphone&orientation=squarish',
      seller: 'TechHub Store',
      shipping: 0
    },
    {
      id: 2,
      title: 'Sony WH-1000XM5 Noise Canceling Headphones',
      price: 349.00,
      quantity: 2,
      image: 'https://readdy.ai/api/search-image?query=Premium%20Sony%20wireless%20headphones%20in%20sleek%20design%2C%20professional%20audio%20equipment%20photography%20on%20clean%20white%20background&width=150&height=150&seq=cart-sony&orientation=squarish',
      seller: 'AudioMax',
      shipping: 0
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalShipping = cartItems.reduce((sum, item) => sum + item.shipping, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + totalShipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({cartItems.length} items)</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <i className="ri-shopping-cart-line text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
            <Link href="/categories" className="bg-[#FFA500] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 cursor-pointer whitespace-nowrap">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover object-top rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Sold by {item.seller}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-[#004080]">
                          ${item.price.toFixed(2)}
                        </span>
                        {item.shipping === 0 && (
                          <span className="text-sm font-medium text-green-600">Free shipping</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 border-l border-r border-gray-300">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Estimated Delivery</h3>
                <div className="flex items-center space-x-3">
                  <i className="ri-truck-line text-2xl text-green-600"></i>
                  <div>
                    <p className="font-medium text-gray-900">Standard Shipping</p>
                    <p className="text-sm text-gray-600">5-7 business days • Free on orders over $25</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">
                      {totalShipping === 0 ? 'FREE' : `$${totalShipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#004080]">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link href="/checkout" className="w-full bg-[#FFA500] text-white py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 cursor-pointer whitespace-nowrap text-center block">
                    Proceed to Checkout
                  </Link>
                  <button className="w-full border-2 border-[#004080] text-[#004080] py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 cursor-pointer whitespace-nowrap">
                    PayPal Checkout
                  </button>
                </div>
                
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <i className="ri-shield-check-line text-green-600"></i>
                    <span>Secure checkout with buyer protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}