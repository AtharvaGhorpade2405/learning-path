import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import JourneySection from '../components/landing/JourneySection';
import FooterCTA from '../components/landing/FooterCTA';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <HeroSection />
      <FeaturesGrid />
      <JourneySection />
      <FooterCTA />
    </div>
  );
};

export default Landing;
