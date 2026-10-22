// import Nav from "@/components/Nav"
// import SideParsm from "@/components/SideParsm"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet"
// import { GoPlus } from "react-icons/go"
// import { CiImport } from "react-icons/ci";

// export function SheetCreateV() {
//   return (
//     <div className="min-h-screen">
//       <div className='p-3   '>

//       <h1 className='md:hidden '>

//       <SideParsm  />
//    </h1>
//     <div className="navhome p-0 flex w-full justify-end">
//      <Nav/>
//          </div>
//       </div>
//     <div>

//     <h1 className="font-semibold  text-lg">Create Vendor </h1>
//     <div className="bg-white my-2 p-2 rounded-md w-full flex flex-col">
//       <div className="flex gap-2 justify-end px-4">
//         <button className="bg-[#008CC8]  px-2 gap-2  flex items-center text-white rounded-xl"><span className="text-xl"> <CiImport /> </span> Import excell</button>
//         <button className="p-2 flex gap-2 items-center"><span className="bg-[#E1E0FF] text-xl p-2  rounded-full"><GoPlus /></span>Add new</button>
//       </div>
//       <form className="formdiv flex flex-col">
//         <div className="grid grid-cols-4 gap-2">
//           <div className="flex flex-col ">
//             <label htmlFor="">Full name</label>
//             <input type="text" className="border border-gray-400 rounded-[10px] p-2"/>
//           </div>
//            <div className="flex flex-col ">
//             <label htmlFor="">Adress </label>
//             <input type="text" className="border border-gray-400 rounded-[10px] p-2"/>
//           </div>
//           <div className="flex flex-col ">
//             <label htmlFor="">Email</label>
//             <input type="email" className="border border-gray-400 rounded-[10px] p-2"/>
//           </div>
//           <div className="flex flex-col ">
//             <label htmlFor="">Phone</label>
//             <input type="tel" className="border border-gray-400 rounded-[10px] p-2"/>
//           </div>
//         </div>
//         <div className="font-bold  ">

//         <hr className="my-4 font-semibold bg-[#dcdcdc] rounded-md p-[2px] " />
//         </div>
//       </form>
//     </div>

//     </div>
//     </div>
//   )
// }


// import React, { useState } from 'react';
// import Nav from "@/components/Nav";
// import SideParsm from "@/components/SideParsm";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { GoPlus } from "react-icons/go";
// import { CiImport, CiTrash } from "react-icons/ci";

// export function SheetCreateV() {
//   const [formInputs, setFormInputs] = useState([
//     {
//       fullName: '',
//       address: '',
//       email: '',
//       phone: '',
//     },
//   ]);

//   const handleAddNewInput = () => {
//     setFormInputs([
//       ...formInputs,
//       {
//         fullName: '',
//         address: '',
//         email: '',
//         phone: '',
//       },
//     ]);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedInputs = [...formInputs];
//     updatedInputs[index][field] = value;
//     setFormInputs(updatedInputs);
//   };

//   const handleDelete = (index) => {
//     const updatedInputs = [...formInputs];
//     updatedInputs.splice(index, 1);
//     setFormInputs(updatedInputs);
//   };

//   return (
//     <div className="min-h-screen">
//       <div className='p-3   '>
//         <h1 className='md:hidden '>
//           <SideParsm  />
//         </h1>
//         <div className="navhome p-0 flex w-full justify-end">
//           <Nav/>
//         </div>
//       </div>
//       <div>
//         <h1 className="font-semibold  text-lg">Create Vendor </h1>
//         <div className="bg-white my-2 p-4 rounded-[8px] w-full flex flex-col">
//           <div className="flex gap-2 justify-end px-4">
//             <button className="bg-[#008CC8]  px-2 gap-2  flex items-center text-white rounded-xl"><span className="text-xl"> <CiImport /> </span> Import excell</button>
//             <button className="p-2 flex gap-2 items-center" onClick={handleAddNewInput}><span className="bg-[#E1E0FF] text-xl p-2  rounded-full"><GoPlus /></span>Add new</button>
//           </div>
//           {formInputs.map((input, index) => (
//             <div key={index}>
//               <form className="formdiv flex flex-col gap-4">
//                 <div className="grid grid-cols-4 gap-2">
//                   <div className="flex flex-col ">
//                     <label htmlFor="">Full name</label>
//                     <input
//                       type="text"
//                       className="border border-gray-400 rounded-[10px] p-2"
//                       value={input.fullName}
//                       onChange={(e) => handleInputChange(index, 'fullName', e.target.value)}
//                     />
//                   </div>
//                   <div className="flex flex-col ">
//                     <label htmlFor="">Address</label>
//                     <input
//                       type="text"
//                       className="border border-gray-400 rounded-[10px] p-2"
//                       value={input.address}
//                       onChange={(e) => handleInputChange(index, 'address', e.target.value)}
//                     />
//                   </div>
//                   <div className="flex flex-col ">
//                     <label htmlFor="">Email</label>
//                     <input
//                       type="email"
//                       className="border border-gray-400 rounded-[10px] p-2"
//                       value={input.email}
//                       onChange={(e) => handleInputChange(index, 'email', e.target.value)}
//                     />
//                   </div>
//                   <div className="flex flex-col ">
//                     <label htmlFor="">Phone</label>
//                     <input
//                       type="tel"
//                       className="border border-gray-400 rounded-[10px] p-2"
//                       value={input.phone}
//                       onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end">
//                   <button className=" px-4 py-2 flex items-center gap-2 rounded-lg text-red-500" onClick={(e) => {
//                     e.preventDefault();
//                     handleDelete(index);
//                   }}>
//                     <CiTrash /> Delete
//                   </button>
//                 </div>
//               </form>
//               {index !== formInputs.length - 1 && <hr />}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { FormEvent, useEffect, useState } from 'react';

// import * as XLSX from 'xlsx';

// import Nav from "@/components/Nav";
// import SideParsm from "@/components/SideParsm";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
















// import { GoPlus } from "react-icons/go";
// import { CiImport, CiTrash } from "react-icons/ci";
// import { useDispatch } from 'react-redux';
// import { AppDispatch, RootState } from '@/Redux/Store';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { createProductFn, resetProduct } from '@/Redux/Slice/CreateProductSlice';
// import toast from 'react-hot-toast';

// export function ProductCreate() {
//   const toastId = 'createProduct';

//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const CreateProductState = useSelector((state: RootState) => state.CreateProduct);

//   const [formInputs, setFormInputs] = useState([
//     {
//       product_code: '',
//       product_name: '',
//       product_alert_number: 0, // Change here
//       product_cost: '',
//       product_price: '',
//     },
//   ]);

//   const handleAddNewInput = () => {
//     setFormInputs([
//       ...formInputs,
//       {
//         product_code: '',
//         product_name: '',
//         product_alert_number: 0,
//         product_cost: '',
//         product_price: '',
//       },
//     ]);
//   };

//   const handleInputChange = (index: number, field: string, value: string| number) => {
//     const updatedInputs = [...formInputs];
//     updatedInputs[index] = { ...updatedInputs[index], [field]: value };
//     setFormInputs(updatedInputs);
//   };

//   const handleDelete = (index: number) => {
//     const updatedInputs = [...formInputs];
//     updatedInputs.splice(index, 1);
//     setFormInputs(updatedInputs);
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const binaryStr = e.target?.result as string;
//       const workbook = XLSX.read(binaryStr, { type: 'binary' });
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const data = XLSX.utils.sheet_to_json(worksheet, { 
//               header: 1,
//               defval: "" 
//             }) as any[][];
        
//             const formattedData = data.slice(1).map((row) => {
//         const [product_code, product_name, product_alert_number, product_cost, product_price] = row;
//         return {
//           product_code: product_code || '',
//           product_name: product_name || '',
//           product_alert_number: +product_alert_number || 0, // Change here
//           product_cost: product_cost || '',
//           product_price: product_price || '',
//           company_id: ''
//         };
//       });
      
//       setFormInputs(formattedData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     const formData = formInputs.map((input) => ({
//       product_code: input.product_code,
//       product_name: input.product_name,
//       product_alert_number: input.product_alert_number,
//       product_cost: input.product_cost,
//       product_price: input.product_price,
//       company_id: ''
//     }));
    
//     dispatch(createProductFn(formData));
//   };

//   useEffect(() => {
//     if (CreateProductState.isLoading) {
//       toast.loading('Creating product...', { id: toastId });
//     }
//     if (CreateProductState.IsSuccess) {
//       toast.success('Successfully created.', { id: toastId });
//       navigate('/Dashboard/Products');
//     }
//     if (CreateProductState.isError) {
//       toast.error(CreateProductState.errorMsg, { id: toastId });
//     }
//     dispatch(resetProduct());
//   }, [CreateProductState.IsSuccess, CreateProductState.isLoading, CreateProductState.isError, dispatch, navigate]);
    
//   useEffect(() => {
//     if (!localStorage.getItem('userInfo')) {
//       navigate('/'); // or any other path you want to navigate to
//     }
//   }, [navigate]);


//   return (
//     <div className="min-h-screen ">
//       <div className='p-3 flex items-center justify-between'>
//         <h1 className='lg:hidden'>
//           <SideParsm />
//         </h1>
//         <div className="navhome p-0 flex w-full justify-end">
//           <Nav />
//         </div>
//       </div>
//       <div>
//         <h1 className="font-semibold dark:text-white text-lg">Create Products </h1>
//         <form onSubmit={handleSubmit} className="bg-white text-black my-2 p-4 rounded-[8px] w-full flex flex-col">
//           <div className="flex gap-2 justify-end px-4">
//             <button type="button" className="bg-[#008CC8] px-2 gap-2 flex items-center text-white rounded-xl" onClick={() => document.getElementById('excel-import')!.click()}>
//                           <span className="text-xl"> <CiImport /> </span> Import Excel
//                         </button>
//             <input
//               id="excel-import"
//               type="file"
//               accept=".csv, .xlsx"
//               style={{ display: 'none' }}
//               onChange={handleFileChange}
//             />
//             <button type='button' className="p-2 flex gap-2 items-center" onClick={handleAddNewInput}>
//               <span className="bg-[#E1E0FF] text-xl p-2 rounded-full"><GoPlus /></span>Add new
//             </button>
//           </div>
//           {formInputs.map((input, index) => (
//             <div key={index}>
//               <div className="formdiv flex flex-col gap-4">
//                 <div className="grid grid-cols-4 gap-2">
//                   <div className="flex flex-col">
//                     <label htmlFor="">Product code</label>
//                     <input
//                       type="text"
//                       className="border border-gray-400 rounded-[10px] p-2"
//                       value={input.product_code}
//                       onChange={(e) => handleInputChange(index, 'product_code', e.target.value)}
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <label htmlFor="">Product Name</label>
//                     <input
//                       type="text"
//                       className="border border-gray-400 rounded-[10px] p-2"
//                       value={input.product_name}
//                       onChange={(e) => handleInputChange(index, 'product_name', e.target.value)}
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <label htmlFor="">Product Cost</label>
//                     <input
//                       type="text"
//                       className="border border-gray-400 rounded-[10px] p-2"
//                       value={input.product_cost}
//                       onChange={(e) => handleInputChange(index, 'product_cost', e.target.value)}
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <label htmlFor="">Product Price</label>
//                     <input
//                       type="text"
//                       className="border border-gray-400 rounded-[10px] p-2"
//                       value={input.product_price}
//                       onChange={(e) => handleInputChange(index, 'product_price', e.target.value)}
//                     />
//                   </div>
//                   <div className="flex flex-col">
//                     <label htmlFor="">Product Alert Number</label>
//                     <input
//                     type="number"
//                     className="border border-gray-400 rounded-[10px] p-2"
                    
//                     value={input.product_alert_number}
//                     onChange={(e) => handleInputChange(index, 'product_alert_number', Number(e.target.value))} // Change here
//                   />

//                   </div>
//                 </div>
//                 <div className="flex justify-end">
//                   <button className="px-4 py-2 flex items-center gap-2 rounded-lg text-red-500" onClick={(e) => {
//                     e.preventDefault();
//                     handleDelete(index);
//                   }}>
//                     <CiTrash /> Delete
//                   </button>
//                 </div>
//               </div>
//               {index !== formInputs.length - 1 && <hr />}
//             </div>
//           ))}
//           <div className="div flex justify-end my-4">
//             <button type='submit' className='bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] text-white p-2'>Create Products</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }





// ProductCreate.tsx
import { useState, useEffect, FormEvent } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import BarcodeScannerWrapper from "../components/Qrcode";
import { AppDispatch, RootState } from '@/Redux/Store';
import { createProductFn, resetProduct } from '@/Redux/Slice/CreateProductSlice';
import toast from 'react-hot-toast';
import { HiOutlineCube } from "react-icons/hi2";
import * as XLSX from 'xlsx';

interface ProductForm {
  product_code: string;
  product_name: string;
  product_alert_number: number;
  product_price: string;
}

export function ProductCreate() {
  const toastId = 'createProduct';
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/AdminDashboard') ? '/AdminDashboard' : '/Dashboard';
  const CreateProductState = useSelector((state: RootState) => state.CreateProduct);
  
  const [formInputs, setFormInputs] = useState<ProductForm[]>([{
    product_code: '',
    product_name: '',
    product_alert_number: 0,
    product_price: '',
  }]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentScanIndex, setCurrentScanIndex] = useState(0);
  const [torchOn, setTorchOn] = useState(false);

  const handleScan = (code: string) => {
    handleInputChange(currentScanIndex, 'product_code', code);
    setIsScannerOpen(false);
  };

  const handleInputChange = (index: number, field: keyof ProductForm, value: string | number) => {
    setFormInputs(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleAddNewInput = () => {
    setFormInputs(prev => [...prev, {
      product_code: '',
      product_name: '',
      product_alert_number: 0,
      product_price: '',
    }]);
  };

  const handleDelete = (index: number) => {
    setFormInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result as string;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              defval: "" 
            }) as any[][];
        
            const formattedData = data.slice(1).map((row) => {
        const [product_code, product_name, product_price, product_alert_number] = row;
        return {
          product_code: product_code || '',
          product_name: product_name || '',
          product_price: product_price || '',
          product_alert_number: +product_alert_number || 0,
        };
      });
      
      setFormInputs(formattedData);
    };
    reader.readAsBinaryString(file);
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = formInputs.map(input => ({
      product_code: input.product_code,
      product_name: input.product_name,
      product_alert_number: input.product_alert_number,
      product_price: input.product_price,
    }));
    dispatch(createProductFn(formData));
  };

  useEffect(() => {
    if (CreateProductState.isLoading) {
      toast.loading('Creating product...', { id: toastId });
    }
    if (CreateProductState.IsSuccess) {
      toast.success('Successfully created.', { id: toastId });
      navigate(`${basePath}/Products`);
    }
    if (CreateProductState.isError) {
      toast.error(CreateProductState.errorMsg, { id: toastId });
    }
    return () => { dispatch(resetProduct()); }
  }, [CreateProductState, dispatch, navigate, basePath]);

  const inputBase = 'soft-field';
  const labelBase = 'soft-label';
  const btnPrimary = 'soft-submit';
  const btnSecondary = 'soft-btn-secondary';

  return (
    <div className="soft-page">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
        {/* Header card */}
        <div className="soft-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#605BFF] dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
                <HiOutlineCube className="text-xl" />
              </div>
              <div>
                <h1 className="soft-title">Create Products</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Add new products to your inventory
                </p>
              </div>
            </div>
            <Link to={`${basePath}/Products`}>
              <button type="button" className={btnSecondary}>
                <HiOutlineCube className="text-lg" />
                All Products
              </button>
            </Link>
          </div>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="soft-card">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-3 justify-end items-center mb-6">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => document.getElementById('excel-import')!.click()}
              >
                <CiImport className="text-lg" />
                Import Excel
              </button>
              <input
                id="excel-import"
                type="file"
                accept=".csv, .xlsx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button type="button" className={btnSecondary} onClick={handleAddNewInput}>
                <GoPlus className="text-lg" />
                Add new
              </button>
            </div>

              {formInputs.map((input, index) => (
              <div key={index} className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <label className={labelBase}>Product Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input.product_code}
                        onChange={(e) => handleInputChange(index, 'product_code', e.target.value)}
                        placeholder="Scan or enter code"
                        className={`${inputBase} flex-1`}
                      />
                      <button
                        type="button"
                        className={btnSecondary + ' whitespace-nowrap'}
                        onClick={() => {
                          setCurrentScanIndex(index);
                          setIsScannerOpen(true);
                        }}
                      >
                        Scan
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className={labelBase}>Product Name</label>
                    <input
                      type="text"
                      value={input.product_name}
                      onChange={(e) => handleInputChange(index, 'product_name', e.target.value)}
                      placeholder="Product name"
                      className={inputBase}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className={labelBase}>Product Price</label>
                    <input
                      type="number"
                      value={input.product_price}
                      onChange={(e) => handleInputChange(index, 'product_price', e.target.value)}
                      placeholder="0"
                      className={inputBase}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className={labelBase}>Stock Alert</label>
                    <input
                      type="number"
                      value={input.product_alert_number}
                      onChange={(e) => handleInputChange(index, 'product_alert_number', Number(e.target.value))}
                      placeholder="0"
                      className={inputBase}
                    />
                  </div>

                  <div className="flex items-end justify-end col-span-full sm:col-span-2 lg:col-span-4">
                    <button
                      type="button"
                      className="px-4 py-2 flex items-center gap-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={() => handleDelete(index)}
                    >
                      <CiTrash /> Remove
                    </button>
                  </div>
                </div>
                {index !== formInputs.length - 1 && (
                  <hr className="my-6 border-indigo-100 dark:border-slate-700" />
                )}
              </div>
            ))}

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={CreateProductState.isLoading}
                className={`${btnPrimary} min-w-[200px] justify-center py-3 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {CreateProductState.isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Products'
                )}
              </button>
            </div>
          </div>
        </form>

        <ScannerDialog
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleScan}
          torchOn={torchOn}
          onTorchToggle={() => setTorchOn(!torchOn)}
        />
      </div>
    </div>
  );
}

interface ScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  torchOn: boolean;
  onTorchToggle: () => void;
}

const ScannerDialog = ({ 
  isOpen, 
  onClose, 
  onScan, 
  torchOn, 
  onTorchToggle 
}: ScannerDialogProps) => {
  const [manualCode, setManualCode] = useState('');

  const handleBarcodeScan = (err: unknown, result: any) => {
    if (result?.getText()) {
      onScan(result.getText());
    }
    if (err) {
      console.error('Scan error:', err);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Product Code Scanner</DialogTitle>
          <DialogDescription>
            Scan barcode or enter code manually
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <BarcodeScannerWrapper
              width={500}
              height={500}
              torch={torchOn}
              onUpdate={handleBarcodeScan}
              formats={['CODE_128', 'EAN_13', 'UPC_A', 'QR_CODE']}
            />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter code manually"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <Button onClick={handleManualSubmit}>
              Submit
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onTorchToggle}>
              {torchOn ? '🔦 Torch Off' : '🔦 Torch On'}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};