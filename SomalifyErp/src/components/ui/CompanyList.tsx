import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import toast from 'react-hot-toast';
import { getAllCompaniesFn, resetAllCompanies } from '@/Redux/Slice/GetAllCompaniesSlice';
import { delCompanyFn, resetDelCompany } from '@/Redux/Slice/DeleteCompanySlice';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { FaTrashAlt } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CompanyForm } from '@/components/ui/CompanyForm';
import { UserForm } from '@/components/ui/UserForm';
import { format } from 'date-fns';
import { FiUserPlus } from 'react-icons/fi';

const getColumns = (onRefresh: () => void): GridColDef[] => [
  { 
    field: 'index', 
    headerName: '#', 
    width: 60,
    sortable: false,
    resizable: false,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => {
      const rowIndex = params.api.getAllRowIds().indexOf(params.id) + 1;
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
          <span className="font-semibold text-sm text-indigo-700 dark:text-indigo-300">{rowIndex}</span>
        </div>
      );
    }
  },
  { 
    field: 'company_name', 
    headerName: 'Company Name', 
    minWidth: 160,
    flex: 1,
    resizable: true,
    renderCell: (params) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-white font-bold text-xs">{params.value?.charAt(0)?.toUpperCase() || 'C'}</span>
        </div>
        <span className="font-semibold text-gray-900 dark:text-white truncate">{params.value}</span>
      </div>
    )
  },
  { 
    field: 'company_email', 
    headerName: 'Email', 
    minWidth: 180,
    flex: 1.2,
    resizable: true,
    renderCell: (params) => (
      <span className="text-gray-600 dark:text-gray-300 truncate">{params.value}</span>
    )
  },
  { 
    field: 'company_phone', 
    headerName: 'Phone', 
    minWidth: 120,
    flex: 0.9,
    resizable: true,
    renderCell: (params) => (
      <span className="text-gray-700 dark:text-gray-300 font-medium">{params.value || '-'}</span>
    )
  },
  { 
    field: 'company_address', 
    headerName: 'Address', 
    minWidth: 150,
    flex: 1,
    resizable: true,
    renderCell: (params) => (
      <span className="text-gray-600 dark:text-gray-400 text-sm truncate">{params.value || '-'}</span>
    )
  },
  { 
    field: 'taxable', 
    headerName: 'Taxable', 
    width: 120,
    resizable: false,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`px-3 py-1.5 rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm ${
          params.value 
            ? 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${params.value ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
        {params.value ? 'Yes' : 'No'}
      </motion.div>
    )
  },
  { 
    field: 'isBanned', 
    headerName: 'Status', 
    width: 130,
    resizable: false,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`px-3 py-1.5 rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm ${
          params.value 
            ? 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
            : 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${params.value ? 'bg-red-500' : 'bg-green-500'}`}></span>
        {params.value ? 'Banned' : 'Active'}
      </motion.div>
    )
  },
  { 
    field: 'created_at', 
    headerName: 'Created', 
    width: 130,
    resizable: false,
    renderCell: (params) => {
      if (!params.value) return <span className="text-xs text-gray-400">-</span>;
      try {
        return (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {format(new Date(params.value), 'MMM dd')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(params.value), 'yyyy')}
            </span>
          </div>
        );
      } catch (error) {
        return <span className="text-xs text-gray-400">-</span>;
      }
    }
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 100,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ActionCell {...params} onRefresh={onRefresh} />
      </div>
    ),
  },
];

export const ActionCell = (params:any) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = React.useState(false);
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

  const handleCreateUserClick = () => {
    setIsCreateUserOpen(true);
    handleClose();
  };

  const handleDeleteConfirm = () => {
    dispatch(delCompanyFn(params.row.company_id));
    setIsDeleteOpen(false);
  };

  return (
    <>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
              borderRadius: '10px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
            },
          }}
        >
          <MenuItem 
            onClick={handleUpdate}
            className="flex items-center gap-2 text-sm"
          >
            <FiEdit2 className="text-indigo-600" />
            <span>Update</span>
          </MenuItem>
          <MenuItem 
            onClick={handleCreateUserClick}
            className="flex items-center gap-2 text-sm text-blue-600"
          >
            <FiUserPlus className="text-blue-600" />
            <span>Create User</span>
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

      {/* Update Company Modal */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl w-[95vw] overflow-hidden border-0 rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Update Company
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update company information. Modify the fields below.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <CompanyForm 
              mode="update" 
              companyId={params.row.company_id}
              onSuccess={() => {
                setIsUpdateOpen(false);
                if (params.onRefresh) params.onRefresh();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Company User Modal */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl w-[95vw] overflow-hidden border-0 rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Add Company User</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">Create a new user for this company</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <UserForm 
              mode="create" 
              userType="company"
              selectedUserType="company"
              initialCompanyId={params.row.company_id}
              onSuccess={() => {
                setIsCreateUserOpen(false);
                if (params.onRefresh) params.onRefresh();
              }}
              onClose={() => setIsCreateUserOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 p-6 text-white"
          >
            <div className="flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="bg-white/20 p-3 rounded-full mb-4 shadow-lg"
              >
                <FaTrashAlt className="text-3xl text-white" />
              </motion.div>
              <DialogTitle className="text-2xl font-bold text-white mb-1">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-sm text-white/90 text-center">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </motion.div>

          <div className="p-6 bg-white dark:bg-gray-800">
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <span className="font-semibold">⚠️ Warning:</span> You are about to delete the company:
              </p>
              <p className="text-base font-bold text-red-800 dark:text-red-200 mt-2">
                {params.row.company_name}
              </p>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              Are you absolutely sure you want to delete this company? All associated data will be permanently removed.
            </p>

            <DialogFooter className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDeleteOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(239, 68, 68, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg shadow-lg transition-all flex items-center gap-2"
              >
                <FiTrash2 />
                <span>Delete Company</span>
              </motion.button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function CompanyListData() {
  const dispatch = useDispatch<AppDispatch>();
  const AllCompaniesState = useSelector((state: RootState) => state.AllCompanies);
  const DeleteCompanyState = useSelector((state: RootState) => state.DeleteCompany);

  const refreshTable = React.useCallback(() => {
    dispatch(getAllCompaniesFn());
  }, [dispatch]);

  React.useEffect(() => {
    refreshTable();
  }, [refreshTable]);

  React.useEffect(() => {
    if (AllCompaniesState.isError) {
      toast.error(AllCompaniesState.errorMsg, { id: 'company-error' });
      dispatch(resetAllCompanies());
    }
  }, [AllCompaniesState.isError, dispatch]);

  React.useEffect(() => {
    const toastId = 'delete-company';
    if (DeleteCompanyState.isLoading) {
      toast.loading('Deleting company...', { id: toastId });
    }
    if (DeleteCompanyState.isSuccess) {
      toast.success('Company deleted successfully.', { id: toastId });
      refreshTable();
    }
    if (DeleteCompanyState.isError) {
      toast.error(DeleteCompanyState.errorMsg, { id: toastId });
    }
    dispatch(resetDelCompany());
  }, [DeleteCompanyState.isLoading, DeleteCompanyState.isError, DeleteCompanyState.isSuccess, dispatch, refreshTable]);

  const columns = React.useMemo(() => getColumns(refreshTable), [refreshTable]);

  // Ensure data is an array and map correctly
  const rows = React.useMemo(() => {
    if (!AllCompaniesState.data) {
      return [];
    }
    // Handle both array and object responses
    const raw = AllCompaniesState.data;
    const companiesArray = Array.isArray(raw) ? raw : ((raw as { data?: unknown[] })?.data || []);
    
    if (!Array.isArray(companiesArray)) {
      return [];
    }
    
    return companiesArray.map((company: any) => ({ 
      id: company.company_id, 
      ...company 
    }));
  }, [AllCompaniesState.data]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '600px',
        minHeight: '400px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={AllCompaniesState.isLoading}
        autoHeight={false}
        disableColumnResize={false}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 20 },
          },
        }}
        pageSizeOptions={[20, 30, 50]}
        sx={{
          flex: 1,
          width: '100%',
          border: 'none',
          '& .MuiDataGrid-root': {
            border: 'none',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
          '& .MuiDataGrid-container--top [role=row]': {
            backgroundColor: 'transparent',
          },
          '& .MuiDataGrid-main': {
            width: '100%',
            flex: 1,
            overflow: 'auto',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflow: 'auto',
          },
          '& .MuiDataGrid-container': {
            width: '100%',
          },
          '& .MuiDataGrid-scrollbar': {
            display: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '2px solid rgba(99, 102, 241, 0.1)',
            backgroundColor: 'rgba(249, 250, 251, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '12px 0',
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '0 16px',
            '&:focus': {
              outline: 'none',
            },
            '&:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: '700',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6b7280',
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid transparent',
            marginBottom: '8px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
              borderColor: 'rgba(99, 102, 241, 0.2)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
              },
            },
          },
          '& .MuiDataGrid-virtualScrollerContent': {
            padding: '12px',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid rgba(99, 102, 241, 0.1)',
            padding: '16px',
            backgroundColor: 'rgba(249, 250, 251, 0.8)',
            backdropFilter: 'blur(10px)',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: '16px',
          },
          // Dark mode styles
          '&.MuiDataGrid-root--dark': {
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderBottom: '2px solid rgba(99, 102, 241, 0.2)',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: '#d1d5db',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              color: '#e5e7eb',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.3)',
                },
              },
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderTop: '2px solid rgba(99, 102, 241, 0.2)',
            },
          },
        }}
        />
    </Box>
  );
}