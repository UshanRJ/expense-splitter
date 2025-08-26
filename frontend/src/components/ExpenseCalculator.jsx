import React, { useState, useEffect } from 'react';
import { Calculator, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const ExpenseCalculator = ({ eventId, eventData }) => {
  const [calculations, setCalculations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateExpenses();
  }, [eventId]);

  const calculateExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/calculate`);
      const data = await response.json();
      setCalculations(data.calculations);
    } catch (error) {
      console.error('Error calculating expenses:', error);
    }
    setLoading(false);
  };

  const getTotalExpenses = () => {
    if (!calculations) return 0;
    return Object.values(calculations).reduce((total, calc) => total + calc.totalExpense, 0);
  };

  const getTotalContributions = () => {
    if (!calculations) return 0;
    return Object.values(calculations).reduce((total, calc) => total + calc.contribution, 0);
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceIcon = (balance) => {
    if (balance > 0) return <TrendingUp className="w-4 h-4" />;
    if (balance < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculating expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Expenses</h3>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                Rs {getTotalExpenses().toFixed(2)}
              </div>
            </div>
            <Calculator className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Contributions</h3>
              <div className="text-3xl font-bold text-green-600 mt-2">
                Rs {getTotalContributions().toFixed(2)}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Difference</h3>
              <div className={`text-3xl font-bold mt-2 ${
                getTotalContributions() - getTotalExpenses() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                Rs {Math.abs(getTotalContributions() - getTotalExpenses()).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {getTotalContributions() - getTotalExpenses() >= 0 ? 'Surplus' : 'Deficit'}
              </div>
            </div>
            {getTotalContributions() - getTotalExpenses() >= 0 ? 
              <TrendingUp className="w-8 h-8 text-green-500" /> : 
              <TrendingDown className="w-8 h-8 text-red-500" />
            }
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Individual Breakdown</h2>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </button>
        </div>

        {calculations ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Expense
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contribution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(calculations).map((calc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">
                            {calc.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{calc.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {Object.entries(calc.categoryExpenses).map(([category, amount]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span className="text-gray-600">{category}:</span>
                            <span className="font-medium">Rs {amount.toFixed(2)}</span>
                          </div>
                        ))}
                        {Object.keys(calc.categoryExpenses).length === 0 && (
                          <span className="text-gray-400 text-sm">No expenses</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs {calc.totalExpense.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs {calc.contribution.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm font-medium ${getBalanceColor(calc.balance)}`}>
                        {getBalanceIcon(calc.balance)}
                        <span className="ml-1">Rs {Math.abs(calc.balance).toFixed(2)}</span>
                        <span className="ml-1 text-xs">
                          {calc.balance > 0 ? '(gets back)' : calc.balance < 0 ? '(owes)' : '(even)'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No calculations available</p>
            <p className="text-gray-500">Add categories and attendees to see expense breakdown</p>
          </div>
        )}
      </div>

      {/* Settlement Suggestions */}
      {calculations && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Settlement Suggestions</h3>
          
          <div className="space-y-3">
            {Object.values(calculations)
              .filter(calc => calc.balance < 0)
              .map((debtor, index) => {
                const creditors = Object.values(calculations)
                  .filter(calc => calc.balance > 0)
                  .sort((a, b) => b.balance - a.balance);
                
                if (creditors.length === 0) return null;
                
                const mainCreditor = creditors[0];
                const amount = Math.min(Math.abs(debtor.balance), mainCreditor.balance);
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-600 font-semibold text-xs">
                          {debtor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-800">
                        <strong>{debtor.name}</strong> should pay <strong>Rs {amount.toFixed(2)}</strong> to
                      </span>
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center ml-2 mr-1">
                        <span className="text-green-600 font-semibold text-xs">
                          {mainCreditor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <strong>{mainCreditor.name}</strong>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {Object.values(calculations).every(calc => Math.abs(calc.balance) < 0.01) && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">🎉 All expenses are settled!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseCalculator;