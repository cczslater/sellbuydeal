
'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import FeaturedListings from '../components/FeaturedListings';
import BundleSection from '../components/BundleSection';
import TrustBadges from '../components/TrustBadges';
import FeaturedNewSellers from '../components/FeaturedNewSellers';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <HeroSection />
      <CategorySection />
      <FeaturedListings />
      <BundleSection />
      <TrustBadges />
      <FeaturedNewSellers />
      <Footer />
    </div>
  );
}
