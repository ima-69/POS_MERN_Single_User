import { useState } from 'react'
import { useGetSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation, useDeleteSupplierMutation, useUpdatePaidAmountMutation } from './suppliersApi'

export default function SuppliersPage() {
  const [search, setSearch] = useState('')
  const { data: suppliers = [] } = useGetSuppliersQuery({ search })
  const [form, setForm] = useState({ name: '', sid: '', phone: '', address: '', purchasedAmount: '', paidAmount: '' })
  const [selectedId, setSelectedId] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [additionalPayment, setAdditionalPayment] = useState('')
  const [additionalPurchase, setAdditionalPurchase] = useState('')
  const [modalAdditionalPurchase, setModalAdditionalPurchase] = useState('')
  const [createSup] = useCreateSupplierMutation()
  const [updateSup] = useUpdateSupplierMutation()
  const [deleteSup] = useDeleteSupplierMutation()
  const [updatePaidAmount] = useUpdatePaidAmountMutation()

  function onEdit(s) { 
    setSelectedId(s._id); 
    setForm({ 
      name: s.name, 
      sid: s.sid || '', 
      phone: s.phone || '', 
      address: s.address || '',
      purchasedAmount: s.purchasedAmount || '',
      paidAmount: s.paidAmount || ''
    }) 
  }
  
  function clear() { 
    setSelectedId(null); 
    setForm({ name: '', sid: '', phone: '', address: '', purchasedAmount: '', paidAmount: '' });
    setAdditionalPurchase('');
  }

  // Helper functions
  const calculateAmountToPay = (purchasedAmount, paidAmount) => {
    return Math.max(0, Number(purchasedAmount) - Number(paidAmount));
  };

  const isSupplierFullyPaid = (supplier) => {
    return calculateAmountToPay(supplier?.purchasedAmount || 0, supplier?.paidAmount || 0) === 0;
  };

  const isCurrentSupplierFullyPaid = () => {
    if (!selectedId) return false;
    const currentSupplier = suppliers.find(s => s._id === selectedId);
    return currentSupplier ? isSupplierFullyPaid(currentSupplier) : false;
  };

  const handleViewMore = (supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierModal(true);
  };

  const closeModal = () => {
    setShowSupplierModal(false);
    setSelectedSupplier(null);
    setAdditionalPayment('');
    setAdditionalPurchase('');
    setModalAdditionalPurchase('');
  };

  const handleAdditionalPayment = async () => {
    if (!selectedSupplier || !additionalPayment || Number(additionalPayment) <= 0) return;
    
    const currentPaidAmount = Number(selectedSupplier.paidAmount || 0);
    const newPaidAmount = currentPaidAmount + Number(additionalPayment);
    
    // Check if additional payment would exceed purchased amount
    if (newPaidAmount > Number(selectedSupplier.purchasedAmount || 0)) {
      return;
    }
    
    try {
      await updatePaidAmount({ 
        id: selectedSupplier._id, 
        paidAmount: newPaidAmount 
      }).unwrap();
      
      // Update the selectedSupplier state with new paid amount for real-time display
      setSelectedSupplier(prev => ({
        ...prev,
        paidAmount: newPaidAmount
      }));
      
      setAdditionalPayment('');
    } catch (error) {
      console.error('Payment update failed:', error);
    }
  };

  const handleAdditionalPurchase = async () => {
    if (!selectedId || !additionalPurchase || Number(additionalPurchase) <= 0) return;
    
    const currentSupplier = suppliers.find(s => s._id === selectedId);
    if (!currentSupplier) return;
    
    const currentPurchasedAmount = Number(currentSupplier.purchasedAmount || 0);
    const newPurchasedAmount = currentPurchasedAmount + Number(additionalPurchase);
    
    try {
      await updateSup({ 
        id: selectedId, 
        ...form,
        purchasedAmount: newPurchasedAmount
      }).unwrap();
      
      // Update the form with new purchased amount
      setForm(prev => ({
        ...prev,
        purchasedAmount: newPurchasedAmount
      }));
      
      setAdditionalPurchase('');
    } catch (error) {
      console.error('Purchase update failed:', error);
    }
  };

  const handleAdditionalPurchaseModal = async () => {
    if (!selectedSupplier || !modalAdditionalPurchase || Number(modalAdditionalPurchase) <= 0) return;
    
    const currentPurchasedAmount = Number(selectedSupplier.purchasedAmount || 0);
    const newPurchasedAmount = currentPurchasedAmount + Number(modalAdditionalPurchase);
    
    try {
      await updateSup({ 
        id: selectedSupplier._id, 
        name: selectedSupplier.name,
        sid: selectedSupplier.sid,
        phone: selectedSupplier.phone,
        address: selectedSupplier.address,
        purchasedAmount: newPurchasedAmount,
        paidAmount: selectedSupplier.paidAmount
      }).unwrap();
      
      // Update the selectedSupplier state with new purchased amount for real-time display
      setSelectedSupplier(prev => ({
        ...prev,
        purchasedAmount: newPurchasedAmount
      }));
      
      setModalAdditionalPurchase('');
    } catch (error) {
      console.error('Purchase update failed:', error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Suppliers Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your supplier database</p>
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            placeholder="Search supplier name..."
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Supplier Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
           <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
             <h2 className="text-xl font-bold text-white">
               {selectedId ? 'Edit Supplier' : 'Add New Supplier'}
             </h2>
             <p className="text-orange-100 mt-1">
               {selectedId ? 'Update supplier information' : 'Fill in supplier details'}
             </p>
           </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {['name', 'sid', 'phone'].map(k => (
                <div key={k} className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 capitalize">
                    {k === 'sid' ? 'Supplier ID' : k === 'name' ? 'Supplier Name' : 'Phone Number'}
                  </label>
                  <input
                    value={form[k]}
                    onChange={e => setForm({ ...form, [k]: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder={`Enter ${k === 'sid' ? 'supplier ID' : k === 'name' ? 'supplier name' : 'phone number'}`}
                  />
                </div>
              ))}
              
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-gray-700">Address</label>
                 <textarea
                   value={form.address}
                   onChange={e => setForm({ ...form, address: e.target.value })}
                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                   rows={3}
                   placeholder="Enter supplier address"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700">Purchased Amount</label>
                   <input
                     type="number"
                     value={form.purchasedAmount}
                     onChange={e => setForm({ ...form, purchasedAmount: e.target.value })}
                     className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                     placeholder="0.00"
                     min="0"
                     step="0.01"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700">Paid Amount</label>
                   <input
                     type="number"
                     value={form.paidAmount}
                     onChange={e => setForm({ ...form, paidAmount: e.target.value })}
                     className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                     placeholder="0.00"
                     min="0"
                     step="0.01"
                   />
                 </div>
               </div>

               {/* Additional Purchase Section */}
               {selectedId && (
                 <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                   <h3 className="text-lg font-semibold text-blue-800">Add New Purchase</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between text-sm">
                       <span className="text-blue-700">Current Purchased Amount:</span>
                       <span className="font-mono font-semibold text-blue-900">
                         Rs {Number(form.purchasedAmount || 0).toFixed(2)}
                       </span>
                     </div>
                     
                     <div className="space-y-2">
                       <label className="text-sm font-semibold text-blue-700">Additional Purchase Amount</label>
                       <input
                         type="number"
                         value={additionalPurchase}
                         onChange={(e) => setAdditionalPurchase(e.target.value)}
                         className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                         placeholder="Enter additional purchase amount"
                         min="0"
                         step="0.01"
                       />
                     </div>

                     <button
                       onClick={handleAdditionalPurchase}
                       disabled={!additionalPurchase || Number(additionalPurchase) <= 0}
                       className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                     >
                       Add Purchase
                     </button>
                   </div>
                 </div>
               )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={async () => { 
                    await createSup(form).unwrap(); 
                    clear() 
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Save
                </button>

                <button
                  disabled={!selectedId}
                  onClick={async () => { 
                    await updateSup({ id: selectedId, ...form }).unwrap(); 
                    clear() 
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update
                </button>

                <button
                  disabled={!selectedId}
                  onClick={async () => { 
                    await deleteSup(selectedId).unwrap(); 
                    clear() 
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
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
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Supplier List</h2>
            <p className="text-gray-500 mt-1">Click on any supplier to edit</p>
          </div>
          
          <div className="overflow-auto max-h-[600px]">
             <table className="w-full">
               <thead className="bg-gray-50 sticky top-0">
                 <tr>
                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier Name</th>
                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                 {suppliers.map(s => (
                   <tr
                     key={s._id}
                     onClick={() => onEdit(s)}
                     className={`cursor-pointer transition-all duration-200 hover:bg-orange-50 ${
                       selectedId === s._id ? 'bg-orange-100 border-l-4 border-orange-500' : ''
                     }`}
                   >
                     <td className="px-4 py-3">
                       <div className="flex items-center gap-3">
                         <div className="font-medium text-gray-900">{s.name}</div>
                         {isSupplierFullyPaid(s) && (
                           <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                             ✓ Paid
                           </span>
                         )}
                       </div>
                     </td>
                     <td className="px-4 py-3">
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           handleViewMore(s);
                         }}
                         className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                         title="View Details"
                       >
                         View More
                       </button>
                     </td>
                   </tr>
                 ))}
                 {suppliers.length === 0 && (
                   <tr>
                     <td colSpan="2" className="px-6 py-12 text-center">
                       <div className="flex flex-col items-center justify-center">
                         <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                         </svg>
                         <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                         <p className="text-gray-500">Start by adding your first supplier above.</p>
                       </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Supplier Details Modal */}
      {showSupplierModal && selectedSupplier && (
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
                    {selectedSupplier.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedSupplier.name}</h2>
                    <p className="text-orange-100">SID: {selectedSupplier.sid || "Not provided"}</p>
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
                      <span className="text-gray-600">Supplier Name:</span>
                      <span className="font-medium text-gray-900">{selectedSupplier.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier ID:</span>
                      <span className="font-medium text-gray-900">{selectedSupplier.sid || "Not provided"}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{selectedSupplier.phone || "Not provided"}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-gray-900">{selectedSupplier.address || "Not provided"}</span>
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
                        Rs {Number(selectedSupplier.purchasedAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid Amount:</span>
                      <span className="font-mono text-gray-900">
                        Rs {Number(selectedSupplier.paidAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount to Pay:</span>
                      <span className={`font-mono font-semibold ${
                        calculateAmountToPay(selectedSupplier.purchasedAmount || 0, selectedSupplier.paidAmount || 0) === 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        Rs {calculateAmountToPay(selectedSupplier.purchasedAmount || 0, selectedSupplier.paidAmount || 0).toFixed(2)}
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
                      calculateAmountToPay(selectedSupplier.purchasedAmount || 0, selectedSupplier.paidAmount || 0) === 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {calculateAmountToPay(selectedSupplier.purchasedAmount || 0, selectedSupplier.paidAmount || 0) === 0 ? "Fully Paid" : "Pending Payment"}
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
                      <span className="font-mono font-semibold">Rs {Number(selectedSupplier.paidAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount to Pay:</span>
                      <span className="font-mono text-red-600 font-semibold">Rs {calculateAmountToPay(selectedSupplier.purchasedAmount || 0, selectedSupplier.paidAmount || 0).toFixed(2)}</span>
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
                      max={calculateAmountToPay(selectedSupplier.purchasedAmount || 0, selectedSupplier.paidAmount || 0)}
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500">
                      Maximum: Rs {calculateAmountToPay(selectedSupplier.purchasedAmount || 0, selectedSupplier.paidAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={handleAdditionalPayment}
                    disabled={!additionalPayment || Number(additionalPayment) <= 0 || Number(additionalPayment) > calculateAmountToPay(selectedSupplier.purchasedAmount || 0, selectedSupplier.paidAmount || 0)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  >
                    Add Payment
                  </button>
                </div>
              </div>

              {/* Additional Purchase Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Purchase</h3>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-700">Current Purchased Amount:</span>
                      <span className="font-mono font-semibold text-blue-900">
                        Rs {Number(selectedSupplier.purchasedAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Additional Purchase Amount</label>
                    <input
                      type="number"
                      value={modalAdditionalPurchase}
                      onChange={(e) => setModalAdditionalPurchase(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter additional purchase amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <button
                    onClick={handleAdditionalPurchaseModal}
                    disabled={!modalAdditionalPurchase || Number(modalAdditionalPurchase) <= 0}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                  >
                    Add Purchase
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    onEdit(selectedSupplier);
                    closeModal();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  Edit Supplier
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