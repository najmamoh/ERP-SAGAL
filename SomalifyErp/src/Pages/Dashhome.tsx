// import  { useEffect } from 'react'

// import {  RiShoppingBasketFill } from 'react-icons/ri';
// import SideParsm from '@/components/SideParsm';
// import { FaHeart, FaShoppingBag } from 'react-icons/fa';
// import { FcSalesPerformance } from 'react-icons/fc';

// import BasicArea from '@/components/ui/Chart';

// import RecentTable from '@/components/RecentTable';
// import MonthChart from '@/components/MonthlyChart';
// import PieChartWithCenterLabel from '@/components/ui/Circlecharts';
// import { useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '@/Redux/Store';
// import { useDispatch } from 'react-redux';
// import { getAllProductsFn } from '@/Redux/Slice/getAllProductsSlice';
// import { getAllPurchasesFn } from '@/Redux/Slice/AllPurchases';
// import { GetIncomeFn } from '@/Redux/Slice/Incomestatement';
// import { useNavigate } from 'react-router-dom';
// import Nav from '@/components/Nav';


// function Dashhome() {

//   //  const ProductsState= useSelector((state:RootState)=>state.AllProduct)
//   //  const totalProducts = ProductsState.data.length;

//    const AllPurchases= useSelector((state:RootState)=>state.AllPurchase)
//    const totolPurchases= AllPurchases.data.length   
//    const AllIncomeeState = useSelector((state:RootState)=>state.AllIncome)
//    const salesInfo = (AllIncomeeState.data && AllIncomeeState.data.salesInfo && AllIncomeeState.data.salesInfo.length > 0)
//    ? AllIncomeeState.data.salesInfo[0]
//    : { total_sales: 0, cash_sales: 0, total_sales_cost: 0 };

//    const income = salesInfo.total_sales - salesInfo.total_sales_cost;

   
   
   
//   //  const finalIncome= 

//    const dispatch= useDispatch<AppDispatch>()
//    useEffect(()=>{
//     dispatch(getAllProductsFn())
//    },[dispatch])
//    useEffect(()=>{
//     dispatch(getAllPurchasesFn())
//    },[dispatch])
//    useEffect(()=>{
//     dispatch(GetIncomeFn())
//    },[dispatch])
//     const navigate= useNavigate()
//     useEffect(() => {
//       if (!localStorage.getItem('userInfo')) {
//         navigate('/'); // or any other path you want to navigate to
//       }
//     }, [navigate]);
    
//    console.log("this is allicnome" ,AllIncomeeState)
//   return (
//     <div className=' '>
        
     
//        <div className='flex p-3 items-center justify-between'>

//       <h1 className='lg:hidden '>

//        <SideParsm  />
//       </h1>
//        <div className="navhome p-0 flex w-full justify-end">
//         <Nav/>
//        </div>
//        </div>
//        <div className=' text-black'>
//         {/* <h1 className='text-xl font-semibold'>Dashboard</h1> */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//   <div className="bg-white rounded-[10px] p-5 flex gap-4">
//     <div className="bg-[#e6eeff] p-4 rounded-full h-[55.43px] w-[55.43px] text-xl items-center justify-center flex">
//       <FaHeart className="text-[#3e6bc5]" />
//     </div>
//     <div>
//     <h1 className="text-2xl font-semibold">{salesInfo.total_sales || 0}$</h1>
//       <h2 className="text-gray-700">Total Sales</h2>
//     </div>
//   </div>
//   <div className="bg-white rounded-[10px] p-5 flex gap-4">
//     <div className="bg-[#fff0cc] p-4 rounded-full h-[55.43px] w-[55.43px] text-xl items-center justify-center flex">
//       <FcSalesPerformance />
//     </div>
//     <div>
//     <h1 className="text-2xl font-semibold">{salesInfo.cash_sales}$</h1>
//     <h2 className="text-gray-700">Cash Sales</h2>
//     </div>
//   </div>
//   <div className="bg-white rounded-[10px] p-5 flex gap-4">
//     <div className="bg-[#ffefe9] p-4 rounded-full h-[55.43px] w-[55.43px] text-xl items-center justify-center flex">
//       <FaShoppingBag className="text-[#FF8F6B]" />
//     </div>
//     <div>
//       <h1 className="text-2xl font-semibold">{salesInfo.total_sales_cost}$</h1>
//       <h2 className="text-gray-700">Cost of goods</h2>
//     </div>
//   </div>
//   <div className="bg-white rounded-[10px] p-5 flex gap-4">
//     <div className="bg-[#ede3ff] p-4 rounded-full h-[55.43px] w-[55.43px] text-xl items-center justify-center flex">
//       <RiShoppingBasketFill className="text-[#412378]" />
//     </div>
//     <div>
//       <h1 className="text-2xl font-semibold">${income}</h1>
//       <h2 className="text-gray-700">Income</h2>
//     </div>
//   </div>
// </div>
//           <div className='md:flex gap-2 rounded-xl mt-2 w-full'>
//             <div className='flex-1 w-[40%] overflow-hidden'>
//               <BasicArea />
//             </div>
//             <div className='flex-2 w-[60%] overflow-hidden'>
//               <PieChartWithCenterLabel />
//             </div>
//           </div>
//         <div className='md:flex gap-2'>
//           <div className='bg-white rounded-2xl mt-2 '>
//             <RecentTable/>
//           </div>
//           <div className='bg-white rounded-2xl mt-2  '>
//             <MonthChart/>
//           </div>
//         </div>
//        </div>
//     </div>
//   )
// }

// export default Dashhome