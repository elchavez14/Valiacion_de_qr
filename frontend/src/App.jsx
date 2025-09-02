import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { setAuth } from "./api";
import { getAccess } from "./store/auth";
import Login from "./pages/Login";
import Open from "./pages/Open";
import OrderWizard from "./pages/OrderWizard";
import AdminOrders from "./pages/AdminOrders";
import OrderDetail from "./pages/OrderDetail";
import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import Navbar from "./components/Navbar";
import MyOrders from "./pages/MyOrders";
import ScanQR from "./pages/ScanQR";
import SuccessForm from "./pages/SuccessForm";
import "./index.css";

setAuth(getAccess());

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <Toaster />
      {location.pathname !== "/login" && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<OrderDetail />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/order" element={<OrderWizard />} />
        <Route path="/open" element={<Open />} />
        <Route path="/escanear" element={<ScanQR />} />
        <Route path="/orden/:id/cerrar" element={<SuccessForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
