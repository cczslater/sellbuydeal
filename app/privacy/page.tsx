'use client';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: January 2024</p>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">We collect information you provide directly to us, such as:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Account registration information (name, email, phone number)</li>
              <li>Profile information and preferences</li>
              <li>Transaction history and payment information</li>
              <li>Communications with other users and customer support</li>
              <li>Reviews and feedback you provide</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and security alerts</li>
              <li>Respond to your comments and questions</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-700 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              except as described in this policy. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>With your consent or at your direction</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the internet is 100% secure.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Access and update your personal information</li>
              <li>Delete your account and personal data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies</h2>
            <p className="text-gray-700 mb-6">
              We use cookies and similar technologies to enhance your experience, analyze usage, and 
              assist in our marketing efforts. You can control cookies through your browser settings.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at 
              privacy@marketplace.com or through our contact page.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}