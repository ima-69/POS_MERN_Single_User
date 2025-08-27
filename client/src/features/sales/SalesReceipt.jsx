import React, { forwardRef } from "react";
import logo from "../../assets/logo.png";

const SalesReceipt = forwardRef(({ sale, logoSrc }, ref) => {
  if (!sale) return null;
  const date = new Date(sale.createdAt || sale.date || Date.now());

  // Use logoSrc prop if provided, otherwise fall back to imported logo
  const displayLogo = logoSrc || logo;

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
            <img
              src={displayLogo}
              alt="Company logo"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.textContent = 'LOGO';
                fallback.className = 'text-orange-600 font-bold text-sm px-3 py-2';
                e.target.parentNode.appendChild(fallback);
              }}
            />
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
              #{String(sale.invoiceNo).padStart(5, "0")}
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
            {sale.items.map((item, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}>
                <td className="py-2 px-2 text-xs font-medium">{i + 1}</td>
                <td className="py-2 px-2 text-xs font-medium text-gray-800">{item.name}</td>
                <td className="py-2 px-2 text-xs text-gray-600 font-mono">{item.barcode || '-'}</td>
                <td className="py-2 px-2 text-xs text-right font-semibold">{item.qty}</td>
                <td className="py-2 px-2 text-xs text-right">RS {Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-2 px-2 text-xs text-right font-bold text-orange-600">RS {Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
            {/* Reduce empty rows to 2 for space efficiency */}
            {Array.from({ length: Math.max(0, 2 - sale.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className={`${(sale.items.length + i) % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100`}>
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
                <span className="font-semibold">RS {Number(sale.subTotal).toFixed(2)}</span>
              </div>

              {sale.discount > 0 && (
                <div className="flex justify-between py-1 text-sm text-red-600">
                  <span className="font-medium">Discount:</span>
                  <span className="font-semibold">- RS {Number(sale.discount).toFixed(2)}</span>
                </div>
              )}

              {sale.tax > 0 && (
                <div className="flex justify-between py-1 text-sm">
                  <span className="font-medium">Tax:</span>
                  <span className="font-semibold">RS {Number(sale.tax).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 text-base font-bold border-t-2 border-orange-600 bg-orange-600 text-white px-2 rounded">
                <span>GRAND TOTAL:</span>
                <span>RS {Number(sale.grandTotal).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 text-sm mt-2">
                <span className="font-medium">Amount Paid:</span>
                <span className="font-semibold text-orange-600">RS {Number(sale.paidAmount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 text-sm">
                <span className="font-medium">Balance/Change:</span>
                <span
                  className={
                    Number(sale.balance) > 0 
                      ? "text-red-600 font-bold" 
                      : Number(sale.balance) < 0 
                      ? "text-orange-600 font-bold" 
                      : "font-medium"
                  }
                >
                  RS {Number(sale.balance).toFixed(2)}
                  {Number(sale.balance) > 0 && " (Due)"}
                  {Number(sale.balance) < 0 && " (Change)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method (if available) */}
      {sale.paymentMethod && (
        <div className="mb-3 text-center">
          <div className="inline-block bg-orange-100 px-3 py-1 rounded-lg border border-orange-200">
            <span className="text-xs font-medium text-orange-800">
              Payment Method: <span className="font-bold">{sale.paymentMethod}</span>
            </span>
          </div>
        </div>
      )}

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

            {/* Customer Info Section (if available) */}
            {sale.customerName && (
              <div className="mb-3 text-xs">
                <span className="font-medium">Customer: </span>
                <span className="text-orange-600 font-semibold">{sale.customerName}</span>
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
  );
});

SalesReceipt.displayName = "SalesReceipt";

export default SalesReceipt;