import './global.css';
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Molecules/Footer/Footer";
import Navbar from "./components/Molecules/Navbar/Navbar";
import AnimatedBackground from "./components/Molecules/Background/Background";
import ChatButton from "./components/Molecules/ChatButton/ChatButton";
import AuthProvider from "./Providers/AuthProvider"; 
import FontControls from "./components/Molecules/FontControls/FontControls";
import ColorBlindFilter from './components/Molecules/ColorBlindFilter/ColorBlindFilter'; 
import SvgColorBlindFilters from "./components/Molecules/ColorBlindFilter/SvgColorBlindFilters";
import ThemeToggle from "./components/Molecules/ThemeToggle/ThemeToggle";
import { AccessibilityProvider, useAccessibility } from "./contexts/AccessibilityContext";
import { API_URL } from "./config/api.js";

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/cadastro", "/register-ong"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  const { settings } = useAccessibility();

  return (
    <div className="app-wrapper" style={{ position: 'relative' }}>
      <AnimatedBackground />
      
      {/* Renderizar os componentes de acessibilidade apenas se estiverem ativados */}
      {settings.colorBlindFilter && <ColorBlindFilter />}
      
      {!shouldHideNavbar && <Navbar />} 
      <AppRoutes />
      <ChatButton />
      {!shouldHideNavbar && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <AppContent />
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
