import { useState, useRef } from 'react'
import { useGetMonthlyInvoicesQuery, useGetYearlyInvoicesQuery } from './invoicesApi'
import { FaCalendarAlt, FaChartBar, FaFileExport, FaPrint } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print'

export default function InvoiceReports() {
  const [reportType, setReportType] = useState('monthly')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  // Print functionality
  const printRef = useRef(null)
  const printNow = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${reportType === 'monthly' ? 'Monthly' : 'Yearly'} Invoice Report`,
    pageStyle: `
      @media print {
        body { 
          margin: 0; 
          padding: 0; 
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.4;
        }
        .no-print { 
          display: none !important; 
        }
        .print-content {
          color: #000 !important;
          background: #fff !important;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5 !important;
          font-weight: bold;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          text-align: center;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .monthly-breakdown {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .month-card {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
      }
    `
  })

  // Fetch monthly report
  const { data: monthlyData, isLoading: monthlyLoading } = useGetMonthlyInvoicesQuery({
    year: selectedYear,
    month: selectedMonth
  })

  // Fetch yearly report
  const { data: yearlyData, isLoading: yearlyLoading } = useGetYearlyInvoicesQuery({
    year: selectedYear
  })

  const isLoading = reportType === 'monthly' ? monthlyLoading : yearlyLoading
  const data = reportType === 'monthly' ? monthlyData : yearlyData

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handleExport = () => {
    if (!data) {
      alert('No data available to export')
      return
    }

    const exportData = {
      reportType: reportType === 'monthly' ? 'Monthly' : 'Yearly',
      period: reportType === 'monthly' 
        ? `${monthNames[selectedMonth - 1]} ${selectedYear}`
        : `${selectedYear}`,
      generatedOn: new Date().toLocaleDateString(),
      stats: data.stats || {},
      monthlyStats: data.monthlyStats || [],
      invoices: data.sales || []
    }

    const fileName = `${exportData.reportType}_Invoice_Report_${exportData.period.replace(/\s+/g, '_')}.csv`
    const csvContent = generateCSV(exportData)
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateCSV = (data) => {
    let csv = ''
    
    // Add report header
    csv += `${data.reportType} Invoice Report - ${data.period}\n`
    csv += `Generated on: ${data.generatedOn}\n\n`
    
    // Add summary statistics
    csv += 'SUMMARY STATISTICS\n'
    csv += 'Metric,Value\n'
    csv += `Total Invoices,${data.stats.totalInvoices || 0}\n`
    csv += `Total Revenue,$${data.stats.totalRevenue?.toFixed(2) || '0.00'}\n`
    csv += `Total Paid,$${data.stats.totalPaid?.toFixed(2) || '0.00'}\n`
    csv += `Outstanding,$${data.stats.totalBalance?.toFixed(2) || '0.00'}\n\n`
    
    // Add monthly breakdown for yearly reports
    if (data.reportType === 'Yearly' && data.monthlyStats.length > 0) {
      csv += 'MONTHLY BREAKDOWN\n'
      csv += 'Month,Invoices,Revenue,Paid,Balance\n'
      data.monthlyStats.forEach(monthData => {
        csv += `${monthNames[monthData._id - 1]},${monthData.totalInvoices},$${monthData.totalRevenue?.toFixed(2) || '0.00'},$${monthData.totalPaid?.toFixed(2) || '0.00'},$${monthData.totalBalance?.toFixed(2) || '0.00'}\n`
      })
      csv += '\n'
    }
    
    // Add invoice details
    csv += 'INVOICE DETAILS\n'
    csv += 'Invoice #,Date,Customer,Total,Paid,Balance\n'
    data.invoices.forEach(invoice => {
      csv += `#${invoice.invoiceNo},${new Date(invoice.date).toLocaleDateString()},${invoice.customer?.name || 'Walk-in'},$${invoice.grandTotal.toFixed(2)},$${invoice.paidAmount.toFixed(2)},$${invoice.balance.toFixed(2)}\n`
    })
    
    return csv
  }

  const handlePrint = () => {
    printNow()
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-3 sm:p-4 no-print">
        <div className="flex flex-col gap-4">
          {/* Top Row - Title and Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <FaChartBar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Invoice Reports</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReportType('monthly')}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    reportType === 'monthly'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setReportType('yearly')}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    reportType === 'yearly'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <FaFileExport className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <FaPrint className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <label className="text-xs sm:text-sm font-medium text-gray-700">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-2 sm:px-3 py-1 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {reportType === 'monthly' && (
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-1 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {monthNames.map((month, index) => (
                    <option key={index + 1} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        {isLoading ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-xs sm:text-sm text-gray-500">Loading report...</p>
          </div>
        ) : (
          <>
            {/* Report Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                {reportType === 'monthly' 
                  ? `${monthNames[selectedMonth - 1]} ${selectedYear} Invoice Report`
                  : `${selectedYear} Annual Invoice Report`
                }
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Stats Summary */}
            {data?.stats && (
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{data.stats.totalInvoices}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Invoices</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                    <p className="text-lg sm:text-2xl font-bold text-green-600">${data.stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg sm:text-2xl font-bold text-purple-600">${data.stats.totalPaid?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Paid</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
                    <p className="text-lg sm:text-2xl font-bold text-red-600">${data.stats.totalBalance?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Outstanding</p>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Breakdown (for yearly reports) */}
            {reportType === 'yearly' && data?.monthlyStats && (
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <h4 className="text-sm sm:text-md font-semibold text-gray-800 mb-3">Monthly Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.monthlyStats.map((monthData, index) => (
                    <div key={index} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-800 text-sm sm:text-base">{monthNames[monthData._id - 1]}</h5>
                      <div className="mt-2 space-y-1 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Invoices:</span>
                          <span className="font-medium">{monthData.totalInvoices}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium text-green-600">${monthData.totalRevenue?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid:</span>
                          <span className="font-medium text-blue-600">${monthData.totalPaid?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Balance:</span>
                          <span className="font-medium text-red-600">${monthData.totalBalance?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice List */}
            <div className="p-3 sm:p-4">
              <h4 className="text-sm sm:text-md font-semibold text-gray-800 mb-3">Invoice Details</h4>
              <div className="overflow-auto max-h-[300px] sm:max-h-[400px]">
                {/* Mobile Card View */}
                <div className="block sm:hidden">
                  {data?.sales?.map(invoice => (
                    <div key={invoice._id} className="p-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">#{invoice.invoiceNo}</p>
                          <p className="text-xs text-gray-600">{invoice.customer?.name || 'Walk-in'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">${invoice.grandTotal.toFixed(2)}</p>
                          <p className="text-xs text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                          <span>Paid: ${invoice.paidAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-red-600">Balance: ${invoice.balance.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Paid</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data?.sales?.map(invoice => (
                        <tr key={invoice._id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">#{invoice.invoiceNo}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{invoice.customer?.name || 'Walk-in'}</td>
                          <td className="px-3 py-2 text-sm text-gray-700 text-right">${invoice.grandTotal.toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-green-600 text-right">${invoice.paidAmount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-red-600 text-right">${invoice.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Hidden Print Content */}
            <div className="hidden">
              <div ref={printRef} className="print-content">
                {/* Print Header */}
                <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {reportType === 'monthly' 
                      ? `${monthNames[selectedMonth - 1]} ${selectedYear} Invoice Report`
                      : `${selectedYear} Annual Invoice Report`
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>

                {/* Print Stats Summary */}
                {data?.stats && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Summary Statistics</h4>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <p className="text-2xl font-bold text-blue-600">{data.stats.totalInvoices}</p>
                        <p className="text-sm text-gray-600">Total Invoices</p>
                      </div>
                      <div className="stat-card">
                        <p className="text-2xl font-bold text-green-600">${data.stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                      </div>
                      <div className="stat-card">
                        <p className="text-2xl font-bold text-purple-600">${data.stats.totalPaid?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-600">Total Paid</p>
                      </div>
                      <div className="stat-card">
                        <p className="text-2xl font-bold text-red-600">${data.stats.totalBalance?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-600">Outstanding</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Print Monthly Breakdown */}
                {reportType === 'yearly' && data?.monthlyStats && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Monthly Breakdown</h4>
                    <div className="monthly-breakdown">
                      {data.monthlyStats.map((monthData, index) => (
                        <div key={index} className="month-card">
                          <h5 className="font-semibold text-gray-800 mb-2">{monthNames[monthData._id - 1]}</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Invoices:</span>
                              <span className="font-medium">{monthData.totalInvoices}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Revenue:</span>
                              <span className="font-medium text-green-600">${monthData.totalRevenue?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Paid:</span>
                              <span className="font-medium text-blue-600">${monthData.totalPaid?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Balance:</span>
                              <span className="font-medium text-red-600">${monthData.totalBalance?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Print Invoice List */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Invoice Details</h4>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Paid</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data?.sales?.map(invoice => (
                        <tr key={invoice._id}>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">#{invoice.invoiceNo}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{invoice.customer?.name || 'Walk-in'}</td>
                          <td className="px-3 py-2 text-sm text-gray-700 text-right">${invoice.grandTotal.toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-green-600 text-right">${invoice.paidAmount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-red-600 text-right">${invoice.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
