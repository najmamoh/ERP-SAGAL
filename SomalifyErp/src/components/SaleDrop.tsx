// // DialogDemo.tsx
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import React, { useEffect } from "react";
// import { useQRCodeScanner } from "./Qrcode";

// export interface PurchaseData {
//   purchase_id: number;
//   purchase_qty: number;
//   item_cost: string;
//   purchase_discount: string;
//   paid_amount: string;
//   purchase_debt: string;
//   expiry_date: string;
//   manufacture_date: string;
//   vendor_id: number;
//   product_id: number;
//   created_at: string;
//   updated_at: string;
//   products: {
//     product_id: number;
//     product_code: string;
//     product_name: string;
//     product_cost: string;
//     product_price: string;
//     product_alert_number: number;
//     company_id: string;
//     created_at: string;
//     updated_at: string;
//   };
// }

// interface DialogDemoProps {
//   isOpen: boolean;
//   onClose: () => void;
//   purchases: PurchaseData[];
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
//   onSelectPurchase: (purchaseId: string) => void;
//   pagination: {
//     page: number;
//     pageSize: number;
//     total: number;
//   };
//   setPagination: React.Dispatch<React.SetStateAction<{
//     page: number;
//     pageSize: number;
//     total: number;
//   }>>;
// }

// export function DialogDemo({
//   isOpen,
//   onClose,
//   purchases,
//   searchTerm,
//   setSearchTerm,
//   onSelectPurchase,
//   pagination,
//   setPagination,
// }: DialogDemoProps) {
//   const totalPages = Math.ceil(pagination.total / pagination.pageSize);
//   const { startScanning, stopScanning, isScanning, videoRef } = useQRCodeScanner({
//     onScan: (data) => {
//       setSearchTerm(data);
//       stopScanning();
//     }
//   });

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => {
//       if (!open) {
//         stopScanning();
//         onClose();
//       }
//     }}>
//       <DialogContent className="sm:max-w-[600px] bg-white text-black">
//         <DialogHeader>
//           <DialogTitle>Select Product</DialogTitle>
//           <DialogDescription>
//             Search by product name/code or scan barcode
//           </DialogDescription>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           <div className="flex gap-2">
//             <Input
//               placeholder="Search or scan barcode"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               autoFocus
//             />
//             <Button
//               type="button"
//               onClick={isScanning ? stopScanning : startScanning}
//               variant={isScanning ? "destructive" : "default"}
//             >
//               {isScanning ? 'Stop Camera' : 'Use Camera'}
//             </Button>
//           </div>

//           {isScanning && (
//             <div className="relative h-64 bg-black rounded-lg overflow-hidden">
//               <video 
//                 ref={videoRef}
//                 className="h-full w-full object-cover"
//                 playsInline
//                 muted
//                 style={{ transform: 'scaleX(-1)' }}
//               />
//               <div className="absolute inset-0 border-4 border-green-400 pointer-events-none" 
//                    style={{borderRadius: '30%'}} />
//             </div>
//           )}

//           <div className="max-h-[300px] overflow-y-auto">
//             {purchases
//               ?.filter(purchase => 
//                 purchase.products.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 purchase.products.product_code.toLowerCase().includes(searchTerm.toLowerCase())
//               )
//               .map(purchase => (
//                 <div
//                   key={purchase.purchase_id}
//                   className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-4 rounded"
//                   onClick={() => {
//                     onSelectPurchase(purchase.purchase_id.toString());
//                     onClose();
//                   }}
//                 >
//                   <div className="text-sm text-gray-500">{purchase.products.product_code}</div>
//                   <div className="font-medium">{purchase.products.product_name}</div>
//                   <div className="text-sm">Available: {purchase.purchase_qty}</div>
//                 </div>
//               ))}
//           </div>
//         </div>
//         <div className="flex justify-between mt-4">
//           <Button
//             disabled={pagination.page === 1}
//             onClick={() => setPagination(prev => ({
//               ...prev,
//               page: prev.page - 1
//             }))}
//           >
//             Previous
//           </Button>
//           <span>Page {pagination.page} of {totalPages}</span>
//           <Button
//             disabled={pagination.page >= totalPages}
//             onClick={() => setPagination(prev => ({
//               ...prev,
//               page: prev.page + 1
//             }))}
//           >
//             Next
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// DialogDemo.tsx (Updated)
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import React, { useState } from "react";
// import { useBarcodeScanner } from "./Qrcode";

// interface Product {
//   product_id: number;
//   product_code: string;
//   product_name: string;
//   product_cost: string;
//   product_price: string;
//   product_alert_number: number;
//   company_id: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface PurchaseData {
//   purchase_id: number;
//   purchase_qty: number;
//   item_cost: string;
//   products: Product;
// }

// interface DialogDemoProps {
//   isOpen: boolean;
//   onClose: () => void;
//   purchases: PurchaseData[];
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
//   onSelectPurchase: (purchaseId: string) => void;
//   pagination: {
//     page: number;
//     pageSize: number;
//     total: number;
//   };
//   setPagination: React.Dispatch<React.SetStateAction<{
//     page: number;
//     pageSize: number;
//     total: number;
//   }>>;
// }

// export function DialogDemo({
//   isOpen,
//   onClose,
//   purchases,
//   searchTerm,
//   setSearchTerm,
//   onSelectPurchase,
//   pagination,
//   setPagination,
// }: DialogDemoProps) {
//   const [scanError, setScanError] = useState<string | null>(null);
//   const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  
//   const {
//     ScannerComponent,
//     isScanning,
//     startScanning,
//     stopScanning,
//     toggleTorch
//   } = useBarcodeScanner({
//     onScan: (data) => {
//       setSearchTerm(data);
//       stopScanning();
//     },
//     onError: (error) => {
//       setScanError(error.message);
//       setTimeout(() => setScanError(null), 3000);
//     }
//   });

//   const handleDialogChange = (open: boolean) => {
//     if (!open) {
//       stopScanning();
//       onClose();
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={handleDialogChange}>
//       <DialogContent className="sm:max-w-[600px] bg-white text-black">
//         <DialogHeader>
//           <DialogTitle>Product Search</DialogTitle>
//           <DialogDescription>
//             Scan barcode or search manually
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid gap-4 py-4">
//           <div className="flex gap-2">
//             <Input
//               placeholder="Enter product code or scan"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               autoFocus
//               className="flex-1"
//             />
//             <Button
//               type="button"
//               onClick={isScanning ? stopScanning : startScanning}
//               variant={isScanning ? "destructive" : "default"}
//             >
//               {isScanning ? 'Stop Scan' : 'Start Scan'}
//             </Button>
//           </div>

//           {scanError && (
//             <div className="text-red-500 text-sm">{scanError}</div>
//           )}

//           {isScanning && ScannerComponent()}

//           <div className="max-h-[300px] overflow-y-auto space-y-2">
//             {purchases
//               .filter(purchase => 
//                 purchase.products.product_code.toLowerCase() === searchTerm.toLowerCase() ||
//                 purchase.products.product_name.toLowerCase().includes(searchTerm.toLowerCase())
//               )
//               .map(purchase => (
//                 <div
//                   key={purchase.purchase_id}
//                   className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between rounded-lg border"
//                   onClick={() => {
//                     onSelectPurchase(purchase.purchase_id.toString());
//                     onClose();
//                   }}
//                 >
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">
//                       {purchase.products.product_name}
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       Code: {purchase.products.product_code}
//                     </div>
//                   </div>
//                   <div className="text-sm font-semibold text-blue-600">
//                     Stock: {purchase.purchase_qty}
//                   </div>
//                 </div>
//               ))}
//           </div>
//         </div>

//         <div className="flex justify-between items-center mt-4">
//           <Button
//             disabled={pagination.page === 1}
//             onClick={() => setPagination(prev => ({
//               ...prev,
//               page: Math.max(1, prev.page - 1)
//             }))}
//             variant="outline"
//           >
//             Previous
//           </Button>
//           <span className="text-sm text-gray-600">
//             Page {pagination.page} of {totalPages}
//           </span>
//           <Button
//             disabled={pagination.page >= totalPages}
//             onClick={() => setPagination(prev => ({
//               ...prev,
//               page: Math.min(totalPages, prev.page + 1)
//             }))}
//             variant="outline"
//           >
//             Next
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }




// DialogDemo.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
// import BarcodeScannerComponent from "react-qr-barcode-scanner";
import BarcodeScannerWrapper from "./Qrcode";

// Full PurchaseData Interface
export interface PurchaseData {
  purchase_id: number;
  purchase_qty: number;
  item_cost: string;
  purchase_discount: string;
  paid_amount: string;
  purchase_debt: string;
  expiry_date: string;
  manufacture_date: string;
  vendor_id: number;
  product_id: number;
  created_at: string;
  updated_at: string;
  products: {
    product_id: number;
    product_code: string;
    product_name: string;
    product_cost: string;
    product_price: string;
    product_alert_number: number;
    company_id: string;
    created_at: string;
    updated_at: string;
  };
}

interface DialogDemoProps {
  isOpen: boolean;
  onClose: () => void;
  purchases: PurchaseData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectPurchase: (purchaseId: string) => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  setPagination: React.Dispatch<React.SetStateAction<{
    page: number;
    pageSize: number;
    total: number;
  }>>;
}

export function DialogDemo({
  isOpen,
  onClose,
  purchases,
  searchTerm,
  setSearchTerm,
  onSelectPurchase,
  pagination,
  setPagination,
}: DialogDemoProps) {
  const [torchOn, setTorchOn] = useState(false);
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  const handleScan = (err: any, result: any) => {
    if (result) {
      setSearchTerm(result.getText());
      onClose();
    }
    if (err) {
      console.error('Scan error:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white text-black flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
          <DialogDescription>
            Search by product name/code or scan barcode
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex gap-2">
            <Input
              placeholder="Search or scan barcode"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <Button
              type="button"
              onClick={() => setTorchOn(!torchOn)}
              variant="outline"
            >
              {torchOn ? '🔦 Torch Off' : '🔦 Torch On'}
            </Button>
          </div>

          <div className="relative h-64 bg-black rounded-lg overflow-hidden">
            <BarcodeScannerWrapper
              width={400}
              height={400}
              torch={torchOn}
              onUpdate={handleScan}
              formats={[
                'QR_CODE',
                'CODE_128',
                'EAN_13',
                'UPC_A',
                'UPC_E',
                'EAN_8',
                'CODE_39',
              ]}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2 pr-2">
              {purchases
                ?.filter(purchase => 
                  purchase.products.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  purchase.products.product_code.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(purchase => (
                  <div
                    key={purchase.purchase_id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-4 rounded"
                    onClick={() => {
                      onSelectPurchase(purchase.purchase_id.toString());
                      onClose();
                    }}
                  >
                    <div className="text-sm text-gray-500">{purchase.products.product_code}</div>
                    <div className="font-medium flex-1">{purchase.products.product_name}</div>
                    <div className="text-sm">Available: {purchase.purchase_qty}</div>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 pt-2 border-t">
            <Button
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({
                ...prev,
                page: Math.max(1, prev.page - 1)
              }))}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              disabled={pagination.page >= totalPages}
              onClick={() => setPagination(prev => ({
                ...prev,
                page: Math.min(totalPages, prev.page + 1)
              }))}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export const CustomerDialog = ({
  isOpen,
  onClose,
  customers,
  searchTerm,
  setSearchTerm,
  onSelectCustomer,
  pagination,
  setPagination,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectCustomer: (customerId: string) => void;
  pagination: { page: number; pageSize: number; total: number };
  setPagination: (val: any) => void;
  isLoading?: boolean;
}) => {
  const filteredCustomers = searchTerm.trim()
    ? customers.filter(
        (c) =>
          (c.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.customer_phone || '').includes(searchTerm) ||
          (c.customer_address || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-dialog-title"
    >
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="customer-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
            Select Customer
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by name, phone, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-slate-200 dark:border-gray-600 p-2.5 w-full mb-4 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          autoFocus
        />
        <div className="max-h-96 overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              {searchTerm.trim() ? 'No customers match your search' : 'No customers found'}
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-gray-600">
              {filteredCustomers.map((customer) => (
                <li
                  key={customer.customer_id}
                  onClick={() => onSelectCustomer(String(customer.customer_id))}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900 dark:text-white">{customer.customer_name}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{customer.customer_phone}</span>
                  </div>
                  {customer.customer_address && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{customer.customer_address}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 dark:border-gray-600">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page - 1 }))}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}
          </span>
          <button
            type="button"
            disabled={pagination.page * pagination.pageSize >= pagination.total}
            onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page + 1 }))}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};