import { useState } from 'react'
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from './categoriesApi'

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const { data: categories = [] } = useGetCategoriesQuery({ search })
  const [form, setForm] = useState({ name: '', code: '' })
  const [selectedId, setSelectedId] = useState(null)
  const [createCat] = useCreateCategoryMutation()
  const [updateCat] = useUpdateCategoryMutation()
  const [deleteCat] = useDeleteCategoryMutation()

  function onEdit(c) { 
    setSelectedId(c._id); 
    setForm({ name: c.name, code: c.code || '' }) 
  }
  
  function clear() { 
    setSelectedId(null); 
    setForm({ name: '', code: '' }) 
  }

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Category Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your product categories</p>
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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
            placeholder="Search category name..."
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Category Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
            <h2 className="text-lg font-bold text-white">
              {selectedId ? 'Edit Category' : 'Add New Category'}
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              {selectedId ? 'Update category information' : 'Fill in category details'}
            </p>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Category Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Enter category name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Category ID</label>
                <input
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Enter category ID"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={async () => { 
                    await createCat(form).unwrap(); 
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
                    await updateCat({ id: selectedId, ...form }).unwrap(); 
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
                    await deleteCat(selectedId).unwrap(); 
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

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Category List</h2>
            <p className="text-gray-500 text-sm mt-1">Click on any category to edit</p>
          </div>
          
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map(c => (
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
                    <td className="px-4 py-3 text-sm text-gray-700">{c.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-500">Start by adding your first category above.</p>
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