import React from 'react';
import { Chart } from '@/components/ui/ChartSale';
import TopSaledata from '@/components/ui/TopSaleTable';
import { motion } from 'framer-motion';

// interface ChartProps {
//   title: string;
//   icon: React.ReactElement;
//   count: number;
//   subText: string;
//   color: string;
// }

const TopSale: React.FC = () => {
  const productIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );

  const salesIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );

  return (
    <div className="min-h-screen sm:overflow-x-hidden">
      <div className="w-[100%] m-auto p-4 flex flex-col">
      <div className="app-container flex flex-col md:flex-row justify-center gap-4 text-black w-full">
          <Chart
            title="Total Product"
            icon={productIcon}
            count={500974}
            subText="+1400 New Added"
            color="#87CEEB"
          />
          <Chart
            title="Total Sales"
            icon={salesIcon}
            count={234888}
            subText="+1000 Sales Today"
            color="#ffc736"
          />
        </div>
        <div className=" w-[100%] sm:w-[90%] sm:overflow-hidden md:w-[80%] lg:w-auto my-3 border-2 border-white  m-auto bg-white rounded-xl p-2 text-black ">
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

      </motion.div>
          <h1>Top salling products</h1>
          <div className="overflow-x-hidden ">
            <TopSaledata />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSale;