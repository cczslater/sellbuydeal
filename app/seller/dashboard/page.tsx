
'use client';
import { useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';
import DashboardStats from '../../../components/DashboardStats';
import RecentOrders from '../../../components/RecentOrders';
import ActiveListings from '../../../components/ActiveListings';
import FirstTimeSellerBoost from '../../../components/FirstTimeSellerBoost';
import CreditBalance from '../../../components/CreditBalance';

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <SellerSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
            <p className="text-gray-600">Track your sales, manage listings, and grow your business</p>
          </div>

          <FirstTimeSellerBoost />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <DashboardStats />
            <CreditBalance />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ActiveListings />
            <RecentOrders />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
