import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllVendorsFn, resetAllVendor } from '@/Redux/Slice/GetAllVendor';
import { delVendorFn, resetDelVendor } from '@/Redux/Slice/DeleteVendor';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VendorForm } from '@/components/ui/VendorForm';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const getColumns = (onRefresh: () => void, onUpdate: (id: number) => void): GridColDef[] => [
  { field: 'vendor_id', headerName: 'ID', width: 90 },
  { field: 'vendor_name', headerName: 'Name', width: 200, flex: 1, minWidth: 150 },
  { field: 'vendor_address', headerName: 'Address', width: 250, flex: 1, minWidth: 150 },
  { field: 'vendor_email', headerName: 'Email', width: 200, flex: 1, minWidth: 150 },
  { field: 'vendor_phone', headerName: 'Phone', width: 150, flex: 0 },
  {
    field: 'action',
    headerName: 'Action',
    width: 100,
    sortable: false,
    renderCell: (params) => (
      <ActionCell {...params} onRefresh={onRefresh} onUpdate={onUpdate} />
    ),
  },
];

export const ActionCell = (params: any & { onRefresh?: () => void; onUpdate?: (id: number) => void }) => {
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleUpdate = () => setIsUpdateOpen(true);
  const handleDeleteClick = () => setIsDeleteOpen(true);

  const handleDeleteConfirm = () => {
    const toastId = 'delete-vendor';
    dispatch(delVendorFn(params.row.vendor_id));
    toast.loading('Deleting vendor...', { id: toastId });
    setIsDeleteOpen(false);
  };

  const refreshTable = React.useCallback(() => {
    if (params.onRefresh) {
      params.onRefresh();
    }
  }, [params]);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpdate}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <FiEdit2 className="w-3.5 h-3.5" />
          Update
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDeleteClick}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
          Delete
        </motion.button>
      </div>

      {/* Update Vendor Modal */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl w-[95vw] overflow-hidden border-0 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Update Vendor
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update vendor information. Modify the fields below.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <VendorForm 
              mode="update" 
              vendorId={params.row.vendor_id}
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
                  Delete Vendor?
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 text-base">
                  Are you sure you want to delete this vendor? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    🏢
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vendor Name</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {params.row.vendor_name}
                    </p>
                    {params.row.vendor_email && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Email: {params.row.vendor_email}
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
                  <span>Delete Vendor</span>
                </motion.button>
              </DialogFooter>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function VendorTable() {
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0, // MUI uses 0-based index
    pageSize: 20,
  });
  const [_isUpdateOpen, setIsUpdateOpen] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const AllVendorState = useSelector((state: RootState) => state.AllVendors);
  const DelVendorState = useSelector((state: RootState) => state.DelVendor);

  const refreshTable = React.useCallback(() => {
    dispatch(getAllVendorsFn({
      page: paginationModel.page + 1, // Convert to 1-based for backend
      pageSize: paginationModel.pageSize
    }));
  }, [dispatch, paginationModel.page, paginationModel.pageSize]);

  React.useEffect(() => {
    refreshTable();
  }, [refreshTable]);

  React.useEffect(() => {
    // Reset state when component mounts
    dispatch(resetAllVendor());
  }, [dispatch]);

  React.useEffect(() => {
    if (AllVendorState.isError) {
      toast.error(AllVendorState.errorMsg, { id: 'vendor-error' });
      dispatch(resetAllVendor());
    }
  }, [AllVendorState.isError, dispatch]);

  React.useEffect(() => {
    const toastId = 'delete-vendor';
    if (DelVendorState.isLoading) {
      toast.loading('Deleting vendor...', { id: toastId });
    }
    if (DelVendorState.isSuccess) {
      toast.success('Vendor deleted successfully.', { id: toastId });
      refreshTable();
    }
    if (DelVendorState.isError) {
      toast.error(DelVendorState.errorMsg, { id: toastId });
    }
    dispatch(resetDelVendor());
  }, [DelVendorState.isLoading, DelVendorState.isError, DelVendorState.isSuccess, dispatch, refreshTable]);

  const handleUpdate = React.useCallback((_id: number) => {
    setIsUpdateOpen(true);
  }, []);

  const columns = React.useMemo(() => getColumns(refreshTable, handleUpdate), [refreshTable, handleUpdate]);

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
          rows={AllVendorState.data.map((vendor) => ({ id: vendor.vendor_id, ...vendor }))}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[20, 30, 50]}
          rowCount={AllVendorState.total}
          paginationMode="server"
          loading={AllVendorState.isLoading}
          sx={{
            paddingRight: '10px',
            paddingLeft: '10px',
          }}
        />
      </Box>
    </Box>
  );
}
