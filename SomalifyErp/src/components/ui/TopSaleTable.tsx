
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';


const columns: GridColDef<(typeof rows)[number]>[] = [
  { field: 'name', headerName: 'Name', width: 200, minWidth: 150 },
  { field: 'Quantity', headerName: 'Quantity', width: 100, minWidth: 80 },
  { field: 'Price', headerName: 'Price', width: 100, minWidth: 80 },
  { field: 'Discount', headerName: 'Discount', width: 100, minWidth: 80 },
  { field: 'Cost', headerName: 'Item Cost', width: 100, minWidth: 80 },
  {
    field: 'Total_Recieved',
    headerName: 'Total Recieved',
    width: 150,
    minWidth: 120,
    renderCell: (params) => (
      <div
        className={`genderrow ${params.value.toLowerCase()}`}
        style={{
          padding: '0px',
          textAlign: 'center',
          color: 'green',
        }}
      >
        {params.value}
      </div>
    ),
  },
];

const rows = [
  { id: 1, name: 'John Deo', Quantity: '12', Price: '44', Discount: '04', Cost: '100/peices', Total_Recieved: '$234' },
  { id: 2, name: 'Shelby Goode', Quantity: '12', Price: '44', Discount: '0', Cost: '400/pieces', Total_Recieved: '$24234' },
  { id: 3, name: 'Robert Bacins', Quantity: '12', Price: '777', Discount: '0', Cost: '40/pieces', Total_Recieved: '$2034' },
  { id: 4, name: 'John Carilo', Quantity: '12', Price: '99', Discount: '44', Cost: '4000/pieces', Total_Recieved: '$934' },
  { id: 5, name: 'Adriene Watson', Quantity: '12', Price: '323', Discount: '0', Cost: '4/pieces', Total_Recieved: '$00234' },
  { id: 6, name: 'Jhon Deo', Quantity: '12', Price: '89', Discount: '0', Cost: '900/pieces', Total_Recieved: '$234234' },
  { id: 7, name: 'Mark Ruffalo', Quantity: '12', Price: '567', Discount: '44', Cost: '453/pieces', Total_Recieved: '$567' },
  { id: 8, name: 'Jhon ali', Quantity: '12', Price: '555', Discount: '44', Cost: '234/pieces', Total_Recieved: '$90' },
  { id: 9, name: 'Mark Rumarkoffalo', Quantity: '12', Price: '1234', Discount: '0', Cost: '1/pieces', Total_Recieved: '$453' },
];

export default function TopSaledata() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        padding: '0 16px',
      }}
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          sx={{
            overflow: 'auto',
            width: '100%',
            maxWidth: '100vw',
            boxSizing: 'border-box',
            '& .MuiDataGrid-cell': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        />
      </Box>
    </Box>
  );
}