import { useState } from 'react'
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useUpdatePaidAmountMutation
} from './customersApi'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const { data: customers = [], refetch } = useGetCustomersQuery({ search })

  const [form, setForm] = useState({
    name: '',
    cid: '',
    phone: '',
    address: ''
  })
  const [selectedId, setSelectedId] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [additionalPayment, setAdditionalPayment] = useState('')

  const [createCus, { isLoading: creating }] = useCreateCustomerMutation()
  const [updateCus, { isLoading: updating }] = useUpdateCustomerMutation()
  const [deleteCus, { isLoading: deleting }] = useDeleteCustomerMutation()
  const [updatePaidAmount] = useUpdatePaidAmountMutation()

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Helper functions
  const calculateAmountToPay = (purchasedAmount, paidAmount) => {
    return Math.max(0, Number(purchasedAmount) - Number(paidAmount));
  };

  const handleViewMore = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const closeModal = () => {
    setShowCustomerModal(false);
    setSelectedCustomer(null);
    setAdditionalPayment('');
  };

  const handleAdditionalPayment = async () => {
    if (!selectedCustomer || !additionalPayment || Number(additionalPayment) <= 0) return;
    
    const currentPaidAmount = Number(selectedCustomer.paidAmount || 0);
    const newPaidAmount = currentPaidAmount + Number(additionalPayment);
    
    // Check if additional payment would exceed purchased amount
    if (newPaidAmount > Number(selectedCustomer.purchasedAmount || 0)) {
      return;
    }
    
    try {
      await updatePaidAmount({ 
        id: selectedCustomer._id, 
        paidAmount: newPaidAmount 
      }).unwrap();
      
      // Update the selectedCustomer state with new paid amount for real-time display
      setSelectedCustomer(prev => ({
        ...prev,
        paidAmount: newPaidAmount
      }));
      
      setAdditionalPayment('');
    } catch (error) {
      console.error('Payment update failed:', error);
    }
  };

  function onEdit(c) {
    setSelectedId(c._id)
    setForm({
      name: c.name || '',
      cid: c.cid || '',
      phone: c.phone || '',
      address: c.address || ''
    })
    setErrorMsg('')
    setSuccessMsg('')
  }

  function clear() {
    setSelectedId(null)
    setForm({ name: '', cid: '', phone: '', address: '' })
    setErrorMsg('')
    setSuccessMsg('')
  }

  async function handleSave(e) {
    e?.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    if (!form.name.trim()) {
      setErrorMsg('Customer name is required')
      return
    }
    try {
      await createCus(form).unwrap()
      setSearch('') // Clear search to show all customers including the new one
      await refetch() // refresh the table immediately
      clear()
      setSuccessMsg('Customer saved')
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Save failed')
    }
  }

  async function handleUpdate() {
    setErrorMsg('')
    setSuccessMsg('')
    if (!selectedId) return
    try {
      await updateCus({ id: selectedId, ...form }).unwrap()
      setSearch('') // Clear search to show all customers including the updated one
      await refetch()
      clear()
      setSuccessMsg('Customer updated')
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Update failed')
    }
  }

  async function handleDelete() {
    setErrorMsg('')
    setSuccessMsg('')
    if (!selectedId) return
    try {
      await deleteCus(selectedId).unwrap()
      setSearch('') // Clear search after delete to show remaining customers
      await refetch()
      clear()
      setSuccessMsg('Customer deleted')
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Customers Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your customer database</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <div className="text-xs font-medium text-orange-800">
              {new Date().toDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Search customer name..."
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Customer Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <h2 className="text-xl font-bold text-white">
              {selectedId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <p className="text-orange-100 mt-1">
              {selectedId ? 'Update customer information' : 'Fill in customer details'}
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Customer Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Customer ID</label>
                <input
                  value={form.cid}
                  onChange={(e) => setForm({ ...form, cid: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter customer ID"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Telephone No</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Enter customer address"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={handleSave}
                  disabled={creating}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  {creating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Save
                    </>
                  )}
                </button>

                <button
                  onClick={handleUpdate}
                  disabled={!selectedId || updating}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update
                    </>
                  )}
                </button>

                <button
                  onClick={handleDelete}
                  disabled={!selectedId || deleting}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>

                <button 
                  onClick={clear} 
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              </div>

              {/* Status Messages */}
              {(errorMsg || successMsg) && (
                <div className="space-y-2">
                  {errorMsg && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{errorMsg}</span>
                    </div>
                  )}
                  {successMsg && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{successMsg}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Customer List</h2>
            <p className="text-gray-500 mt-1">Click on any customer to edit</p>
          </div>
          
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => onEdit(c)}
                    className={`cursor-pointer transition-all duration-200 hover:bg-orange-50 ${
                      selectedId === c._id ? 'bg-orange-100 border-l-4 border-orange-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMore(c);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                        title="View Details"
                      >
                        View More
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                        <p className="text-gray-500">Start by adding your first customer above.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 transform">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {selectedCustomer.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                    <p className="text-orange-100">CID: {selectedCustomer.cid || "Not provided"}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-orange-200 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Basic Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Name:</span>
                      <span className="font-medium text-gray-900">{selectedCustomer.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer ID:</span>
                      <span className="font-medium text-gray-900">{selectedCustomer.cid || "Not provided"}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{selectedCustomer.phone || "Not provided"}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-gray-900">{selectedCustomer.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Financial Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Financial Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchased Amount:</span>
                      <span className="font-mono text-gray-900">
                        Rs {Number(selectedCustomer.purchasedAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid Amount:</span>
                      <span className="font-mono text-gray-900">
                        Rs {Number(selectedCustomer.paidAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount to Pay:</span>
                      <span className={`font-mono font-semibold ${
                        calculateAmountToPay(selectedCustomer.purchasedAmount || 0, selectedCustomer.paidAmount || 0) === 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        Rs {calculateAmountToPay(selectedCustomer.purchasedAmount || 0, selectedCustomer.paidAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status</h3>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      calculateAmountToPay(selectedCustomer.purchasedAmount || 0, selectedCustomer.paidAmount || 0) === 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {calculateAmountToPay(selectedCustomer.purchasedAmount || 0, selectedCustomer.paidAmount || 0) === 0 ? "Fully Paid" : "Pending Payment"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Payment Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Payment</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Current Paid Amount:</span>
                      <span className="font-mono font-semibold">Rs {Number(selectedCustomer.paidAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount to Pay:</span>
                      <span className="font-mono text-red-600 font-semibold">Rs {calculateAmountToPay(selectedCustomer.purchasedAmount || 0, selectedCustomer.paidAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Additional Payment Amount</label>
                    <input
                      type="number"
                      value={additionalPayment}
                      onChange={(e) => setAdditionalPayment(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter additional payment amount"
                      min="0"
                      max={calculateAmountToPay(selectedCustomer.purchasedAmount || 0, selectedCustomer.paidAmount || 0)}
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500">
                      Maximum: Rs {calculateAmountToPay(selectedCustomer.purchasedAmount || 0, selectedCustomer.paidAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={handleAdditionalPayment}
                    disabled={!additionalPayment || Number(additionalPayment) <= 0 || Number(additionalPayment) > calculateAmountToPay(selectedCustomer.purchasedAmount || 0, selectedCustomer.paidAmount || 0)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  >
                    Add Payment
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    onEdit(selectedCustomer);
                    closeModal();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  Edit Customer
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}