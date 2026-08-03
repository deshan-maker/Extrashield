import DeviceShowcase from "@/components/DeviceShowcase";
import DownloadApp from "@/components/DownloadApp";
import FAQPreview from "@/components/FAQPreview";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ImageShowcase from "@/components/ImageShowcase";
import ImeiChecker from "@/components/ImeiChecker";
import Navbar from "@/components/Navbar";
import PlatformPreview from "@/components/PlatformPreview";
import ProtectionPlans from "@/components/ProtectionPlans";
import Testimonials from "@/components/Testimonials";
import TrustedBy from "@/components/TrustedBy";
import WhyChooseUs from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <DeviceShowcase />
      <TrustedBy />
      <ProtectionPlans />
      <WhyChooseUs />
      <Features />
      <ImageShowcase />
      <HowItWorks />
      <ImeiChecker />
      <PlatformPreview />
      <Testimonials />
      <FAQPreview />
      <DownloadApp />
      <Footer />
    </main>
  );
}
