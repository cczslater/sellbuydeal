'use client';
import Link from 'next/link';
import { isAdminAuthenticated } from '../lib/admin-auth';
import { useState, useEffect } from 'react';

export default function AdminAccess() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors">
        <Link href={isAdmin ? "/admin/dashboard" : "/admin/login"} className="flex items-center space-x-2 cursor-pointer">
          <i className="ri-admin-line text-lg"></i>
          <span className="font-medium">{isAdmin ? "Admin Panel" : "Admin Login"}</span>
        </Link>
      </div>
    </div>
  );
}