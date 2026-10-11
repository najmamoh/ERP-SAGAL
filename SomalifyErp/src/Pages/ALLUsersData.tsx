import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/Redux/Store';
import { GetAllUserCompnyFN, resetAllUsersCompnay } from '@/Redux/Slice/AllComUsersSlice';
import { delUserFn, resetDelUser } from '@/Redux/Slice/Deluser';
import IconButton from "@mui/material/IconButton";

const columns: GridColDef[] = [
  { field: 'user_id', headerName: 'ID', width: 90 },
  { field: 'full_name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 280 },
  { field: 'role', headerName: 'Role', width: 160 },
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
    color: "#9ca3af",
    "&:hover": { color: "#374151" },
  }}
>
  <MoreVertIcon />
</IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <Link to={`/Dashboard/User/Update/${params.row.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem>Update</MenuItem>
        </Link>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </>
  );
};

export default function DataUsersCom() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const UserDataState = useSelector((state: RootState) => state.ALLUsers);
  const DelUserDataState = useSelector((state: RootState) => state.DelUser);

  React.useEffect(() => {
    dispatch(GetAllUserCompnyFN());
  }, [dispatch]);

  React.useEffect(() => {
    if (UserDataState.isLoading) toast.loading('Loading...', { id: 'users' });
    else toast.dismiss('users');
    if (UserDataState.isError) {
      toast.error(UserDataState.errorMsg, { id: 'users' });
      dispatch(resetAllUsersCompnay());
    }
  }, [UserDataState.isLoading, UserDataState.isError, UserDataState.errorMsg, dispatch]);

  // Handle error for company users
  React.useEffect(() => {
    if (DelUserDataState.isLoading) toast.loading('Deleting...', { id: 'delUser' });
    if (DelUserDataState.isSuccess) {
      toast.success('User deleted', { id: 'delUser' });
      navigate('/Dashboard/User');
    }
    if (DelUserDataState.isError) toast.error(DelUserDataState.errorMsg, { id: 'delUser' });
    dispatch(resetDelUser());
  }, [DelUserDataState, dispatch, navigate]);

  return (
    <Box className="w-full">
      <DataGrid
        rows={UserDataState.data.map((u) => ({ id: u.user_id, ...u }))}
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
