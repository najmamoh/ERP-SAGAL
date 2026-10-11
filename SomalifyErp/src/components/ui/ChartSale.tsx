import React from 'react';
import { motion } from 'framer-motion';
import "./Table.css"

interface ChartProps {
    title: string;
    icon: React.ReactElement;
    count: number;
    subText: string;
    color: string;
  }

export const Chart: React.FC<ChartProps> = ({ title, icon, count, subText, color}) => {
  return (
    <div className="  rounded-lg  w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className=''>

       <div className="chart-container">
      <div className="chart-header">
        <div className="chart-icon">{icon}</div>
        <div className="chart-info">
          <p className="chart-title">{title}</p>
          <p className="chart-count">{count.toLocaleString()}</p>
        </div>
        <div className="chart-subtext">{subText}</div>
      </div>
      <div className="chart-line" style={{ background: color }}></div>
    </div>
        </div>
      </motion.div>
    </div>
  );
};