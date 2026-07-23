const incomeAnalyticsService = require('../services/incomeAnalytics.service');
const expenseAnalyticsService = require('../services/expenseAnalytics.service');
const budgetVarianceService = require('../services/budgetVariance.service');

class FinancialController {
  // Get comprehensive income analytics
  async getIncomeAnalytics(req, res) {
    try {
      const analytics = await incomeAnalyticsService.getIncomeAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Income analytics controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch income analytics',
        error: error.message
      });
    }
  }

  // Get comprehensive expense analytics
  async getExpenseAnalytics(req, res) {
    try {
      const analytics = await expenseAnalyticsService.getExpenseAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Expense analytics controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expense analytics',
        error: error.message
      });
    }
  }

  // Get budget variance with alerts
  async getBudgetVarianceWithAlerts(req, res) {
    try {
      const variance = await budgetVarianceService.getBudgetVarianceWithAlerts();
      res.json(variance);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch budget variance with alerts',
        error: error.message
      });
    }
  }

  // Get chart data for visualizations
  async getChartData(req, res) {
    try {
      const chartData = await budgetVarianceService.getChartData();
      res.json(chartData);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chart data',
        error: error.message
      });
    }
  }

  // Get combined profit analysis (Income - Expenses)
  async getProfitAnalysis(req, res) {
    try {
      const [incomeResult, expenseResult] = await Promise.all([
        incomeAnalyticsService.getIncomeAnalytics(),
        expenseAnalyticsService.getExpenseAnalytics()
      ]);

      if (!incomeResult.success || !expenseResult.success) {
        throw new Error('Failed to fetch required data for profit analysis');
      }

      const incomeData = incomeResult.data;
      const expenseData = expenseResult.data;

      // Calculate overall profit
      const totalProfit = incomeData.totalIncome - expenseData.totalExpenses;
      const profitMargin = incomeData.totalIncome > 0 ? (totalProfit / incomeData.totalIncome) * 100 : 0;

      // Event-wise profit analysis
      const eventWiseProfit = this.calculateEventWiseProfit(
        incomeData.eventWiseDetails,
        expenseData.eventWiseDetails
      );

      // Profit trends and insights
      const profitAnalytics = {
        totalIncome: incomeData.totalIncome,
        totalExpenses: expenseData.totalExpenses,
        totalProfit,
        profitMargin,
        profitableEvents: eventWiseProfit.filter(e => e.profit > 0).length,
        lossEvents: eventWiseProfit.filter(e => e.profit < 0).length,
        breakEvenEvents: eventWiseProfit.filter(e => e.profit === 0).length,
        mostProfitableEvent: eventWiseProfit.reduce((max, event) => 
          event.profit > (max?.profit || -Infinity) ? event : max, null),
        leastProfitableEvent: eventWiseProfit.reduce((min, event) => 
          event.profit < (min?.profit || Infinity) ? event : min, null)
      };

      res.json({
        success: true,
        data: {
          summary: profitAnalytics,
          eventWiseProfit: eventWiseProfit.sort((a, b) => b.profit - a.profit),
          incomeBreakdown: {
            online: incomeData.onlineIncome,
            onsite: incomeData.onsiteIncome,
            onlinePercentage: incomeData.analytics.onlinePercentage,
            onsitePercentage: incomeData.analytics.onsitePercentage
          },
          expenseBreakdown: expenseData.categoryAnalytics
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Profit analysis controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profit analysis',
        error: error.message
      });
    }
  }

  // Helper method to calculate event-wise profit
  calculateEventWiseProfit(incomeEvents, expenseEvents) {
    const eventMap = new Map();

    // Add income data
    incomeEvents.forEach(event => {
      eventMap.set(event.eventId, {
        eventId: event.eventId,
        eventTitle: event.eventTitle,
        eventDate: event.eventDate,
        eventType: event.eventType,
        income: event.totalIncome,
        expense: 0,
        profit: 0,
        profitMargin: 0,
        registrations: event.totalRegistrations
      });
    });

    // Add expense data
    expenseEvents.forEach(event => {
      if (eventMap.has(event.eventId)) {
        const existing = eventMap.get(event.eventId);
        existing.expense = event.totalExpense;
      } else {
        eventMap.set(event.eventId, {
          eventId: event.eventId,
          eventTitle: event.eventTitle,
          eventDate: event.eventDate,
          eventType: event.eventType,
          income: 0,
          expense: event.totalExpense,
          profit: 0,
          profitMargin: 0,
          registrations: 0
        });
      }
    });

    // Calculate profit and margin for each event
    return Array.from(eventMap.values()).map(event => {
      event.profit = event.income - event.expense;
      event.profitMargin = event.income > 0 ? (event.profit / event.income) * 100 : 0;
      return event;
    });
  }

  // Get financial dashboard summary
  async getFinancialSummary(req, res) {
    try {
      const [incomeResult, expenseResult] = await Promise.all([
        incomeAnalyticsService.getIncomeAnalytics(),
        expenseAnalyticsService.getExpenseAnalytics()
      ]);

      const summary = {
        totalIncome: incomeResult.data.totalIncome,
        totalExpenses: expenseResult.data.totalExpenses,
        totalProfit: incomeResult.data.totalIncome - expenseResult.data.totalExpenses,
        totalRegistrations: incomeResult.data.totalRegistrations,
        eventsWithIncome: incomeResult.data.eventWiseDetails.length,
        eventsWithExpenses: expenseResult.data.eventWiseDetails.length,
        onlineIncome: incomeResult.data.onlineIncome,
        onsiteIncome: incomeResult.data.onsiteIncome,
        topExpenseCategory: expenseResult.data.categoryAnalytics[0]?.category || 'N/A'
      };

      res.json({
        success: true,
        data: summary,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Financial summary controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch financial summary',
        error: error.message
      });
    }
  }
}

module.exports = new FinancialController();