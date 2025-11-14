import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { Navigation } from "./components/Navigation/Navigation";
import { NotificationToast } from "./components/UI";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Entity, Action } from "./constants";

// Pages
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import Products from "./pages/products/Products";
import CreateProduct from "./pages/createProduct/CreateProduct";
import PermissionsDemo from "./pages/PermissionsDemo/PermissionsDemo";
import { SalesPage } from "./pages/Sales/SalesPage";
import { SalesHistory } from "./pages/SalesHistory/SalesHistory";
import SaleDetails from "./pages/SaleDetails/SaleDetails";
import { Inventory } from "./pages/Inventory/Inventory";
import { Reports } from "./pages/Reports/Reports";
import { UserManagementPage } from "./pages/UserManagementPage/UserManagementPage";
import SuppliersPage from "./pages/Suppliers";
import { Returns } from "./pages/Returns";

import { useRef, useEffect } from "react";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  console.log("PrivateRoute - usuario:", user);
  return user ? children : <Navigate to="/login" />;
};

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  console.log("MainLayout - usuario:", user);
  
  // Páginas públicas que no requieren navegación
  const publicPages = ['/login', '/signup', '/products'];
  const isPublicPage = publicPages.includes(location.pathname);
  
  // Si no hay usuario y es una página pública, mostrar sin layout
  if (!user && isPublicPage) {
    return children;
  }
  
  // Si no hay usuario y NO es una página pública, no mostrar nada (redirigirá)
  if (!user) {
    return children;
  }

  // Usuario autenticado: mostrar con navegación
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
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes with Permission Checks */}
              <Route
                path="/sales"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.SALES} action={Action.CREATE}>
                      <SalesPage />
                    </ProtectedRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/sales/history"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.SALES} action={Action.READ}>
                      <SalesHistory />
                    </ProtectedRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/sales/:id/details"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.SALES} action={Action.READ}>
                      <SaleDetails />
                    </ProtectedRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.INVENTORY} action={Action.READ}>
                      <Inventory />
                    </ProtectedRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.REPORTS} action={Action.READ}>
                      <Reports />
                    </ProtectedRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/products"
                element={<Products />}
              />
              <Route
                path="/create-product"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.PRODUCTS} action={Action.CREATE}>
                      <CreateProduct />
                    </ProtectedRoute>
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
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.USERS} action={Action.UPDATE}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.SUPPLIERS} action={Action.READ}>
                      <SuppliersPage />
                    </ProtectedRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/returns"
                element={
                  <PrivateRoute>
                    <ProtectedRoute entity={Entity.RETURNS} action={Action.READ}>
                      <Returns />
                    </ProtectedRoute>
                  </PrivateRoute>
                }
              />
              
              {/* Legacy routes for compatibility */}
              <Route path="/home" element={<Navigate to="/products" replace />} />
              <Route path="/dashboard" element={<Navigate to="/products" replace />} />
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
    console.log('🔗 Backend URL:', process.env.REACT_APP_API_BASE_URL || 'https://142.93.187.32.nip.io');
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationToast />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
