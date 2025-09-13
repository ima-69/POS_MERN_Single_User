import React, { useState, useRef, useEffect } from 'react'
import { useGetInvoicesQuery, useGetInvoiceStatsQuery } from './invoicesApi'
import { useGetCustomersQuery } from '../customers/customersApi'
import { useReactToPrint } from 'react-to-print'
import { FaFileInvoice, FaDownload, FaEye, FaCalendarAlt, FaFilter, FaPrint } from 'react-icons/fa'
import logo from '../../assets/logo.png'

// Printable Invoice Component (hidden, for printing only)
const PrintableInvoice = React.forwardRef(({ invoice }, ref) => {
  if (!invoice) return null
  const date = new Date(invoice.date || invoice.createdAt || Date.now())

  return (
    <div
      ref={ref}
      className="bg-white text-black h-[297mm] w-[210mm] p-6 font-sans shadow-lg overflow-hidden" 
      style={{
        fontSize: "10pt",
        lineHeight: "1.3",
        color: "#000",
        backgroundColor: "#fff",
        border: "1px solid #e5e5e5",
      }}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4 border-b-2 border-orange-600 pb-3">
        {/* Logo Section */}
        <div className="flex-shrink-0">
          <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
            <img src={logo} alt="Logo" className="h-12 w-12" />
          </div>
        </div>

        {/* Company Details Section */}
        <div className="flex-grow text-right ml-4">
          <h1 className="text-lg font-bold mb-1 uppercase tracking-wide text-orange-800">
            PRASANNA PRINTERS & COMMUNICATION
          </h1>
          <div className="text-xs mb-1 text-gray-700">
            No. 102, Janaudana Gama, Uva Gemunupura,<br />
            Mapakadawewa, Mahiyangana
          </div>
          <div className="text-xs mb-1 text-gray-600">
            📞 +94 76 701 3643 | +94 76 931 3643
          </div>
          <div className="text-xs text-orange-600">
            📧 prasannacom98@gmail.com
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-sm">
            <span className="font-bold text-orange-800">Invoice No:</span>
            <div className="text-base font-bold text-orange-600">
              #{String(invoice.invoiceNo).padStart(5, "0")}
            </div>
          </div>
          <div className="text-sm text-center">
            <span className="font-bold text-orange-800">Date:</span>
            <div className="font-semibold">{date.toLocaleDateString('en-GB')}</div>
          </div>
          <div className="text-sm text-right">
            <span className="font-bold text-orange-800">Time:</span>
            <div className="font-semibold">{date.toLocaleTimeString('en-US', { 
              hour12: true, 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {invoice.customer && (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-sm">
            <span className="font-bold text-gray-800">Customer:</span>
            <div className="text-gray-700">
              <div className="font-semibold">{invoice.customer.name}</div>
              {invoice.customer.email && <div className="text-xs">{invoice.customer.email}</div>}
              {invoice.customer.phone && <div className="text-xs">{invoice.customer.phone}</div>}
              {invoice.customer.address && <div className="text-xs">{invoice.customer.address}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="mb-4">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-orange-600 text-white">
              <th className="text-left py-2 px-2 font-bold text-xs">#</th>
              <th className="text-left py-2 px-2 font-bold text-xs">ITEM DESCRIPTION</th>
              <th className="text-left py-2 px-2 font-bold text-xs">BARCODE</th>
              <th className="text-right py-2 px-2 font-bold text-xs">QTY</th>
              <th className="text-right py-2 px-2 font-bold text-xs">UNIT PRICE</th>
              <th className="text-right py-2 px-2 font-bold text-xs">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}>
                <td className="py-2 px-2 text-xs font-medium">{i + 1}</td>
                <td className="py-2 px-2 text-xs font-medium text-gray-800">{item.name}</td>
                <td className="py-2 px-2 text-xs text-gray-600 font-mono">{item.barcode || '-'}</td>
                <td className="py-2 px-2 text-xs text-right font-semibold">{item.qty}</td>
                <td className="py-2 px-2 text-xs text-right">RS {Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-2 px-2 text-xs text-right font-bold text-orange-600">RS {Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
            {/* Add empty rows for consistent layout */}
            {Array.from({ length: Math.max(0, 2 - invoice.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className={`${(invoice.items.length + i) % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100`}>
                <td className="py-2 px-2 text-xs">&nbsp;</td>
                <td className="py-2 px-2 text-xs">&nbsp;</td>
                <td className="py-2 px-2 text-xs">&nbsp;</td>
                <td className="py-2 px-2 text-xs">&nbsp;</td>
                <td className="py-2 px-2 text-xs">&nbsp;</td>
                <td className="py-2 px-2 text-xs">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="mb-4">
        <div className="flex justify-end">
          <div className="w-72 bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="border-t-2 border-orange-600 pt-3">
              <div className="flex justify-between py-1 text-sm">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">RS {Number(invoice.subTotal).toFixed(2)}</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 text-sm text-red-600">
                  <span className="font-medium">Discount:</span>
                  <span className="font-semibold">- RS {Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}

              {invoice.tax > 0 && (
                <div className="flex justify-between py-1 text-sm">
                  <span className="font-medium">Tax:</span>
                  <span className="font-semibold">RS {Number(invoice.tax).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 text-base font-bold border-t-2 border-orange-600 bg-orange-600 text-white px-2 rounded">
                <span>GRAND TOTAL:</span>
                <span>RS {Number(invoice.grandTotal).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 text-sm mt-2">
                <span className="font-medium">Amount Paid:</span>
                <span className="font-semibold text-orange-600">RS {Number(invoice.paidAmount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 text-sm">
                <span className="font-medium">Balance/Change:</span>
                <span
                  className={
                    Number(invoice.balance) > 0 
                      ? "text-red-600 font-bold" 
                      : Number(invoice.balance) < 0 
                      ? "text-orange-600 font-bold" 
                      : "font-medium"
                  }
                >
                  RS {Number(invoice.balance).toFixed(2)}
                  {Number(invoice.balance) > 0 && " (Due)"}
                  {Number(invoice.balance) < 0 && " (Change)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="pt-4">
        <div className="border-t-2 border-orange-600 pt-4">
          <div className="text-center">
            <div className="text-sm font-bold mb-3 text-orange-800 bg-orange-50 py-1 px-3 rounded-lg inline-block">
              THANK YOU FOR YOUR BUSINESS! 
            </div>
            
            <div className="text-xs text-gray-600 mb-3">
              "Your satisfaction is our priority"
            </div>

            {/* Customer Info Section */}
            {invoice.customer && (
              <div className="mb-3 text-xs">
                <span className="font-medium">Customer: </span>
                <span className="text-orange-600 font-semibold">{invoice.customer.name}</span>
              </div>
            )}

            {/* Cashier Info */}
            {invoice.cashier && (
              <div className="mb-3 text-xs">
                <span className="font-medium">Cashier: </span>
                <span className="text-orange-600 font-semibold">{invoice.cashier.name}</span>
              </div>
            )}

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-6 mt-4 pt-3 border-t border-gray-300">
              <div className="text-left">
                <div className="text-xs mb-4 font-medium text-gray-600">Customer Signature:</div>
                <div className="border-b-2 border-gray-400 w-24"></div>
              </div>
              <div className="text-right">
                <div className="text-xs mb-4 font-medium text-gray-600">Cashier Signature:</div>
                <div className="border-b-2 border-gray-400 w-24 ml-auto"></div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <div>📄 Computer-generated invoice</div>
              <div>🖨️ Printed: {new Date().toLocaleString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Professional Invoice Component using Sales Receipt Style
const ProfessionalInvoice = ({ invoice, onClose }) => {
  const date = new Date(invoice.date || invoice.createdAt || Date.now())

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 sm:p-4 flex items-center justify-between no-print">
          <h2 className="text-lg sm:text-xl font-bold text-white truncate">Invoice #{invoice.invoiceNo}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
          <div className="bg-white text-black h-[297mm] w-[210mm] p-4 sm:p-6 font-sans shadow-lg overflow-hidden mx-auto" style={{
            fontSize: "10pt",
            lineHeight: "1.3",
            color: "#000",
            backgroundColor: "#fff",
            border: "1px solid #e5e5e5",
          }}>
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4 border-b-2 border-orange-600 pb-3">
              {/* Logo Section */}
              <div className="flex-shrink-0">
                <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                  <img src={logo} alt="Logo" className="h-12 w-12" />
                </div>
              </div>

              {/* Company Details Section */}
              <div className="flex-grow text-right ml-4">
                <h1 className="text-lg font-bold mb-1 uppercase tracking-wide text-orange-800">
                  PRASANNA PRINTERS & COMMUNICATION
                </h1>
                <div className="text-xs mb-1 text-gray-700">
                  No. 102, Janaudana Gama, Uva Gemunupura,<br />
                  Mapakadawewa, Mahiyangana
                </div>
                <div className="text-xs mb-1 text-gray-600">
                  📞 +94 76 701 3643 | +94 76 931 3643
                </div>
                <div className="text-xs text-orange-600">
                  📧 prasannacom98@gmail.com
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm">
                  <span className="font-bold text-orange-800">Invoice No:</span>
                  <div className="text-base font-bold text-orange-600">
                    #{String(invoice.invoiceNo).padStart(5, "0")}
                  </div>
                </div>
                <div className="text-sm text-center">
                  <span className="font-bold text-orange-800">Date:</span>
                  <div className="font-semibold">{date.toLocaleDateString('en-GB')}</div>
                </div>
                <div className="text-sm text-right">
                  <span className="font-bold text-orange-800">Time:</span>
                  <div className="font-semibold">{date.toLocaleTimeString('en-US', { 
                    hour12: true, 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {invoice.customer && (
              <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="text-sm">
                  <span className="font-bold text-gray-800">Customer:</span>
                  <div className="text-gray-700">
                    <div className="font-semibold">{invoice.customer.name}</div>
                    {invoice.customer.email && <div className="text-xs">{invoice.customer.email}</div>}
                    {invoice.customer.phone && <div className="text-xs">{invoice.customer.phone}</div>}
                    {invoice.customer.address && <div className="text-xs">{invoice.customer.address}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="mb-4">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-orange-600 text-white">
                    <th className="text-left py-2 px-2 font-bold text-xs">#</th>
                    <th className="text-left py-2 px-2 font-bold text-xs">ITEM DESCRIPTION</th>
                    <th className="text-left py-2 px-2 font-bold text-xs">BARCODE</th>
                    <th className="text-right py-2 px-2 font-bold text-xs">QTY</th>
                    <th className="text-right py-2 px-2 font-bold text-xs">UNIT PRICE</th>
                    <th className="text-right py-2 px-2 font-bold text-xs">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}>
                      <td className="py-2 px-2 text-xs font-medium">{i + 1}</td>
                      <td className="py-2 px-2 text-xs font-medium text-gray-800">{item.name}</td>
                      <td className="py-2 px-2 text-xs text-gray-600 font-mono">{item.barcode || '-'}</td>
                      <td className="py-2 px-2 text-xs text-right font-semibold">{item.qty}</td>
                      <td className="py-2 px-2 text-xs text-right">RS {Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold text-orange-600">RS {Number(item.lineTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Add empty rows for consistent layout */}
                  {Array.from({ length: Math.max(0, 2 - invoice.items.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className={`${(invoice.items.length + i) % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100`}>
                      <td className="py-2 px-2 text-xs">&nbsp;</td>
                      <td className="py-2 px-2 text-xs">&nbsp;</td>
                      <td className="py-2 px-2 text-xs">&nbsp;</td>
                      <td className="py-2 px-2 text-xs">&nbsp;</td>
                      <td className="py-2 px-2 text-xs">&nbsp;</td>
                      <td className="py-2 px-2 text-xs">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="mb-4">
              <div className="flex justify-end">
                <div className="w-72 bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="border-t-2 border-orange-600 pt-3">
                    <div className="flex justify-between py-1 text-sm">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-semibold">RS {Number(invoice.subTotal).toFixed(2)}</span>
                    </div>

                    {invoice.discount > 0 && (
                      <div className="flex justify-between py-1 text-sm text-red-600">
                        <span className="font-medium">Discount:</span>
                        <span className="font-semibold">- RS {Number(invoice.discount).toFixed(2)}</span>
                      </div>
                    )}

                    {invoice.tax > 0 && (
                      <div className="flex justify-between py-1 text-sm">
                        <span className="font-medium">Tax:</span>
                        <span className="font-semibold">RS {Number(invoice.tax).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-2 text-base font-bold border-t-2 border-orange-600 bg-orange-600 text-white px-2 rounded">
                      <span>GRAND TOTAL:</span>
                      <span>RS {Number(invoice.grandTotal).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-1 text-sm mt-2">
                      <span className="font-medium">Amount Paid:</span>
                      <span className="font-semibold text-orange-600">RS {Number(invoice.paidAmount).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-1 text-sm">
                      <span className="font-medium">Balance/Change:</span>
                      <span
                        className={
                          Number(invoice.balance) > 0 
                            ? "text-red-600 font-bold" 
                            : Number(invoice.balance) < 0 
                            ? "text-orange-600 font-bold" 
                            : "font-medium"
                        }
                      >
                        RS {Number(invoice.balance).toFixed(2)}
                        {Number(invoice.balance) > 0 && " (Due)"}
                        {Number(invoice.balance) < 0 && " (Change)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="pt-4">
              <div className="border-t-2 border-orange-600 pt-4">
                <div className="text-center">
                  <div className="text-sm font-bold mb-3 text-orange-800 bg-orange-50 py-1 px-3 rounded-lg inline-block">
                    THANK YOU FOR YOUR BUSINESS! 
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-3">
                    "Your satisfaction is our priority"
                  </div>

                  {/* Customer Info Section */}
                  {invoice.customer && (
                    <div className="mb-3 text-xs">
                      <span className="font-medium">Customer: </span>
                      <span className="text-orange-600 font-semibold">{invoice.customer.name}</span>
                    </div>
                  )}

                  {/* Cashier Info */}
                  {invoice.cashier && (
                    <div className="mb-3 text-xs">
                      <span className="font-medium">Cashier: </span>
                      <span className="text-orange-600 font-semibold">{invoice.cashier.name}</span>
                    </div>
                  )}

                  {/* Signature Section */}
                  <div className="grid grid-cols-2 gap-6 mt-4 pt-3 border-t border-gray-300">
                    <div className="text-left">
                      <div className="text-xs mb-4 font-medium text-gray-600">Customer Signature:</div>
                      <div className="border-b-2 border-gray-400 w-24"></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs mb-4 font-medium text-gray-600">Cashier Signature:</div>
                      <div className="border-b-2 border-gray-400 w-24 ml-auto"></div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <div>📄 Computer-generated invoice</div>
                    <div>🖨️ Printed: {new Date().toLocaleString('en-GB', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceToPrint, setInvoiceToPrint] = useState(null)

  // Print functionality (like sales page)
  const printRef = useRef(null)
  const printNow = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Invoice',
    onAfterPrint: () => setInvoiceToPrint(null)
  })

  // Fetch invoices
  const { data: invoicesData, isLoading } = useGetInvoicesQuery({
    page,
    limit: 10,
    search,
    startDate,
    endDate,
    customerId
  })

  // Fetch invoice stats
  const { data: statsData } = useGetInvoiceStatsQuery({
    startDate,
    endDate,
    customerId
  })

  // Fetch customers for filter
  const { data: customers = [] } = useGetCustomersQuery({})

  const invoices = invoicesData?.data || []
  const totalPages = invoicesData?.totalPages || 1
  const stats = statsData || {}

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
  }

  const handleCloseInvoice = () => {
    setSelectedInvoice(null)
  }

  const handlePrintBill = (invoice) => {
    setInvoiceToPrint(invoice)
    
    // Wait a tick so PrintableInvoice mounts with the invoice, then print
    setTimeout(() => {
      if (!printRef.current) {
        console.log('Print ref not mounted yet')
        return
      }
      printNow()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Invoice Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">View and manage all issued invoices</p>
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

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
              />
            </div>

            <div>
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
              />
            </div>

            <div>
              <input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
              />
            </div>

            <div>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
              >
                <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearch('')
                  setStartDate('')
                  setEndDate('')
                  setCustomerId('')
                  setPage(1)
                }}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Invoice List</h2>
            <p className="text-xs sm:text-sm text-gray-600">View and manage all issued invoices</p>
          </div>

          {isLoading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <FaFileInvoice className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-xs sm:text-sm text-gray-600">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[400px] sm:max-h-[500px]">
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {invoices.map((invoice) => (
                  <div key={invoice._id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          #{String(invoice.invoiceNo).padStart(5, "0")}
                        </p>
                        <p className="text-xs text-gray-600">
                          {invoice.customer?.name || 'Walk-in Customer'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          RS {Number(invoice.grandTotal).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-xs text-gray-600">
                        <span>Paid: RS {Number(invoice.paidAmount).toFixed(2)}</span>
                      </div>
                      <div className="text-xs">
                        <span className={`font-medium ${
                          Number(invoice.balance) > 0 
                            ? 'text-red-600' 
                            : Number(invoice.balance) < 0 
                            ? 'text-orange-600' 
                            : 'text-gray-900'
                        }`}>
                          RS {Number(invoice.balance).toFixed(2)}
                          {Number(invoice.balance) > 0 && ' (Due)'}
                          {Number(invoice.balance) < 0 && ' (Change)'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs font-semibold transform hover:scale-105 active:scale-95"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handlePrintBill(invoice)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs font-semibold transform hover:scale-105 active:scale-95"
                      >
                        Print Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Paid</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900">
                          #{String(invoice.invoiceNo).padStart(5, "0")}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-900">
                          {invoice.customer?.name || 'Walk-in Customer'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-900">
                          {new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-900">
                          RS {Number(invoice.grandTotal).toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-gray-900">
                          RS {Number(invoice.paidAmount).toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm">
                          <span className={`font-medium ${
                            Number(invoice.balance) > 0 
                              ? 'text-red-600' 
                              : Number(invoice.balance) < 0 
                              ? 'text-orange-600' 
                              : 'text-gray-900'
                          }`}>
                            RS {Number(invoice.balance).toFixed(2)}
                            {Number(invoice.balance) > 0 && ' (Due)'}
                            {Number(invoice.balance) < 0 && ' (Change)'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs font-semibold transform hover:scale-105 active:scale-95"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handlePrintBill(invoice)}
                              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs font-semibold transform hover:scale-105 active:scale-95"
                            >
                              Print Bill
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-3 sm:px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Professional Invoice Modal */}
      {selectedInvoice && (
        <ProfessionalInvoice 
          invoice={selectedInvoice} 
          onClose={handleCloseInvoice} 
        />
      )}

      {/* Keep printable content mounted; visually hidden but not display:none */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 0 }}>
        <PrintableInvoice ref={printRef} invoice={invoiceToPrint} />
      </div>
    </div>
  )
}
