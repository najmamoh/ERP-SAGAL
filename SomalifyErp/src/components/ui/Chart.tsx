
import { LineChart } from '@mui/x-charts/LineChart';


export default function BasicArea() {
  return (
    <div className=' rounded-2xl bg-white m-auto my-2 py-3 '>

<LineChart
      xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
      series={[
        {
          data: [2, 5.5, 2, 8.5, 1.5, 5],
        },
      ]}
      height={300}
      width={770}
      margin={{ left: 30, right: 30, top: 30, bottom: 30 }}
      grid={{ vertical: true, horizontal: true }}
    />
        </div>
  );
}




// import "./Util.css"

// import * as React from 'react';
// import { LineChart } from '@mui/x-charts/LineChart';
// import styles from './BasicArea.module.css';

// export default function BasicArea() {
//   return (
//     <div className="container">
//       <LineChart
//         xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
//         series={[
//           {
//             data: [2, 5.5, 2, 8.5, 1.5, 5],
//           },
//         ]}
//         height={300}
//         width={770}
//         className="chart"
//         margin={{ left: 30, right: 30, top: 30, bottom: 30 }}
//         grid={{ vertical: true, horizontal: true }}
//       />
//     </div>
//   );
// }