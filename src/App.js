import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
// ...existing code...
import { useAuth, AuthProvider } from "./context/AuthContext";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Signup from "./pages/signup/Signup";

import { useRef } from "react";

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
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
