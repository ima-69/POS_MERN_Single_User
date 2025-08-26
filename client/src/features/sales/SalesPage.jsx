import { useEffect, useMemo, useRef, useState } from 'react'
import { useGetProductsQuery, useLazyGetProductByBarcodeQuery } from '../products/productsApi'
import { useGetNextInvoiceQuery, useCreateSaleMutation } from './salesApi'
import { useReactToPrint } from 'react-to-print'
import SalesReceipt from './SalesReceipt.jsx'

export default function SalesPage() {
  // Optional invoice peek
  const { data: nextInvoice, refetch: refetchNext } = useGetNextInvoiceQuery(null, { refetchOnMountOrArgChange: true })

  // Quick product search for dropdown
  const [productSearch, setProductSearch] = useState('')
  const { data: productOptions = [] } = useGetProductsQuery({ search: productSearch })

  // Inputs
  const [barcode, setBarcode] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)

  // Cart
  const [cart, setCart] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Payments
  const [paid, setPaid] = useState(0)
  const [message, setMessage] = useState('')

  // API hooks
  const [fetchByBarcode] = useLazyGetProductByBarcodeQuery()
  const [createSale, { isLoading: saving }] = useCreateSaleMutation()

  // Totals
  const totals = useMemo(() => {
    const subTotal = cart.reduce((s, it) => s + it.unitPrice * it.qty, 0)
    const grandTotal = +(subTotal).toFixed(2)
    const balance = +(grandTotal - Number(paid || 0)).toFixed(2)
    return { subTotal, grandTotal, balance }
  }, [cart, paid])

  // Focus barcode for scanner
  const barcodeRef = useRef(null)
  useEffect(() => { barcodeRef.current?.focus() }, [])

  // Pre-fill when selecting a product
  useEffect(() => {
    if (!selectedProductId) return
    const p = productOptions.find(x => x._id === selectedProductId)
    if (p) {
      setUnitPrice(Number(p.retailPrice))
      setBarcode(p.barcode)
    }
  }, [selectedProductId, productOptions])

  function addToCartFromProduct(p, quantity, price) {
    setCart(prev => {
      const idx = prev.findIndex(x => x.productId === p._id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + quantity, unitPrice: price }
        return copy
      }
      return [...prev, {
        productId: p._id,
        name: p.name,
        barcode: p.barcode,
        unitPrice: price,
        qty: quantity
      }]
    })
  }

  async function handleAdd() {
    setMessage('')
    const q = Math.max(1, Number(qty || 1))
    const price = Math.max(0, Number(unitPrice || 0))

    try {
      let product = null
      if (selectedProductId) {
        product = productOptions.find(x => x._id === selectedProductId)
      } else if (barcode.trim()) {
        product = await fetchByBarcode(barcode.trim()).unwrap()
      }
      if (!product) {
        setMessage('Select a product or enter a valid barcode')
        return
      }
      const usePrice = price || Number(product.retailPrice) || 0
      addToCartFromProduct(product, q, usePrice)
      // reset inputs
      setQty(1); setUnitPrice(0); setSelectedProductId(''); setBarcode('')
      setTimeout(() => barcodeRef.current?.focus(), 0)
    } catch {
      setMessage('Product not found for barcode')
    }
  }

  function removeSelected() {
    if (selectedIndex < 0) return
    setCart(prev => prev.filter((_, i) => i !== selectedIndex))
    setSelectedIndex(-1)
  }
  function clearCart() {
    setCart([]); setPaid(0); setSelectedIndex(-1)
    setBarcode(''); setSelectedProductId(''); setQty(1); setUnitPrice(0)
    setTimeout(() => barcodeRef.current?.focus(), 0)
  }

  // Printing (react-to-print v3+ uses contentRef)
  const printRef = useRef(null)
  const printNow = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Invoice',
    onAfterPrint: () => { setLastSale(null); clearCart(); refetchNext?.() }
  })
  const [lastSale, setLastSale] = useState(null)

  async function handlePayAndPrint() {
    if (cart.length === 0) { setMessage('Cart is empty'); return }
    setMessage('')
    try {
      const payload = {
        items: cart.map(it => ({ productId: it.productId, qty: it.qty, unitPrice: it.unitPrice })),
        paidAmount: Number(paid || 0)
      }
      const sale = await createSale(payload).unwrap()
      setLastSale(sale)

      // Wait a tick so <SalesReceipt> mounts with the new sale, then print
      setTimeout(() => {
        if (!printRef.current) {
          setMessage('Nothing to print yet (ref not mounted)')
          return
        }
        printNow()
      }, 100)
    } catch (e) {
      setMessage(e?.data?.message || 'Failed to complete sale')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Sales
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/60 text-sm font-medium text-gray-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            {new Date().toDateString()}
          </div>
        </header>

        {/* Main Sales Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-6 sm:p-8">
          <div className="text-sm font-semibold text-gray-600 mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            Invoice Number: 
            <span className="font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 rounded-lg border border-blue-200">
              {nextInvoice?.next ?? '—'}
            </span>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 items-end mb-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Barcode Number
              </label>
              <input
                ref={barcodeRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm placeholder-gray-400"
                placeholder="Scan or type barcode"
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Product
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search product name"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm placeholder-gray-400"
                />
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="sm:w-56 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm"
                >
                  <option value="">Select product</option>
                  {productOptions.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                QTY
              </label>
              <input 
                type="number" 
                min={1} 
                value={qty} 
                onChange={(e) => setQty(e.target.value)} 
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 items-end mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Unit Price
              </label>
              <input 
                type="number" 
                min={0} 
                value={unitPrice} 
                onChange={(e) => setUnitPrice(e.target.value)} 
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm" 
              />
            </div>
            
            <div className="sm:col-span-1 lg:col-span-4 flex items-center justify-end">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">TOTAL PRICE:</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {(Number(qty || 0) * Number(unitPrice || 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button 
              onClick={handleAdd} 
              className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add to Cart
            </button>
            <button 
              onClick={removeSelected} 
              disabled={selectedIndex < 0} 
              className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
              </svg>
              Remove
            </button>
            <button 
              onClick={clearCart} 
              className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Remove All
            </button>
            {message && (
              <div className="ml-auto px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-medium rounded-xl border border-red-200 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Cart Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase tracking-wide">Index</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase tracking-wide">Name</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase tracking-wide">Barcode</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase tracking-wide">Qty</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase tracking-wide">Unit Price</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase tracking-wide">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((it, i) => (
                  <tr
                    key={it.productId}
                    className={`border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent ${
                      selectedIndex === i ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-400' : ''
                    }`}
                    onClick={() => setSelectedIndex(i)}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">{i + 1}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{it.name}</td>
                    <td className="py-4 px-6 text-gray-600">{it.barcode}</td>
                    <td className="py-4 px-6">
                      <input 
                        type="number" 
                        min={1} 
                        value={it.qty}
                        onChange={(e) => {
                          const v = Math.max(1, Number(e.target.value || 1))
                          setCart(prev => prev.map((x, idx) => idx === i ? { ...x, qty: v } : x))
                        }}
                        className="w-20 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <input 
                        type="number" 
                        min={0} 
                        value={it.unitPrice}
                        onChange={(e) => {
                          const v = Math.max(0, Number(e.target.value || 0))
                          setCart(prev => prev.map((x, idx) => idx === i ? { ...x, unitPrice: v } : x))
                        }}
                        className="w-24 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {(it.qty * it.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <div className="text-lg font-medium text-gray-500">Cart is empty</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Paid Amount
                </div>
                <input 
                  type="number" 
                  min={0} 
                  value={paid} 
                  onChange={(e) => setPaid(e.target.value)} 
                  className="w-48 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                />
              </div>
              
              <div className="text-right space-y-3">
                <div className="space-y-1">
                  <div className="text-lg font-medium text-gray-700">
                    TOTAL AMOUNT: 
                    <span className="font-bold text-gray-900 ml-2 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 rounded-lg border border-blue-200">
                      {totals.grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    BALANCE/DUE: 
                    <span className={`font-bold ml-2 px-3 py-1 rounded-lg border ${
                      totals.balance > 0 
                        ? 'text-red-700 bg-gradient-to-r from-red-50 to-red-100 border-red-200' 
                        : 'text-green-700 bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                    }`}>
                      {totals.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={handlePayAndPrint} 
                  disabled={saving || cart.length === 0}
                  className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H9.5a2 2 0 01-2-2v-1a2 2 0 012-2H14" />
                      </svg>
                      Pay & Print
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keep printable content mounted; visually hidden but not display:none */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 0 }}>
        <SalesReceipt ref={printRef} sale={lastSale} />
      </div>
    </div>
  )
}