// import * as React from 'react';

// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';




// export const ActionCell = (params:any) => {
//     const [anchorEl, setAnchorEl] = React.useState(null);
//     const open = Boolean(anchorEl);
  
//     const handleClick = (event) => {
//       setAnchorEl(event.currentTarget);
//     };
  
//     const handleClose = () => {
//       setAnchorEl(null);
//     };
  
//     return (
//       <div>
//         <MoreVertIcon
//           aria-label="more"
//           aria-controls={open ? 'long-menu' : undefined}
//           aria-expanded={open ? 'true' : undefined}
//           aria-haspopup="true"
//           onClick={handleClick}
//         />
//         <Menu
//           id="long-menu"
//           MenuListProps={{
//             'aria-labelledby': 'long-button',
//           }}
//           anchorEl={anchorEl}
//           open={open}
//           onClose={handleClose}
//           PaperProps={{
//             style: {
//               maxHeight: 48 * 4.5,
//               width: '20ch',
//             },
//           }}
//         >
//           <MenuItem onClick={() => console.log('Edit')}>Edit</MenuItem>
//           <MenuItem onClick={() => console.log('Delete')}>Delete</MenuItem>
//           <MenuItem onClick={() => console.log('More')}>More</MenuItem>
//         </Menu>
//       </div>
//     );
//   };