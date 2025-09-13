import { createSale, peekNextInvoiceNo } from "../services/saleService.js";
import Sale from "../models/Sale.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createCtrl = (req, res, next) =>
  createSale(req.user.id, req.body)
    .then((sale) => res.status(201).json(sale))
    .catch(next);

export const nextCtrl = (req, res, next) =>
  peekNextInvoiceNo()
    .then((n) => res.json({ next: n }))
    .catch(next);

export const getAllCtrl = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, startDate, endDate, customerId } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { invoiceNo: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (customerId) {
      filter.customer = new mongoose.Types.ObjectId(customerId);
    }
    
    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .populate('customer', 'name email phone')
        .populate('cashier', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(filter)
    ]);
    
    res.json({
      data: sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getByIdCtrl = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('cashier', 'name')
      .populate('items.product', 'name barcode');
    
    if (!sale) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(sale);
  } catch (error) {
    next(error);
  }
};

export const getStatsCtrl = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const stats = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$paidAmount' },
          totalBalance: { $sum: '$balance' },
          avgInvoiceValue: { $avg: '$grandTotal' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalInvoices: 0,
      totalRevenue: 0,
      totalPaid: 0,
      totalBalance: 0,
      avgInvoiceValue: 0
    };
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMonthlyCtrl = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const sales = await Sale.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('customer', 'name')
      .populate('cashier', 'name')
      .sort({ date: -1 });
    
    const stats = await Sale.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$paidAmount' },
          totalBalance: { $sum: '$balance' }
        }
      }
    ]);
    
    res.json({
      sales,
      stats: stats[0] || { totalInvoices: 0, totalRevenue: 0, totalPaid: 0, totalBalance: 0 },
      period: { year, month }
    });
  } catch (error) {
    next(error);
  }
};

export const getYearlyCtrl = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    const sales = await Sale.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('customer', 'name')
      .populate('cashier', 'name')
      .sort({ date: -1 });
    
    const monthlyStats = await Sale.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $month: '$date' },
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$paidAmount' },
          totalBalance: { $sum: '$balance' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    const yearlyStats = await Sale.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$paidAmount' },
          totalBalance: { $sum: '$balance' }
        }
      }
    ]);
    
    res.json({
      sales,
      monthlyStats,
      yearlyStats: yearlyStats[0] || { totalInvoices: 0, totalRevenue: 0, totalPaid: 0, totalBalance: 0 },
      period: { year }
    });
  } catch (error) {
    next(error);
  }
};
