import { useGetInvoiceStatsQuery } from '../invoices/invoicesApi'
import { FaChartBar, FaCalendarAlt, FaFileInvoice, FaDownload, FaFilter } from 'react-icons/fa'
import InvoiceReports from '../invoices/InvoiceReports.jsx'

export default function ReportsPage() {
  // Fetch invoice stats
  const { data: statsData } = useGetInvoiceStatsQuery({})
  const stats = statsData || {}

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-sm text-gray-500 mt-1">View detailed reports and analytics for your business</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 self-start sm:self-auto">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="text-xs font-medium text-orange-800">
                {new Date().toDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Invoices</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalInvoices || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <FaFileInvoice className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">RS {Number(stats.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <FaDownload className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Amount Paid</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">RS {Number(stats.totalPaid || 0).toFixed(2)}</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <FaCalendarAlt className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Outstanding</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">RS {Number(stats.totalBalance || 0).toFixed(2)}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
                <FaFilter className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>


        {/* Reports Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Detailed Reports</h2>
            <p className="text-xs sm:text-sm text-gray-600">Comprehensive analysis of your business performance</p>
          </div>
          <div className="p-3 sm:p-6">
            <InvoiceReports />
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
