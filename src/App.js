import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
// ...existing code...
import { useAuth, AuthProvider } from "./context/AuthContext";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Signup from "./pages/signup/Signup";
import Products from "./pages/products/Products";
import CreateProduct from "./pages/createProduct/CreateProduct";
import PermissionsDemo from "./pages/PermissionsDemo/PermissionsDemo";

import { useRef, useEffect } from "react";
import { testBackendConnection } from "./utils/testConnection";
import { debugApi } from "./utils/debugApi";
import "./utils/testSimple";
import "./utils/authDebug";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};
function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = useRef(null);
  return (
    <SwitchTransition>
      <CSSTransition key={location.pathname} classNames="fade" timeout={400} nodeRef={nodeRef}>
        <div ref={nodeRef}>
          <Routes location={location}>
            <Route path="/" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/create-product" element={<CreateProduct />} />
            <Route path="/permissions-demo" element={<PermissionsDemo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
}

function App() {
  // Probar conectividad al backend cuando se carga la app
  useEffect(() => {
    console.log('🚀 MAPO Frontend iniciando...');
    console.log('🔗 Backend URL:', process.env.REACT_APP_API_BASE_URL || 'http://142.93.187.32:8000');
    
    // Probar conectividad en desarrollo
    if (process.env.NODE_ENV === 'development') {
      testBackendConnection();
      
      // Hacer disponible la función de debug
      setTimeout(() => {
        console.log('🔧 Función de debug disponible: debugMAPO.testEndpoints()');
        console.log('🧪 Test simple disponible: window.mapoTest.runAll()');
        console.log('🔐 Auth debug disponible: window.authDebug.checkLocalStorage()');
        window.debugMAPO = debugApi;
      }, 2000);
    }
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
