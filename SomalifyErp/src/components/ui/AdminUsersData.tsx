import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllCompanyUsersFn } from '@/Redux/Slice/AllCompanyUsersSlice';
import { delUserFn, resetDelUser } from '@/Redux/Slice/Deluser';
import IconButton from '@mui/material/IconButton';
import TableSearch, { useDebouncedValue } from '@/components/ui/TableSearch';

const getColumns = (isAdmin: boolean): GridColDef[] => [
  { field: 'user_id', headerName: 'ID', width: 90 },
  { field: 'full_name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 280 },
  {
    field: 'company',
    headerName: 'Organization',
    width: 160,
    valueGetter: (_value: any, row: any) => row?.companies?.company_name || row?.company?.company_name || row?.company_id || '-',
  },
  {
    field: 'roles',
    headerName: 'Roles',
    width: 180,
    renderCell: (params) => {
      const roles = params?.row?.user_roles?.map((ur: any) => ur.role?.name).filter(Boolean) || [];
      if (roles.length === 0) return <span className="text-gray-400 text-xs">No roles</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {roles.map((r: string) => (
            <span key={r} className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium">
              {r}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 90,
    sortable: false,
    renderCell: (params) => params ? <ActionCell {...params} isAdmin={isAdmin} /> : null,
  },
];

export const ActionCell = (params: any) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const basePath = isAdminDashboard ? '/AdminDashboard' : '/Dashboard';
  const open = Boolean(anchorEl);
  const isAdmin = params.isAdmin;

  const handleDelete = () => {
    dispatch(delUserFn(params.row.user_id));
    dispatch(resetDelUser());
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
          to={`${basePath}/User/Update/${params.row.user_id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <MenuItem>{isAdmin ? 'Update & Permissions' : 'Update'}</MenuItem>
        </Link>
        <MenuItem onClick={handleDelete} sx={{ color: 'red' }}>Delete</MenuItem>
      </Menu>
    </>
  );
};

export default function AdminUsersData() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/AdminDashboard');
  const basePath = isAdminDashboard ? '/AdminDashboard' : '/Dashboard';
  const UserDataState = useSelector((state: RootState) => state.allCompanyUsers);
  const DelUserDataState = useSelector((state: RootState) => state.DelUser);
  const [searchInput, setSearchInput] = React.useState('');
  const search = useDebouncedValue(searchInput);

  const columns = React.useMemo(() => getColumns(isAdminDashboard), [isAdminDashboard]);

  React.useEffect(() => {
    dispatch(getAllCompanyUsersFn(search));
  }, [dispatch, search]);

  React.useEffect(() => {
    if (UserDataState.isLoading) toast.loading('Loading...', { id: 'admin-users' });
    else toast.dismiss('admin-users');
    if (UserDataState.isError) toast.error(UserDataState.errorMsg, { id: 'admin-users' });
  }, [UserDataState.isLoading, UserDataState.isError, UserDataState.errorMsg]);

  React.useEffect(() => {
    if (DelUserDataState.isLoading) toast.loading('Deleting...', { id: 'delUser' });
    if (DelUserDataState.isSuccess) {
      toast.success('User deleted', { id: 'delUser' });
      dispatch(getAllCompanyUsersFn());
      navigate(`${basePath}/User`);
    }
    if (DelUserDataState.isError) toast.error(DelUserDataState.errorMsg, { id: 'delUser' });
    dispatch(resetDelUser());
  }, [DelUserDataState, dispatch, navigate, basePath]);

  return (
    <Box className="w-full">
      <TableSearch value={searchInput} onChange={setSearchInput} placeholder="Search users..." />
      <DataGrid
        rows={(UserDataState.data || []).map((u) => ({ id: u.user_id, ...u }))}
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
