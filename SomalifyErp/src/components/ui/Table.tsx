import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import toast from 'react-hot-toast';
import { getAllProductsFn, resteAllProduct } from '@/Redux/Slice/getAllProductsSlice';
import { delProductFn, resetDelProducts } from '@/Redux/Slice/DeleteProductSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from '@/components/ui/ProductForm';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';

const getColumns = (onRefresh: () => void): GridColDef[] => [
  { field: 'product_code', headerName: 'Tracking no', width: 200 },
  { field: 'product_name', headerName: 'Product Name', width: 300 },
  {
    field: 'product_price',
    headerName: 'Price',
    width: 150,
    renderCell: (params) => (
      <div
        style={{
          backgroundColor: '#dbeafe',
          borderRadius: '6px',
          padding: '0px',
          marginTop: '13px',
          marginBottom: '13px',
          textAlign: 'center',
          color: '#2563eb',
        }}
      >
        ${params.value}
      </div>
    ),
  },
  {
    field: 'product_alert_number',
    headerName: 'Alert no',
    width: 150,
    renderCell: (params) => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {params.value}
      </div>
    ),
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 100,
    renderCell: (params) => (
      <ActionCell {...params} onRefresh={onRefresh} />
    ),
  },
];

export const ActionCell = (params:any) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = (event:any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpdate = () => {
    setIsUpdateOpen(true);
    handleClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteOpen(true);
    handleClose();
  };

  const handleDeleteConfirm = () => {
    const toastId = 'delete-product';
    dispatch(delProductFn(params.id));
    toast.loading('Deleting product...', { id: toastId });
    setIsDeleteOpen(false);
  };

  const refreshTable = React.useCallback(() => {
    if (params.onRefresh) {
      params.onRefresh();
    }
  }, [params]);

  return (
    <>
      <div className="flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
          className="p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <FiMoreVertical className="text-gray-600 dark:text-gray-400 text-lg" />
        </motion.button>
        <Menu
          id="long-menu"
          MenuListProps={{
            'aria-labelledby': 'long-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: 48 * 4.5,
              width: '20ch',
              borderRadius: '6px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
            },
          }}
        >
          <MenuItem 
            onClick={handleUpdate}
            className="flex items-center gap-2 text-sm"
          >
            <FiEdit2 className="text-blue-600" />
            <span>Update</span>
          </MenuItem>
          <MenuItem 
            onClick={handleDeleteClick}
            className="flex items-center gap-2 text-sm text-red-600"
          >
            <FiTrash2 />
            <span>Delete</span>
          </MenuItem>
        </Menu>
      </div>

      {/* Update Product Modal */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl w-[95vw] overflow-hidden border-0 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Update Product
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update product information. Modify the fields below.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ProductForm 
              mode="update" 
              productId={params.row.product_id}
              onSuccess={() => {
                setIsUpdateOpen(false);
                refreshTable();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 p-0 overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-orange-900/20 opacity-50" />
            
            <div className="relative p-6">
              <DialogHeader className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-4xl"
                  >
                    🗑️
                  </motion.div>
                </motion.div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Product?
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 text-base">
                  Are you sure you want to delete this product? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    📦
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Product Name</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {params.row.product_name}
                    </p>
                    {params.row.product_code && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Code: {params.row.product_code}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-6">
                <span className="text-lg">⚠️</span>
                <span className="font-medium">This action is permanent and cannot be reversed.</span>
              </div>

              <DialogFooter className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-all shadow-sm hover:shadow-md"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 via-red-600 to-pink-600 hover:from-red-600 hover:via-red-700 hover:to-pink-700 rounded-md transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="text-base" />
                  <span>Delete Product</span>
                </motion.button>
              </DialogFooter>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function ProductListdata() {
  const [paginationModel, setPaginationModel] = React.useState({
        page: 0, // MUI uses 0-based index
        pageSize: 20,
      });
  const dispatch = useDispatch<AppDispatch>();
  const AllProductState = useSelector((state: RootState) => state.AllProduct);
  const DelProductsState = useSelector((state: RootState) => state.DelProducs);

  const refreshTable = React.useCallback(() => {
    dispatch(getAllProductsFn({
      page: paginationModel.page + 1, // Convert to 1-based for backend
      pageSize: paginationModel.pageSize
    }));
  }, [dispatch, paginationModel.page, paginationModel.pageSize]);

  React.useEffect(() => {
    refreshTable();
  }, [refreshTable]);

  React.useEffect(() => {
    // Reset state when component mounts
    dispatch(resteAllProduct());
  }, [dispatch]);

   React.useEffect(() => {
                  if(AllProductState.isError) {
                           toast.error(AllProductState.errorMsg, { id: 'product-error'});
                           dispatch(resteAllProduct());
                       }
             }, [AllProductState.isError, AllProductState.errorMsg, dispatch]);

  React.useEffect(() => {
    const toastId = 'delete-product';
    if (DelProductsState.isLoading) {
      toast.loading('Deleting product...', { id: toastId });
    }
    if (DelProductsState.isSuccess) {
      toast.success('Product deleted successfully.', { id: toastId });
      refreshTable();
    }
    if (DelProductsState.isError) {
      toast.error(DelProductsState.errorMsg, { id: toastId });
    }
    dispatch(resetDelProducts());
  }, [DelProductsState.isLoading, DelProductsState.isError, DelProductsState.isSuccess, dispatch, refreshTable]);

  const columns = React.useMemo(() => getColumns(refreshTable), [refreshTable]);

  return (
    <Box
      className="w-full h-full border-none"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box className="flex-1 w-full">
        <DataGrid
          rows={AllProductState.data.map((product) => ({ id: product.product_id, ...product }))}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[20, 30, 50]}
          rowCount={AllProductState.total}
          paginationMode="server"
          sx={{
            paddingRight: '10px',
            paddingLeft: '10px',
          }}
        />
      </Box>
    </Box>
  );
}