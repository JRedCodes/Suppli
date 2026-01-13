import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import OrdersListPage from '../pages/OrdersListPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import OrderGenerationPage from '../pages/OrderGenerationPage';
import VendorsListPage from '../pages/VendorsListPage';
import VendorFormPage from '../pages/VendorFormPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/generate" element={<OrderGenerationPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="vendors" element={<VendorsListPage />} />
          <Route path="vendors/new" element={<VendorFormPage />} />
          <Route path="vendors/:vendorId" element={<VendorFormPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
