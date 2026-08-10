import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import SurveySection from "@/pages/_components/SurveySection.tsx";

export default function ChestionarPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <SurveySection />
      <Footer />
    </div>
  );
}
