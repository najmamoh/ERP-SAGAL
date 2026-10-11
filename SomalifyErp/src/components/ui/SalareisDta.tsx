import { getAllSalariesFn, resetAllSalaries } from "@/Redux/Slice/Salareis/AllSalarySlice";
import { AppDispatch, RootState } from "@/Redux/Store";
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import toast from 'react-hot-toast';
import { format } from 'date-fns';


const getColumns = (onEdit: (salaryId: number) => void, onDelete: (id: number, employeeName: string) => void): GridColDef[] => [
    { field: 'salary_id', headerName: 'Id', width: 100, flex: 0 },
    { field: 'employee_name', headerName: 'Employee Name', width: 200, flex: 1, minWidth: 150 },
    { field: 'paid_amount', headerName: 'Paid Amount', width: 150, flex: 0,
      valueFormatter: (value: any) => value ? `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'
    },
    { field: 'date', headerName: 'Date', width: 150, flex: 0,
        valueFormatter: (value: any) => value ? format(new Date(value), 'MMM dd, yyyy') : ''
      },
    { field: 'employee_phone', headerName: 'Phone', width: 150, flex: 0 },
    { field: 'employee_address', headerName: 'Address', width: 200, flex: 1, minWidth: 150 },
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
                <ActionCell row={params.row} onEdit={onEdit} onDelete={onDelete} />
            </div>
        ),
    },
];

interface ActionCellProps {
    row: { salary_id: number; employee_name: string };
    onEdit: (salaryId: number) => void;
    onDelete: (id: number, employeeName: string) => void;
}

export const ActionCell = ({ row, onEdit, onDelete }: ActionCellProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleUpdate = () => {
        onEdit(row.salary_id);
        handleClose();
    };

    const handleDelete = () => {
        onDelete(row.salary_id, row.employee_name || '');
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
                MenuListProps={{ 'aria-labelledby': 'long-button' }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ style: { maxHeight: 48 * 4.5, width: '20ch' } }}
            >
                <MenuItem onClick={handleUpdate}>Update</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
        </div>
    );
};

interface SalariesDataProps {
    onEdit: (salaryId: number) => void;
    onDelete: (id: number, employeeName: string) => void;
}

function SalariesData({ onEdit, onDelete }: SalariesDataProps) {
    const AllSalariesState = useSelector((state: RootState) => state.AllSalaries);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(getAllSalariesFn());
    }, [dispatch]);

    useEffect(() => {
        if (AllSalariesState.isError) {
            toast.error(AllSalariesState.errorMsg, { id: 'salary-error' });
            dispatch(resetAllSalaries());
        }
    }, [AllSalariesState.isError, dispatch]);

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
                    rows={AllSalariesState.data.map((salary) => ({
                        id: salary.salary_id,
                        salary_id: salary.salary_id,
                        paid_amount: salary.paid_amount,
                        date: salary.date,
                        employee_name: salary.employees.employee_name,
                        employee_address: salary.employees.employee_address,
                        employee_phone: salary.employees.employee_phone,
                        salary_amount: salary.employees.salary_amount,
                    }))}
                    columns={getColumns(onEdit, onDelete)}
                    getRowId={(row) => row.id}
                    loading={AllSalariesState.isLoading}
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
                                backgroundColor: 'rgba(20, 184, 166, 0.05)',
                            },
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'rgba(249, 250, 251, 0.8)',
                            borderBottom: '2px solid rgba(20, 184, 166, 0.1)',
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
                            color: 'rgb(20, 184, 166)',
                            '&:hover': {
                                backgroundColor: 'rgba(20, 184, 166, 0.1)',
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
    );
}

export default SalariesData;
