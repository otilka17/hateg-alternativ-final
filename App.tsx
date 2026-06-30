import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import { useServiceWorker } from "@/hooks/use-service-worker.ts";
import { AnimatePresence } from "motion/react";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import MenuPage from "./pages/menu/page.tsx";
import CheckoutPage from "./pages/checkout/page.tsx";
import BorcanePage from "./pages/borcane/page.tsx";
import PachetePage from "./pages/pachete/page.tsx";
import AdminPage from "./pages/admin/page.tsx";
import ContactPage from "./pages/contact/page.tsx";
import TrackingPage from "./pages/tracking/page.tsx";
import GalleryPage from "./pages/gallery/page.tsx";
import BlogPage from "./pages/blog/page.tsx";
import BlogPostPage from "./pages/blog/post.tsx";
import LoyaltyPage from "./pages/loyalty/page.tsx";
import AccountPage from "./pages/contul-meu/page.tsx";
import DesprePage from "./pages/despre/page.tsx";
import ParteneriPage from "./pages/parteneri/page.tsx";
import NotFound from "./pages/NotFound.tsx";
import PageTransition from "./components/PageTransition.tsx";
import WhatsAppFloat from "./components/WhatsAppFloat.tsx";
import PromoBanner from "./components/PromoBanner.tsx";
import CookieConsent from "./components/CookieConsent.tsx";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/meniu" element={<PageTransition><MenuPage /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/borcane" element={<PageTransition><BorcanePage /></PageTransition>} />
        <Route path="/pachete" element={<PageTransition><PachetePage /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/tracking" element={<PageTransition><TrackingPage /></PageTransition>} />
        <Route path="/galerie" element={<PageTransition><GalleryPage /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPostPage /></PageTransition>} />
        <Route path="/fidelitate" element={<PageTransition><LoyaltyPage /></PageTransition>} />
        <Route path="/contul-meu" element={<PageTransition><AccountPage /></PageTransition>} />
        <Route path="/despre" element={<PageTransition><DesprePage /></PageTransition>} />
        <Route path="/parteneri" element={<PageTransition><ParteneriPage /></PageTransition>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useServiceWorker();

  return (
    <DefaultProviders>
      <BrowserRouter>
        <PromoBanner />
        <AnimatedRoutes />
        <WhatsAppFloat />
        <CookieConsent />
      </BrowserRouter>
    </DefaultProviders>
  );
}
