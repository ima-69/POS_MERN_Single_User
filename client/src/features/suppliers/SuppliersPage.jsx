import { useState } from 'react'
import { useGetSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation, useDeleteSupplierMutation } from './suppliersApi'

export default function SuppliersPage() {
  const [search, setSearch] = useState('')
  const { data: suppliers = [] } = useGetSuppliersQuery({ search })
  const [form, setForm] = useState({ name: '', sid: '', phone: '', address: '' })
  const [selectedId, setSelectedId] = useState(null)
  const [createSup] = useCreateSupplierMutation()
  const [updateSup] = useUpdateSupplierMutation()
  const [deleteSup] = useDeleteSupplierMutation()

  function onEdit(s) { 
    setSelectedId(s._id); 
    setForm({ name: s.name, sid: s.sid || '', phone: s.phone || '', address: s.address || '' }) 
  }
  
  function clear() { 
    setSelectedId(null); 
    setForm({ name: '', sid: '', phone: '', address: '' }) 
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Suppliers Management
            </h1>
            <p className="text-gray-500 mt-1">Manage your supplier database</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <div className="text-sm font-medium text-orange-800">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder={`Enter ${k === 'sid' ? 'supplier ID' : k === 'name' ? 'supplier name' : 'phone number'}`}
                  />
                </div>
              ))}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Address</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Enter supplier address"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={async () => { 
                    await createSup(form).unwrap(); 
                    clear() 
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
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
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
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
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>

                <button 
                  onClick={clear} 
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {s.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="font-medium text-gray-900">{s.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s.sid}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{s.address}</td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
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
    </div>
  )
}