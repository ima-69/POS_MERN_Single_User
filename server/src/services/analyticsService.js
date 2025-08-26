import Sale from '../models/Sale.js'

function startOfDay(d = new Date()) {
  const x = new Date(d); x.setHours(0,0,0,0); return x
}
function endOfDay(d = new Date()) {
  const x = startOfDay(d); x.setDate(x.getDate()+1); return x
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth()+1, 1)
}

async function summaryForRange({ start, end } = {}) {
  const match = {}
  if (start && end) match.createdAt = { $gte: start, $lt: end }

  const [header] = await Sale.aggregate([
    { $match: match },
    { $group: {
        _id: null,
        totalSales: { $sum: 1 },
        salesAmount: { $sum: '$grandTotal' },
        receivedAmount: { $sum: '$paidAmount' },
        balanceAmount: { $sum: '$balance' }
      } }
  ])

  const [profitAgg] = await Sale.aggregate([
    { $match: match },
    { $unwind: '$items' },
    { $group: {
        _id: null,
        profit: {
          $sum: {
            $multiply: [
              { $subtract: [ '$items.unitPrice', { $ifNull: [ '$items.costPrice', 0 ] } ] },
              '$items.qty'
            ]
          }
        }
      } }
  ])

  return {
    totalSales: header?.totalSales || 0,
    salesAmount: header?.salesAmount || 0,
    receivedAmount: header?.receivedAmount || 0,
    balanceAmount: header?.balanceAmount || 0,
    profit: profitAgg?.profit || 0
  }
}

export async function dashboardSummary() {
  const [overall, monthly, daily] = await Promise.all([
    summaryForRange(), // all time
    summaryForRange({ start: startOfMonth(), end: endOfMonth() }),
    summaryForRange({ start: startOfDay(), end: endOfDay() })
  ])
  return { overall, monthly, daily }
}