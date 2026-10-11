import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch } from 'react-redux';

import toast from 'react-hot-toast';

import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';

// import { getOneVendorFn, resetOneVendor } from '@/Redux/Slice/GetOneVendor';
import { Link } from 'react-router-dom';

import { format } from 'date-fns';
import { getAllPurchasesSortFn, resetAllPurchaseSort } from '@/Redux/Slice/AllPurchaseSortSlice';
import { delPurchaseFn, resetDelPurchase } from '@/Redux/Slice/DeletePurchase';

const columns: GridColDef[] = [
  { field: 'purchase_id', headerName: 'Id', width: 80, flex: 0 },
  {
    field: 'product_name',
    headerName: 'Product Name',
    width: 180,
    flex: 1,
    minWidth: 150,
    renderCell: (params) =>
      params.row.products?.product_name || 'N/A',
  },
  {
    field: 'purchase_qty',
    headerName: 'Quantity',
    width: 100,
    flex: 0,
    valueFormatter: (value: any) => {
      const n = parseFloat(String(value ?? 0).replace(',', '.'));
      return Number.isNaN(n) ? '0' : String(n);
    },
  },
  { field: 'container_number', headerName: 'Container', width: 120, flex: 0,
    valueFormatter: (value: any) => value || '—',
  },
  { field: 'item_cost', headerName: 'Cost', width: 100, flex: 0 },
  {
    field: 'Total Amount',
    headerName: 'Total Amount',
    width: 110,
    flex: 0,
    valueGetter: (_value: any, row: any) => {
      const qty = Number(row?.purchase_qty) || 0;
      const cost = Number(row?.item_cost) || 0;
      const extra = Number(row?.extra_cost) || 0;
      return qty * cost + extra;
    },
    renderCell: (params: any) => {
      const qty = Number(params?.row?.purchase_qty) || 0;
      const cost = Number(params?.row?.item_cost) || 0;
      const extra = Number(params?.row?.extra_cost) || 0;
      return `$${(qty * cost + extra).toFixed(2)}`;
    },
  },
  { field: 'purchase_discount', headerName: 'Discount', width: 100, flex: 0 },
  { field: 'paid_amount', headerName: 'Paid Amount', width: 120, flex: 0 },
  { field: 'purchase_debt', headerName: 'Debt', width: 100, flex: 0 },
  { field: 'created_at', headerName: 'Created Date', width: 130, flex: 0,
    valueFormatter: (value: any) => {
      if (!value) return '';
      const date = new Date(value);
      return isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd');
    }
  },
  { field: 'updated_at', headerName: 'Updated Date', width: 130, flex: 0,
    valueFormatter: (value: any) => {
      if (!value) return '';
      const date = new Date(value);
      return isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd');
    }
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 80,
    flex: 0,
    sortable: false,
    renderCell: (params) => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ActionCell {...params} />
      </div>
    ),
  },
];

export const ActionCell = (params:any) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch<AppDispatch>()
  // const navigate = useNavigate();
  // const toastId = "deleteVendor";

  const handleClick = (event:any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    dispatch(delPurchaseFn(params.row.purchase_id));
    dispatch(resetDelPurchase());
    handleClose();
  };

  // const GetOneVendorHandle = () => {
  //   dispatch(getOneVendorFn(params.row.vendor_id));
  //   dispatch(resetOneVendor());
  //   handleClose();
  // };

  return (
    <div>
      <MoreVertIcon
        aria-label="more"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      />
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
          },
        }}
      >
        <Link to={`${window.location.pathname.startsWith('/AdminDashboard') ? '/AdminDashboard' : '/Dashboard'}/Purchases/Details/${params.row.purchase_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem>Details</MenuItem>
        </Link>
        <Link to={`${window.location.pathname.startsWith('/AdminDashboard') ? '/AdminDashboard' : '/Dashboard'}/Purchases/Update/${params.row.purchase_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={() => console.log('Update')}>Update</MenuItem>
        </Link>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        <MenuItem onClick={() => console.log('More')}>More</MenuItem>
      </Menu>
    </div>
  );
};

export default function DataPurchases() {
   const [paginationModel, setPaginationModel] = React.useState({
        page: 0, // MUI uses 0-based index
        pageSize: 20,
      });


      

  const toastId = "Del Purchase";
  // const VendorState = useSelector((state: RootState) => state.AllVendors);
  const AllPurchaseState = useSelector((state: RootState) => state.GetSortPurchase);
  const dispatch = useDispatch<AppDispatch>();



   

  // React.useEffect(() => {
  //   dispatch(getAllVendorsFn());
  // }, [dispatch]);

  React.useEffect(() => {
        dispatch(getAllPurchasesSortFn({ 
          page: paginationModel.page + 1, // Convert to 1-based for backend
          pageSize: paginationModel.pageSize 
        }));
      }, [dispatch, paginationModel]);

      React.useEffect(() => {
         if(AllPurchaseState.isError) {
                  toast.error(AllPurchaseState.errorMsg, { id: 'purchase-error'});
              }
              dispatch(resetAllPurchaseSort())
    }, [AllPurchaseState.isError, dispatch]);

  const DeletePurchase = useSelector((state: RootState) => state.DeletePurchase);

  React.useEffect(() => {
    if (DeletePurchase.isLoading) toast.loading('Deleting!', { id: toastId });
    if (DeletePurchase.isSuccess) {
      toast.success('Purchase is deleted.', { id: toastId });
      resetAllPurchaseSort()
      dispatch(getAllPurchasesSortFn({ 
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize 
      }));
      dispatch(resetDelPurchase());
    }
    if (DeletePurchase.isError) {
      toast.error(DeletePurchase.errorMsg, { id: toastId });
      dispatch(resetDelPurchase());
    }
    dispatch(resetDelPurchase());
  }, [DeletePurchase.isLoading, DeletePurchase.isSuccess, DeletePurchase.isError, DeletePurchase.errorMsg, dispatch, paginationModel.page, paginationModel.pageSize]);

 

  // Ensure data is always an array
  const purchaseData = Array.isArray(AllPurchaseState?.data) ? AllPurchaseState.data : [];


    // console.log("AllPurchaseState.data:", AllPurchaseState.data);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ flex: 1, width: '100%', minWidth: 0, overflow: 'hidden' }}>
        <DataGrid
          rows={purchaseData?.map((purchase) => ({ id: purchase.purchase_id, ...purchase }))}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[20, 30, 50]}
          rowCount={AllPurchaseState.total}
          paginationMode="server"
          autoHeight={false}
          disableColumnMenu={false}
          disableRowSelectionOnClick
          sx={{
            width: '100%',
            minWidth: 0,
            border: 'none',
            '& .MuiDataGrid-root': {
              width: '100%',
              minWidth: 0,
              border: 'none',
            },
            '& .MuiDataGrid-main': {
              width: '100%',
              minWidth: 0,
            },
            '& .MuiDataGrid-container--top': {
              width: '100%',
            },
            '& .MuiDataGrid-container--bottom': {
              width: '100%',
            },
            '& .MuiDataGrid-virtualScroller': {
              width: '100%',
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              width: '100%',
            },
            '& .MuiDataGrid-row': {
              width: '100%',
            },
            '& .MuiDataGrid-cell': {
              minWidth: 0,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Box>
    </Box>
  );
}