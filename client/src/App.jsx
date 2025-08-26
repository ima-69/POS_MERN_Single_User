import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage.jsx'
import SignupPage from './features/auth/SignupPage.jsx'
import DashboardPage from './features/dashboard/DashboardPage.jsx'
import SalesPage from './features/sales/SalesPage.jsx'
import ProductsPage from './features/products/ProductsPage.jsx'
import CategoriesPage from './features/categories/CategoriesPage.jsx'
import SuppliersPage from './features/suppliers/SuppliersPage.jsx'
import CustomersPage from './features/customers/CustomersPage.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Route>
        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}