import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { FinanceRecord, CalculatedTotals, GroupedPeriod } from '../context/FinanceDataContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartsProps {
  records: FinanceRecord[];
  calculateTotals: (record: FinanceRecord) => CalculatedTotals;
  groupByPeriod: (records: FinanceRecord[], period: string) => GroupedPeriod[];
  periodType: string;
}

// Profit Over Time Chart
export const ProfitChart: React.FC<ChartsProps> = ({ records, calculateTotals }) => {
  const labels = records.map(r => r.date);
  const grossProfits = records.map(r => calculateTotals(r).grossProfit);
  const netProfits = records.map(r => calculateTotals(r).netProfit);
  const totalIncomes = records.map(r => calculateTotals(r).totalIncome);
  const totalExpenses = records.map(r => calculateTotals(r).cogs + calculateTotals(r).otherExpenses);

  const data = {
    labels,
    datasets: [
      {
        label: 'Gross Profit',
        data: grossProfits,
        borderColor: '#F89841',
        backgroundColor: 'rgba(248, 152, 65, 0.1)',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Net Profit',
        data: netProfits,
        borderColor: '#2E2C6E',
        backgroundColor: 'rgba(46, 44, 110, 0.1)',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Total Income',
        data: totalIncomes,
        borderColor: '#43A047',
        backgroundColor: 'rgba(67, 160, 71, 0.1)',
        fill: false,
        borderDash: [5, 5],
        tension: 0.3,
      },
      {
        label: 'Total Expenses',
        data: totalExpenses,
        borderColor: '#E53935',
        backgroundColor: 'rgba(229, 57, 53, 0.1)',
        fill: false,
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
      },
      title: {
        display: true,
        text: 'Profit Over Time',
        color: '#2E2C6E',
        font: {
          family: 'Poppins',
          size: 16,
          weight: 600,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
      },
      y: {
        ticks: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

// Bank Chart
export const BankChart: React.FC<ChartsProps> = ({ records, calculateTotals }) => {
  const labels = records.map(r => r.date);
  const bankNets = records.map(r => calculateTotals(r).bankNet);

  const data = {
    labels,
    datasets: [
      {
        label: 'Bank (Cash) Net',
        data: bankNets,
        borderColor: '#00897B',
        backgroundColor: 'rgba(0, 137, 123, 0.1)',
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
      },
      title: {
        display: true,
        text: 'Bank (Cash) Over Time',
        color: '#2E2C6E',
        font: {
          family: 'Poppins',
          size: 16,
          weight: 600,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
      },
      y: {
        ticks: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

// Balance Sheet Chart
export const BalanceChart: React.FC<ChartsProps> = ({ records, groupByPeriod, periodType }) => {
  const grouped = groupByPeriod(records, periodType);
  const labels = grouped.map(g => g.period);
  const assets = grouped.map(g => g.assets);
  const liabilities = grouped.map(g => g.liabilities);
  const equity = grouped.map(g => g.equity);

  const data = {
    labels,
    datasets: [
      {
        label: 'Assets',
        data: assets,
        backgroundColor: '#43A047',
        borderColor: '#43A047',
        borderWidth: 1,
      },
      {
        label: 'Liabilities',
        data: liabilities,
        backgroundColor: '#E53935',
        borderColor: '#E53935',
        borderWidth: 1,
      },
      {
        label: 'Equity',
        data: equity,
        backgroundColor: '#FDD835',
        borderColor: '#FDD835',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
      },
      title: {
        display: true,
        text: 'Balance Sheet Comparison',
        color: '#2E2C6E',
        font: {
          family: 'Poppins',
          size: 16,
          weight: 600,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
      },
      y: {
        ticks: {
          color: '#2E2C6E',
          font: {
            family: 'Poppins',
          },
        },
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};
