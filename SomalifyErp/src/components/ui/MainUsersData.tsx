import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllMainUsersFn, deleteMainUserFn } from '@/Redux/Slice/MainUsersSlice';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'full_name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 280 },
  {
    field: 'roles',
    headerName: 'Roles',
    width: 200,
    renderCell: (params) => {
      const roles = params.row.user_roles?.map((ur: any) => ur.role.name) || [];
      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {roles.map((role: string) => (
            <Chip
              key={role}
              label={role}
              size="small"
              color={role === 'superAdmin' ? 'error' : role === 'admin' ? 'primary' : 'default'}
              variant="outlined"
            />
          ))}
        </Box>
      );
    },
  },
  {
    field: 'permissions_count',
    headerName: 'Permissions',
    width: 120,
    renderCell: (params) => {
      const permissions = new Set<string>();
      params.row.user_roles?.forEach((ur: any) => {
        ur.role.permissions?.forEach((rp: any) => {
          permissions.add(rp.permission.name);
        });
      });
      return permissions.size;
    },
  },
  {
    field: 'created_at',
    headerName: 'Created',
    width: 150,
    renderCell: (params) => {
      if (!params.value) return '-';
      return new Date(params.value).toLocaleDateString();
    },
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 90,
    sortable: false,
    renderCell: (params) => <ActionCell {...params} />,
  },
];

export const ActionCell = (params: any) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const open = Boolean(anchorEl);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this main user?')) {
      dispatch(deleteMainUserFn(params.row.id))
        .unwrap()
        .then(() => {
          // Refresh the list after successful deletion
          dispatch(getAllMainUsersFn());
        })
        .catch((error) => {
          console.error('Delete failed:', error);
        });
    }
    setAnchorEl(null);
  };

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: '#9ca3af',
          '&:hover': { color: '#374151' },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <Link
          to={`/AdminDashboard/MainUser/Update/${params.row.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <MenuItem>Edit & Manage Roles</MenuItem>
        </Link>
        <MenuItem onClick={handleDelete} sx={{ color: 'red' }}>
          Delete User
        </MenuItem>
      </Menu>
    </>
  );
};

export default function MainUsersData() {
  const dispatch = useDispatch<AppDispatch>();
  const MainUsersDataState = useSelector((state: RootState) => state.mainUsers);

  React.useEffect(() => {
    dispatch(getAllMainUsersFn());
  }, [dispatch]);

  React.useEffect(() => {
    if (MainUsersDataState.isLoading) toast.loading('Loading main users...', { id: 'main-users' });
    if (MainUsersDataState.isError) {
      toast.error(MainUsersDataState.errorMsg, { id: 'main-users' });
    }
    if (MainUsersDataState.isSuccess && !MainUsersDataState.isLoading) {
      toast.dismiss('main-users');
    }
  }, [MainUsersDataState.isLoading, MainUsersDataState.isError, MainUsersDataState.isSuccess]);

  React.useEffect(() => {
    if (MainUsersDataState.isSuccess && !MainUsersDataState.isLoading) {
      // Don't auto-refresh to prevent infinite loop
      // User can manually refresh if needed
    }
  }, [MainUsersDataState.isSuccess]);

  const handleRefresh = () => {
    dispatch(getAllMainUsersFn());
  };

  return (
    <Box className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Main Users Management</h2>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={MainUsersDataState.isLoading}
        >
          Refresh
        </Button>
      </div>
      <DataGrid
        rows={Array.isArray(MainUsersDataState.data) ? MainUsersDataState.data.map((u) => ({ 
          ...u,
          gridId: u.id, // Use gridId to avoid conflicts with id field
        })) : []}
        getRowId={(row) => row.gridId}
        columns={columns}
        pageSizeOptions={[10, 20, 30]}
        checkboxSelection
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        sx={{
          border: 'none',
          fontSize: '0.85rem',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f9fafb',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderBottom: '1px solid #e5e7eb',
          },
          '& .MuiDataGrid-row': {
            borderBottom: '1px solid #f1f5f9',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f9fafb',
          },
          '& .MuiDataGrid-cell': {
            py: 0.5,
            px: 1,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #e5e7eb',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'hidden',
          },
        }}
      />
    </Box>
  );
}
