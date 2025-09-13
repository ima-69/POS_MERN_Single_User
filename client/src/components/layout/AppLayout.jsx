import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaBoxOpen, FaTags, FaTruck, FaUsers, FaBars, FaTimes, FaFileInvoice, FaChartBar } from 'react-icons/fa'
import { useLogoutMutation } from '../../features/auth/authApi'
import logo from '../../assets/logo.png'

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logout] = useLogoutMutation()
  const navigate = useNavigate()

  const link = ({ isActive }) =>
    (isActive 
      ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transition-all duration-200' 
      : 'flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-gray-300 hover:text-white'
    )

  async function handleLogout() {
    await logout().unwrap()
    // Clear token from localStorage
    localStorage.removeItem('token')
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const currentDate = new Date().toDateString()




  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white h-screen fixed left-0 top-0 p-6 shadow-2xl overflow-hidden z-30">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-purple-500 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10 w-full flex flex-col h-full">
            {/* Brand Section */}
            <div className="mb-8 flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex-shrink-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-lg shadow-lg">
                <img src={logo} alt="Logo" className="h-12 w-12" />
              </div>
              <div>
                <div className="font-bold text-base leading-5">PRASANNA</div>
                <div className="text-xs opacity-80">Printers & Communication</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Main Menu</div>
              <div className="space-y-2">
                <NavLink className={link} to="/sales">
                  <FaShoppingCart className="text-base" />
                  <span className="font-medium text-sm">Sales</span>
                </NavLink>
                <NavLink className={link} to="/products">
                  <FaBoxOpen className="text-base" />
                  <span className="font-medium text-sm">Products</span>
                </NavLink>
                <NavLink className={link} to="/categories">
                  <FaTags className="text-base" />
                  <span className="font-medium text-sm">Categories</span>
                </NavLink>
                <NavLink className={link} to="/suppliers">
                  <FaTruck className="text-base" />
                  <span className="font-medium text-sm">Suppliers</span>
                </NavLink>
                <NavLink className={link} to="/customers">
                  <FaUsers className="text-base" />
                  <span className="font-medium text-sm">Customers</span>
                </NavLink>
                <NavLink className={link} to="/invoices">
                  <FaFileInvoice className="text-base" />
                  <span className="font-medium text-sm">Invoices</span>
                </NavLink>
                <NavLink className={link} to="/reports">
                  <FaChartBar className="text-base" />
                  <span className="font-medium text-sm">Reports & Analytics</span>
                </NavLink>
              </div>
            </nav>

            {/* Logout Button */}
            <div className="flex-shrink-0 pt-4">
              <button 
                onClick={handleLogout} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-0 z-50 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu}></div>
          <aside className="relative w-80 max-w-[85vw] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white h-full p-6 shadow-2xl overflow-y-auto">
            {/* Close button */}
            <button 
              onClick={closeMobileMenu}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Brand Section */}
            <div className="mb-10 flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-xl shadow-lg">
                <img src={logo} alt="Logo" className="h-12 w-12" />
              </div>
              <div>
                <div className="font-bold text-lg leading-5">PRASANNA</div>
                <div className="text-sm opacity-80">Printers & Communication</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Main Menu</div>
              <NavLink className={link} to="/sales" onClick={closeMobileMenu}>
                <FaShoppingCart className="text-lg" />
                <span className="font-medium">Sales</span>
              </NavLink>
              <NavLink className={link} to="/products" onClick={closeMobileMenu}>
                <FaBoxOpen className="text-lg" />
                <span className="font-medium">Products</span>
              </NavLink>
              <NavLink className={link} to="/categories" onClick={closeMobileMenu}>
                <FaTags className="text-lg" />
                <span className="font-medium">Categories</span>
              </NavLink>
              <NavLink className={link} to="/suppliers" onClick={closeMobileMenu}>
                <FaTruck className="text-lg" />
                <span className="font-medium">Suppliers</span>
              </NavLink>
              <NavLink className={link} to="/customers" onClick={closeMobileMenu}>
                <FaUsers className="text-lg" />
                <span className="font-medium">Customers</span>
              </NavLink>
              <NavLink className={link} to="/invoices" onClick={closeMobileMenu}>
                <FaFileInvoice className="text-lg" />
                <span className="font-medium">Invoices</span>
              </NavLink>
              <NavLink className={link} to="/reports" onClick={closeMobileMenu}>
                <FaChartBar className="text-lg" />
                <span className="font-medium">Reports & Analytics</span>
              </NavLink>
            </nav>

            {/* Logout Button */}
            <div className="mt-8">
              <button 
                onClick={handleLogout} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Log Out
              </button>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-80">
          {/* Header - Mobile Only */}
          <header className="lg:hidden h-16 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 flex items-center justify-between px-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button 
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FaBars className="text-lg text-gray-700" />
              </button>
              
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  POS System
                </h1>
                <div className="text-xs text-gray-500">Point of Sale Management</div>
              </div>
            </div>

            
          </header>

          {/* Main Content Area */}
          <section className="p-2 sm:p-3 lg:p-4">
            <div className="max-w-full">
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}