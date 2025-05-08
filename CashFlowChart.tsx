import React, { useEffect, useState } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useFinanceStore } from '../../store/financeStore';
import { Income, Expense } from '../../types';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, subMonths } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartType = 'line' | 'bar' | 'pie' | 'donut';

const CashFlowChart: React.FC = () => {
  const { incomes, expenses, settings } = useFinanceStore();
  const [chartData, setChartData] = useState<any>(null);
  const [chartType, setChartType] = useState<ChartType>('line');

  useEffect(() => {
    // Get range for last 6 months
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5); // 5 months ago to include current month
    
    // Generate array of months
    const monthsRange = eachMonthOfInterval({ 
      start: startOfMonth(sixMonthsAgo), 
      end: endOfMonth(now) 
    });
    
    // Process transactions by month
    const processTransactions = (items: (Income | Expense)[]) => {
      return monthsRange.map(month => {
        const monthlyItems = items.filter(item => 
          isSameMonth(parseISO(item.date), month)
        );
        
        return monthlyItems.reduce((sum, item) => sum + item.amount, 0);
      });
    };
    
    const monthlyIncome = processTransactions(incomes);
    const monthlyExpenses = processTransactions(expenses);
    
    // Calculate running balance
    let runningBalance = 0;
    const balanceData = monthlyIncome.map((income, index) => {
      runningBalance += income - monthlyExpenses[index];
      return runningBalance;
    });
    
    // Create labels (months)
    const labels = monthsRange.map(month => format(month, 'MMM'));
    
    // Calculate totals for pie/donut charts
    const totalIncome = monthlyIncome.reduce((sum, val) => sum + val, 0);
    const totalExpenses = monthlyExpenses.reduce((sum, val) => sum + val, 0);
    
    // Set chart data based on type
    if (chartType === 'pie' || chartType === 'donut') {
      setChartData({
        labels: ['Total Income', 'Total Expenses'],
        datasets: [
          {
            data: [totalIncome, totalExpenses],
            backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
            borderWidth: 1,
          }
        ]
      });
    } else {
      setChartData({
        labels,
        datasets: [
          {
            label: 'Running Balance',
            data: balanceData,
            borderColor: 'rgba(59, 130, 246, 1)', // Blue
            backgroundColor: chartType === 'line'
              ? 'rgba(59, 130, 246, 0.1)'
              : 'rgba(59, 130, 246, 0.8)',
            fill: chartType === 'line',
            tension: 0.4,
          }
        ]
      });
    }
  }, [incomes, expenses, chartType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          padding: 10,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        padding: 10,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat(settings.currency === 'ZAR' ? 'en-ZA' : 'en-US', {
                style: 'currency',
                currency: settings.currency,
                minimumFractionDigits: 2
              }).format(context.parsed.y || context.parsed);
            }
            return label;
          }
        }
      }
    },
    scales: chartType === 'line' || chartType === 'bar' ? {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: number) => {
            return new Intl.NumberFormat(settings.currency === 'ZAR' ? 'en-ZA' : 'en-US', {
              style: 'currency',
              currency: settings.currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
          font: {
            size: 11
          }
        },
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    } : undefined,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const renderChart = () => {
    if (!chartData) {
      return (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500 text-sm">Loading chart data...</p>
        </div>
      );
    }

    const ChartComponent = {
      bar: Bar,
      pie: Pie,
      donut: Doughnut,
      line: Line
    }[chartType];

    return (
      <div className="h-48">
        <ChartComponent data={chartData} options={options} />
      </div>
    );
  };

  return (
    <div className="card p-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">Balance History</h3>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as ChartType)}
          className="select text-sm py-1 px-2 min-w-[120px]"
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="donut">Donut Chart</option>
        </select>
      </div>
      {renderChart()}
    </div>
  );
};

export default CashFlowChart;
