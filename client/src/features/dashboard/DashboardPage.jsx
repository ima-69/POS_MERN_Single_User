import { useGetDashboardQuery } from './dashboardApi'

function Card({ title, value, sub, icon, gradientFrom, gradientTo, textColor = "text-white" }) {
  return (
    <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`text-xs sm:text-sm font-semibold ${textColor} opacity-90 uppercase tracking-wide`}>
            {title}
          </div>
          <div className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-2 sm:mt-3 ${textColor}`}>
            RS {Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {typeof sub === 'number' && (
            <div className={`text-xs sm:text-sm ${textColor} opacity-80 mt-1 sm:mt-2`}>
              Balance: RS {Number(sub).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${textColor} opacity-80 flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

function StatsCard({ label, value, icon, bgColor = "bg-gray-50", textColor = "text-gray-700" }) {
  return (
    <div className={`${bgColor} rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition-all duration-200`}>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${textColor} opacity-70 flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs sm:text-sm font-medium ${textColor} opacity-80`}>{label}</div>
        <div className={`text-lg sm:text-xl font-bold ${textColor} truncate`}>{value}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-lg font-medium text-gray-600">Loading dashboard...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4 text-center">
              <svg className="w-16 h-16 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-lg font-medium text-red-600">Failed to load dashboard</div>
              <p className="text-sm text-gray-500">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const o = data?.overall || {}
  const m = data?.monthly || {}
  const d = data?.daily || {}

  const salesIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )

  const receivedIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )

  const profitIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )

  const ordersIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">Overview of your business performance</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 self-start sm:self-auto">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="text-sm font-medium text-orange-800">
                {new Date().toDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* All Time Statistics */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 px-2">All Time Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <Card 
              title="Total Sales" 
              value={o.salesAmount} 
              sub={o.balanceAmount}
              icon={salesIcon}
              gradientFrom="from-blue-500" 
              gradientTo="to-blue-600"
            />
            <Card 
              title="Total Received" 
              value={o.receivedAmount}
              icon={receivedIcon}
              gradientFrom="from-green-500" 
              gradientTo="to-green-600"
            />
            <Card 
              title="Total Profit" 
              value={o.profit}
              icon={profitIcon}
              gradientFrom="from-purple-500" 
              gradientTo="to-purple-600"
            />
          </div>
        </div>

        {/* Monthly Statistics */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 px-2">This Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <Card 
              title="Monthly Sales" 
              value={m.salesAmount} 
              sub={m.balanceAmount}
              icon={salesIcon}
              gradientFrom="from-orange-500" 
              gradientTo="to-orange-600"
            />
            <Card 
              title="Monthly Received" 
              value={m.receivedAmount}
              icon={receivedIcon}
              gradientFrom="from-teal-500" 
              gradientTo="to-teal-600"
            />
            <Card 
              title="Monthly Profit" 
              value={m.profit}
              icon={profitIcon}
              gradientFrom="from-indigo-500" 
              gradientTo="to-indigo-600"
            />
          </div>
        </div>

        {/* Daily Statistics */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 px-2">Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <Card 
              title="Daily Sales" 
              value={d.salesAmount} 
              sub={d.balanceAmount}
              icon={salesIcon}
              gradientFrom="from-red-500" 
              gradientTo="to-red-600"
            />
            <Card 
              title="Daily Received" 
              value={d.receivedAmount}
              icon={receivedIcon}
              gradientFrom="from-emerald-500" 
              gradientTo="to-emerald-600"
            />
            <Card 
              title="Daily Profit" 
              value={d.profit}
              icon={profitIcon}
              gradientFrom="from-pink-500" 
              gradientTo="to-pink-600"
            />
          </div>
        </div>

        {/* Order Statistics */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Order Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard 
              label="All Time Orders" 
              value={Number(o.totalSales || 0).toLocaleString()}
              icon={ordersIcon}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <StatsCard 
              label="Monthly Orders" 
              value={Number(m.totalSales || 0).toLocaleString()}
              icon={ordersIcon}
              bgColor="bg-green-50"
              textColor="text-green-700"
            />
            <StatsCard 
              label="Daily Orders" 
              value={Number(d.totalSales || 0).toLocaleString()}
              icon={ordersIcon}
              bgColor="bg-orange-50"
              textColor="text-orange-700"
            />
          </div>
        </div>
      </div>
    </div>
  )
}