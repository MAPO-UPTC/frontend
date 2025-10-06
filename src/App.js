import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { Navigation } from "./components/Navigation/Navigation";

// Pages
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Signup from "./pages/signup/Signup";
import Products from "./pages/products/Products";
import CreateProduct from "./pages/createProduct/CreateProduct";
import PermissionsDemo from "./pages/PermissionsDemo/PermissionsDemo";
import { SalesPage } from "./pages/Sales/SalesPage";
import { Inventory } from "./pages/Inventory/Inventory";
import { Reports } from "./pages/Reports/Reports";

import { useRef, useEffect } from "react";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  console.log("PrivateRoute - usuario:", user);
  return user ? children : <Navigate to="/login" />;
};

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  console.log("MainLayout - usuario:", user);
  
  if (!user) {
    return children;
  }

  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = useRef(null);
  
  return (
    <MainLayout>
      <SwitchTransition>
        <CSSTransition key={location.pathname} classNames="fade" timeout={400} nodeRef={nodeRef}>
          <div ref={nodeRef}>
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <PrivateRoute>
                    <SalesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <PrivateRoute>
                    <Inventory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute>
                    <Products />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-product"
                element={
                  <PrivateRoute>
                    <CreateProduct />
                  </PrivateRoute>
                }
              />
              <Route
                path="/permissions-demo"
                element={
                  <PrivateRoute>
                    <PermissionsDemo />
                  </PrivateRoute>
                }
              />
              
              {/* Legacy routes for compatibility */}
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </CSSTransition>
      </SwitchTransition>
    </MainLayout>
  );
}

function App() {
  useEffect(() => {
    console.log('🚀 MAPO Frontend iniciando...');
    console.log('🔗 Backend URL:', process.env.REACT_APP_API_BASE_URL || 'http://142.93.187.32:8000');
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
