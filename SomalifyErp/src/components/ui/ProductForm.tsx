import React, { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { GoPlus } from "react-icons/go";
import { CiImport, CiTrash } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { createProductFn, resetProduct } from '@/Redux/Slice/CreateProductSlice';
import { getOneProductFN } from '@/Redux/Slice/GEtOneProduct';
import { UpdateProductFn, resetProductUpdates } from '@/Redux/Slice/ProductUpdateSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BarcodeScannerWrapper from '../Qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ProductFormProps {
  mode: 'create' | 'update';
  productId?: number;
  onSuccess?: () => void;
}

interface ProductFormData {
  product_code: string;
  product_name: string;
  product_alert_number: number;
  product_price: string;
  category: string;
  description: string;
}

export function ProductForm({ mode, productId, onSuccess }: ProductFormProps) {
  const toastId = mode === 'create' ? 'createProduct' : 'updateProduct';
  const dispatch = useDispatch<AppDispatch>();
  
  const CreateProductState = useSelector((state: RootState) => state.CreateProduct);
  const UpdateProductState = useSelector((state: RootState) => state.UpdateProduct);
  const OneProductState = useSelector((state: RootState) => state.GetONeProduct);

  const [formInputs, setFormInputs] = useState<ProductFormData[]>([{
    product_code: '',
    product_name: '',
    product_alert_number: 0,
    product_price: mode === 'create' ? '0' : '',
    category: '',
    description: '',
  }]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentScanIndex, setCurrentScanIndex] = useState(0);
  const [torchOn, setTorchOn] = useState(false);

  // Load product data for update mode
  useEffect(() => {
    if (mode === 'update' && productId) {
      dispatch(getOneProductFN(productId));
    }
  }, [mode, productId, dispatch]);

  // Populate form with product data for update
  useEffect(() => {
    if (mode === 'update' && OneProductState.data) {
      setFormInputs([{
        product_code: OneProductState.data.product_code || '',
        product_name: OneProductState.data.product_name || '',
        product_alert_number: OneProductState.data.product_alert_number || 0,
        product_price: OneProductState.data.product_price || '',
        category: OneProductState.data.category || '',
        description: OneProductState.data.description || '',
      }]);
    }
  }, [mode, OneProductState.data]);

  // Handle create success
  useEffect(() => {
    if (mode === 'create') {
      if (CreateProductState.isLoading) {
        toast.loading('Creating Product...', { id: toastId });
      }
      if (CreateProductState.IsSuccess) {
        toast.success('Successfully created.', { id: toastId });
        onSuccess?.();
        dispatch(resetProduct());
        // Reset form
        setFormInputs([{
          product_code: '',
          product_name: '',
          product_alert_number: 0,
          product_price: '0',
          category: '',
          description: '',
        }]);
      }
      if (CreateProductState.isError) {
        toast.error(CreateProductState.errorMsg, { id: toastId });
        dispatch(resetProduct());
      }
    }
  }, [CreateProductState.IsSuccess, CreateProductState.isLoading, CreateProductState.isError, dispatch, mode, toastId, onSuccess]);

  // Handle update success
  useEffect(() => {
    if (mode === 'update') {
      if (UpdateProductState.isLoading) {
        toast.loading('Updating product...', { id: toastId });
      }
      if (UpdateProductState.IsSuccess) {
        toast.success('Successfully updated.', { id: toastId });
        onSuccess?.();
        dispatch(resetProductUpdates());
      }
      if (UpdateProductState.isError) {
        toast.error(UpdateProductState.errorMsg, { id: toastId });
        dispatch(resetProductUpdates());
      }
    }
  }, [UpdateProductState.isLoading, UpdateProductState.IsSuccess, UpdateProductState.isError, dispatch, mode, toastId, onSuccess]);

  const handleScan = (code: string) => {
    handleInputChange(currentScanIndex, 'product_code', code);
    setIsScannerOpen(false);
  };

  const handleInputChange = (index: number, field: keyof ProductFormData, value: string | number) => {
    setFormInputs(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleAddNewInput = () => {
    setFormInputs(prev => [...prev, {
      product_code: '',
      product_name: '',
      product_alert_number: 0,
      product_price: mode === 'create' ? '0' : '',
      category: '',
      description: '',
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
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: "" 
      });
        
      const formattedData = data.slice(1).map((row) => {
        // Columns: code, name, price, alert, category, description (cost is optional; use purchase cost in reports)
        const product_code = row[0] ?? '';
        const product_name = row[1] ?? '';
        const product_price = row[2] != null && row[2] !== '' ? String(row[2]) : '0';
        const product_alert_number = +(row[3] ?? 0);
        const category = (row[4] ?? '') || '';
        const description = (row[5] ?? '') || '';
        return {
          product_code: product_code || '',
          product_name: product_name || '',
          product_price,
          product_alert_number: product_alert_number || 0,
          category,
          description,
        };
      });
      
      setFormInputs(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      const formData = formInputs.map(input => ({
        product_code: input.product_code,
        product_name: input.product_name,
        product_alert_number: input.product_alert_number,
        product_price: input.product_price || '0',
        category: input.category || undefined,
        description: input.description || undefined,
      }));
      dispatch(createProductFn(formData));
    } else if (mode === 'update' && productId) {
      const productData = {
        product_code: formInputs[0].product_code,
        product_name: formInputs[0].product_name,
        product_alert_number: formInputs[0].product_alert_number,
        product_price: formInputs[0].product_price,
        category: formInputs[0].category || undefined,
        description: formInputs[0].description || undefined,
        product_id: productId,
      };
      dispatch(UpdateProductFn(productData));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'create' && (
            <div className="flex gap-2 justify-end mb-4">
              <button
                type="button"
                className="bg-blue-600 px-4 py-2 gap-2 flex items-center text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => document.getElementById('excel-import')?.click()}
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
              <button
                type="button"
                className="px-4 py-2 flex gap-2 items-center bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={handleAddNewInput}
              >
                <GoPlus className="text-lg" />
                Add New
              </button>
            </div>
          )}

          <div className="space-y-6">
            {formInputs.map((input, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={input.product_code}
                        onChange={(e) => handleInputChange(index, 'product_code', e.target.value)}
                        placeholder="Scan or enter code"
                        required
                      />
                      <button
                        type="button"
                        className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => {
                          setCurrentScanIndex(index);
                          setIsScannerOpen(true);
                        }}
                      >
                        📷
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={input.product_name}
                      onChange={(e) => handleInputChange(index, 'product_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={input.product_price}
                      onChange={(e) => handleInputChange(index, 'product_price', e.target.value)}
                      placeholder="Selling price"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Alert
                    </label>
                    <input
                      type="number"
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={input.product_alert_number}
                      onChange={(e) => handleInputChange(index, 'product_alert_number', Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={input.category}
                      onChange={(e) => handleInputChange(index, 'category', e.target.value)}
                      placeholder="e.g. Electronics, Food"
                    />
                  </div>

                  <div className="flex flex-col sm:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      value={input.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      placeholder="Product description (optional)"
                      rows={2}
                    />
                  </div>
                </div>
                {mode === 'create' && formInputs.length > 1 && (
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 flex items-center gap-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={() => handleDelete(index)}
                    >
                      <CiTrash />
                      Delete
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {mode === 'create' ? 'Create Products' : 'Update Product'}
            </button>
          </div>
        </div>
      </form>

      {/* Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Product Code Scanner
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Scan barcode or enter code manually
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <BarcodeScannerWrapper
                width={500}
                height={500}
                torch={torchOn}
                onUpdate={(err: unknown, result: any) => {
                  if (result?.getText()) {
                    handleScan(result.getText());
                  }
                  if (err) {
                    console.error('Scan error:', err);
                  }
                }}
                formats={['CODE_128', 'EAN_13', 'UPC_A', 'QR_CODE']}
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter code manually"
                value={formInputs[currentScanIndex]?.product_code || ''}
                onChange={(e) => handleInputChange(currentScanIndex, 'product_code', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsScannerOpen(false);
                  }
                }}
                className="flex-1"
              />
            </div>

            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={() => setTorchOn(!torchOn)}
                className="rounded-md"
              >
                {torchOn ? '🔦 Torch Off' : '🔦 Torch On'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setIsScannerOpen(false)}
                className="rounded-md"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}