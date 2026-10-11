import { getAllEmployersFn, resetAllEmployess } from "@/Redux/Slice/Employe/AllEmloyers";
import { AppDispatch, RootState } from "@/Redux/Store";
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
 
import { useSelector } from "react-redux";

import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import toast from 'react-hot-toast';
import { Link } from "react-router-dom";
import { delEmployeeFn, resetDelEmployees } from "@/Redux/Slice/Employe/DeleteEmployesSlice";


const getColumns = (onDelete: (id: number, companyId?: string) => void): GridColDef[] => [
    { field: 'employee_id', headerName: 'Id', width: 100, flex: 0 },
    { field: 'employee_name', headerName: 'Name', width: 200, flex: 1, minWidth: 150 },
    { field: 'employee_address', headerName: 'Address', width: 200, flex: 1, minWidth: 150 },
    { field: 'employee_phone', headerName: 'Phone', width: 150, flex: 0 },
    { field: 'salary_amount', headerName: 'Salary', width: 150, flex: 0, 
      valueFormatter: (value: any) => value ? `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      flex: 0,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ActionCell {...params} onDelete={onDelete} />
        </div>
      ),
    },
  ];    
  
  


  export const ActionCell = (params: any & { onDelete?: (id: number, companyId?: string) => void }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const dispatch = useDispatch<AppDispatch>()

    const handleClick = (event: any) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleDelete = () => {
      const { onDelete } = params;
      if (onDelete) {
        onDelete(params.row.employee_id, params.row.company_id);
      } else {
        dispatch(delEmployeeFn(params.row.employee_id));
      }
      dispatch(resetDelEmployees());
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
          <Link to={`/Dashboard/Employees/update/${params.row.employee_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <MenuItem onClick={() => console.log('Update')}>Update</MenuItem>
          </Link>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
          <MenuItem onClick={() => console.log('More')}>More</MenuItem>
        </Menu>
      </div>
    );
  };



interface EmployersDataProps {
  selectedCompanyId?: string;
  onRefresh?: () => void;
}

function EmployersData({ selectedCompanyId, onRefresh }: EmployersDataProps) {
  const toastId = "deleteVendor";
  const AllEmployeesState= useSelector((state:RootState)=> state.AllEmployes)
  const dispatch= useDispatch<AppDispatch>()
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const roles = userInfo.user?.roles || userInfo.roles || [];
  const isSuperAdmin = roles.includes('superAdmin') || roles.includes('super_admin');
  const userCompanyId = userInfo.user?.company_id || userInfo.company_id;
  const companyId = isSuperAdmin ? selectedCompanyId : userCompanyId;

  useEffect(() => {
    if (companyId) {
      dispatch(getAllEmployersFn(companyId));
    }
  }, [dispatch, companyId]);




  

  useEffect(() => {
    if (AllEmployeesState.isError) {
      toast.error(AllEmployeesState.errorMsg, { id: 'employee-error' });
      dispatch(resetAllEmployess());
    }
  }, [AllEmployeesState.isError, dispatch]);
  

const DeleteEmplyState= useSelector((state:RootState)=>state.deleteEmployee)



 useEffect(() => {
  if (DeleteEmplyState.isLoading) toast.loading('Deleting!', { id: toastId });
  if (DeleteEmplyState.isSuccess) {
    toast.success('Employee deleted.', { id: toastId });
    onRefresh?.();
  }
  if (DeleteEmplyState.isError) {
    toast.error(DeleteEmplyState.errorMsg, { id: toastId });
  }
  dispatch(resetDelEmployees());
}, [DeleteEmplyState.isLoading, DeleteEmplyState.isError, DeleteEmplyState.isSuccess, dispatch, onRefresh]);

  const handleDelete = (id: number, companyId?: string) => {
    dispatch(delEmployeeFn({ id, companyId }));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, width: '100%', minWidth: 0, overflow: 'hidden' }}>
        <DataGrid
          rows={AllEmployeesState.data.map((employer) => ({ id: employer.employee_id, ...employer }))}
          columns={getColumns(handleDelete)}
          getRowId={(row) => row.id}
          loading={AllEmployeesState.isLoading}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
              
            },
          }}
          pageSizeOptions={[10, 20, 30]}
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
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-main': {
              width: '100%',
              minWidth: 0,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              padding: '16px',
              fontSize: '14px',
              color: 'rgb(55, 65, 81)',
              minWidth: 0,
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              transition: 'background-color 0.2s ease',
              width: '100%',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(249, 250, 251, 0.8)',
              borderBottom: '2px solid rgba(59, 130, 246, 0.1)',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgb(17, 24, 39)',
              width: '100%',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              width: '100%',
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: '16px',
            },
            '& .MuiButton-root': {
              color: 'rgb(59, 130, 246)',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            },
            '& .MuiDataGrid-virtualScroller': {
              width: '100%',
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              width: '100%',
            },
          }}
        />
      </Box>
    </Box>
  )
}

export default EmployersData