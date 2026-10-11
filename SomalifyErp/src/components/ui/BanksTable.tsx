import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch } from 'react-redux';
import { delBankFn, resetDelBank } from '@/Redux/Slice/DeleteBank';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getAllBanksFn, resetAllBanks } from '@/Redux/Slice/GetAllBanks';
import { Link } from 'react-router-dom';

const columns: GridColDef[] = [
  { field: 'bank_name', headerName: 'Bank Name', width: 200 },
  { field: 'amount', headerName: 'Amount', width: 200 },
  {
    field: 'created_at',
    headerName: 'Date',
    width: 200,
  
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 100,
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

  const handleClick = (event:any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    dispatch(delBankFn(params.row.bank_id));
    dispatch(resetDelBank());
    handleClose();
  };

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
        <Link to={`/Dashboard/Banks/Update/${params.row.bank_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={() => console.log('Update')}>Update</MenuItem>
        </Link>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </div>
  );
};

export default function BanksDataGrid() {
  const [paginationModel, setPaginationModel] = React.useState({
          page: 0,
          pageSize: 20,
        });
  const toastId = "bank del";
  const BanksState = useSelector((state: RootState) => state.AllBanks) || {
    data: [],
    total: 0,
    isLoading: false,
    isError: false,
    isSuccess: false,
    errorMsg: '',
    page: 1,
    pageSize: 20,
    hasMore: false
  };
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  React.useEffect(() => {
    dispatch(getAllBanksFn({page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize}));
  }, [dispatch,paginationModel]);

  const DelBankState = useSelector((state: RootState) => state.DelBank);
  console.log('BanksState:', BanksState);
  console.log('BanksState.data:', BanksState.data);

  React.useEffect(() => {
    if (DelBankState.isLoading) toast.loading('Deleting!', { id: toastId });
    if (DelBankState.isSuccess) {
      toast.success('Bank is deleted.', { id: toastId });
      resetAllBanks()
      navigate('/Dashboard/Banks');
    }
    if (DelBankState.isError) {
      toast.error(DelBankState.errorMsg, { id: toastId });
    }
    dispatch(resetDelBank());
  }, [DelBankState.isLoading, DelBankState.isError, DelBankState.isSuccess, dispatch, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ flex: 1, width: '98%' }}>
        <DataGrid
          rows={(BanksState.data || []).map((bank) => ({ id: bank.bank_id, ...bank }))}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[20, 30, 50]}
          rowCount={BanksState.total || 0}
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
