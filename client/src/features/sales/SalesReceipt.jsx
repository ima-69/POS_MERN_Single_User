import React, { forwardRef } from 'react'

const SalesReceipt = forwardRef(({ sale }, ref) => {
  if (!sale) return null
  const date = new Date(sale.createdAt || sale.date || Date.now())
  
  return (
    <div 
      ref={ref} 
      className="bg-white text-black min-h-[297mm] w-[210mm] p-8 font-sans"
      style={{ 
        fontSize: '12pt',
        lineHeight: '1.4',
        color: '#000',
        backgroundColor: '#fff'
      }}
    >
      {/* Header Section */}
      <div className="text-center mb-8 border-b-2 border-black pb-6">
        <h1 className="text-2xl font-bold mb-2 uppercase tracking-wide">
          PRASANNA PRINTERS & COMMUNICATION
        </h1>
        <div className="text-sm mb-2">
          No. 123, Main Street, Negombo, Western Province, Sri Lanka
        </div>
        <div className="text-sm mb-2">
          Tel: +94 31 222 3333 | Email: info@prasannaprinters.lk
        </div>
        <div className="text-sm font-medium">
          Tax Registration No: 123456789V
        </div>
      </div>

      {/* Invoice Details */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-bold mb-2">SALES INVOICE</div>
            <div className="text-sm">
              <div className="mb-1">
                <span className="font-medium">Invoice No:</span> #{String(sale.invoiceNo).padStart(5, '0')}
              </div>
              <div className="mb-1">
                <span className="font-medium">Date:</span> {date.toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Time:</span> {date.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">
              <div className="mb-1">
                <span className="font-medium">Cashier:</span> Admin
              </div>
              <div className="mb-1">
                <span className="font-medium">Terminal:</span> POS-01
              </div>
              <div>
                <span className="font-medium">Payment Method:</span> Cash
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-3 font-bold text-sm">#</th>
              <th className="text-left py-3 font-bold text-sm">ITEM DESCRIPTION</th>
              <th className="text-left py-3 font-bold text-sm">BARCODE</th>
              <th className="text-right py-3 font-bold text-sm">QTY</th>
              <th className="text-right py-3 font-bold text-sm">UNIT PRICE</th>
              <th className="text-right py-3 font-bold text-sm">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="py-3 text-sm">{i + 1}</td>
                <td className="py-3 text-sm font-medium">{item.name}</td>
                <td className="py-3 text-sm text-gray-600">{item.barcode}</td>
                <td className="py-3 text-sm text-right">{item.qty}</td>
                <td className="py-3 text-sm text-right">RS {Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-3 text-sm text-right font-medium">RS {Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
            {/* Add empty rows if needed to maintain consistent spacing */}
            {Array.from({ length: Math.max(0, 5 - sale.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-gray-200">
                <td className="py-3 text-sm">&nbsp;</td>
                <td className="py-3 text-sm">&nbsp;</td>
                <td className="py-3 text-sm">&nbsp;</td>
                <td className="py-3 text-sm">&nbsp;</td>
                <td className="py-3 text-sm">&nbsp;</td>
                <td className="py-3 text-sm">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <div className="flex justify-end">
          <div className="w-80">
            <div className="border-t-2 border-black pt-4">
              <div className="flex justify-between py-2 text-sm">
                <span className="font-medium">Subtotal:</span>
                <span>RS {Number(sale.subTotal).toFixed(2)}</span>
              </div>
              
              {sale.discount > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-medium">Discount:</span>
                  <span>- RS {Number(sale.discount).toFixed(2)}</span>
                </div>
              )}
              
              {sale.tax > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-medium">Tax:</span>
                  <span>RS {Number(sale.tax).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-black">
                <span>GRAND TOTAL:</span>
                <span>RS {Number(sale.grandTotal).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2 text-sm">
                <span className="font-medium">Amount Paid:</span>
                <span>RS {Number(sale.paidAmount).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2 text-sm">
                <span className="font-medium">Balance/Change:</span>
                <span className={Number(sale.balance) > 0 ? 'text-red-600 font-bold' : 'font-medium'}>
                  RS {Number(sale.balance).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mb-8 bg-gray-50 p-4 border border-gray-300">
        <div className="text-center">
          <div className="text-sm font-bold mb-2">PAYMENT SUMMARY</div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="font-medium">Items:</div>
              <div>{sale.items.length}</div>
            </div>
            <div>
              <div className="font-medium">Total Qty:</div>
              <div>{sale.items.reduce((sum, item) => sum + Number(item.qty), 0)}</div>
            </div>
            <div>
              <div className="font-medium">Savings:</div>
              <div>RS {Number(sale.discount || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto pt-8">
        <div className="border-t-2 border-black pt-6">
          <div className="text-center">
            <div className="text-sm font-bold mb-4">
              THANK YOU FOR YOUR BUSINESS!
            </div>
            <div className="text-xs mb-2">
              • All sales are final. No returns without receipt.
            </div>
            <div className="text-xs mb-2">
              • Goods once sold cannot be returned or exchanged.
            </div>
            <div className="text-xs mb-2">
              • Please check your items before leaving the store.
            </div>
            <div className="text-xs mb-4">
              • For any queries, please contact us within 24 hours.
            </div>
            
            <div className="text-xs text-gray-600 mb-4">
              Visit us at: www.prasannaprinters.lk | Follow us on social media
            </div>
            
            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-gray-300">
              <div className="text-left">
                <div className="text-xs mb-8">Customer Signature:</div>
                <div className="border-b border-black w-32"></div>
              </div>
              <div className="text-right">
                <div className="text-xs mb-8">Cashier Signature:</div>
                <div className="border-b border-black w-32 ml-auto"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-6">
          This is a computer-generated invoice. Printed on {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
})

SalesReceipt.displayName = 'SalesReceipt'

export default SalesReceipt