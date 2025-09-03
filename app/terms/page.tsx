'use client';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: January 2024</p>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using our marketplace platform, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              To access certain features of our platform, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Maintaining the confidentiality of your account information</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your account information is accurate and up-to-date</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Buying and Selling</h2>
            <p className="text-gray-700 mb-4">Our platform facilitates transactions between buyers and sellers:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Sellers are responsible for accurate item descriptions and timely shipping</li>
              <li>Buyers must pay for purchased items according to the agreed terms</li>
              <li>All transactions are subject to our dispute resolution process</li>
              <li>We reserve the right to cancel transactions that violate our policies</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">Users may not:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Sell counterfeit, stolen, or illegal items</li>
              <li>Manipulate prices or engage in bid manipulation</li>
              <li>Create multiple accounts to circumvent restrictions</li>
              <li>Use the platform for money laundering or fraud</li>
              <li>Violate intellectual property rights</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Fees and Payments</h2>
            <p className="text-gray-700 mb-6">
              Our platform charges fees for certain services. Current fee structures are available on our 
              seller fee page. We reserve the right to modify fees with 30 days notice to users.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              We provide the platform as a service to facilitate transactions between users. We are not 
              responsible for the quality, safety, legality, or availability of items listed by users.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Privacy Policy</h2>
            <p className="text-gray-700 mb-6">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your 
              use of the platform, to understand our practices.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Modifications</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting to the platform. Your continued use constitutes acceptance of modified terms.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please contact us at 
              legal@marketplace.com or through our contact page.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}