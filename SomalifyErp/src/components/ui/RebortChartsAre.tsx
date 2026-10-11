

// export default MyChart;

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, useSelector } from 'react-redux';
import { GetAllIncomeReporFn } from '@/Redux/Slice/Los/Porift';
import { AppDispatch, RootState } from '@/Redux/Store';
import { ApexOptions } from 'apexcharts'; // Import ApexOptions

interface ChartData {
  name: string;
  data: number[];
}

interface MyChartProps {
  companyId?: string;
}

const MyChart: React.FC<MyChartProps> = ({ companyId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const GetAllincomeState = useSelector((state: RootState) => state.GetIncome);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setDate(currentDate.getDate() - 30);

  const [startDate, ] = useState(formatDate(pastDate));
  const [endDate, ] = useState(formatDate(currentDate));
  const [series, setSeries] = useState<ChartData[]>([]);

  useEffect(() => {
    if (startDate && endDate && companyId) {
      dispatch(GetAllIncomeReporFn({ startDate, endDate, company_id: companyId }));
    }
  }, [dispatch, startDate, endDate, companyId]);

  useEffect(() => {
    if (GetAllincomeState.data) {
      const totalSales = GetAllincomeState.data.salesInfo
        ? GetAllincomeState.data.salesInfo.reduce((acc, sale) => acc + parseFloat(sale.total_sales || '0'), 0)
        : 0;

      const totalSalesCost = GetAllincomeState.data.salesInfo
        ? GetAllincomeState.data.salesInfo.reduce((acc, sale) => acc + parseFloat(sale.total_sales_cost || '0'), 0)
        : 0;

      const totalSalariesExpenses = GetAllincomeState.data.salaryExpenses
        ? GetAllincomeState.data.salaryExpenses.reduce((acc, expense) => acc + parseFloat(expense.total_salaries_expenses || '0'), 0)
        : 0;

      const totalOtherExpenses = GetAllincomeState.data.otherExpenses
        ? GetAllincomeState.data.otherExpenses.reduce((acc, expense) => acc + parseFloat(expense.total_other_expenses || '0'), 0)
        : 0;

      const netSale = totalSales - totalSalesCost;
      const totalExpenses = totalSalariesExpenses + totalOtherExpenses;
      const income = netSale - totalExpenses;

      setSeries([
        {
          name: 'Income',
          data: [income],
        },
        {
          name: 'Total Sales',
          data: [totalSales],
        },
      ]);
    }
  }, [GetAllincomeState]);

  const generateLast30Days = () => {
    const dates = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(formatDate(date));
    }
    return dates;
  };

  const optionses: ApexOptions = {
    chart: {
      height: 350,
      type: 'area', // This needs to be one of the specified string literals
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      categories: generateLast30Days(),
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  };

  return (
    <div id="chart">
      <ReactApexChart options={optionses} series={series} type="area" height={350} />
    </div>
  );
};

export default MyChart;
