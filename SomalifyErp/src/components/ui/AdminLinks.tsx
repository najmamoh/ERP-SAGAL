import { AiOutlineProduct } from "react-icons/ai";
import { FaSellsy } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { IoPeopleSharp } from "react-icons/io5";
import { MdAnalytics, MdCategory, MdOutlinePayment } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import { TbLayoutDashboardFilled, TbReportAnalytics } from "react-icons/tb";
import { FiSettings } from 'react-icons/fi';
import { HiOutlineBanknotes, HiOutlineCube, HiOutlineShieldCheck, HiOutlineKey, HiOutlineShoppingBag, HiOutlineBuildingOffice } from 'react-icons/hi2';

export const adminLinks = [
    {
      title: 'Dashboard',
      links: [
        {
          name: 'Home',
          title:"Admin Dashboard",
          icon: <TbLayoutDashboardFilled />,
        },
      ],
    },
  
    {
      title: 'Management',
      links: [
        {
          name: 'Vendor',
          icon: <MdAnalytics />
        },
        {
          name: 'Products',
          icon: <AiOutlineProduct/>
        },
        {
          name:'Sales',
          icon: <FaSellsy />
        },
        // {
        //   name:'Company Sales',
        //   icon: <HiOutlineShoppingBag />
        // },
        {
          name:'Invoices',
          icon : <MdCategory/>
        },
        {
          name: 'Purchases',
          icon: <MdOutlinePayment />,
        },
        {
          name: 'Receiveable',
          icon: <IoIosNotifications /> ,
        },
        {
          name: 'Payables',
          icon: <RiSecurePaymentLine />  ,
        },
        {
          name:'User',
          icon:<IoPeopleSharp />
        },
        {
          name:"Employees",
          icon:<IoPeopleSharp />
        },
        {
          name:"Expenses",
          icon:<MdOutlinePayment />,
        },
        {
          name:"MainUsers",
          label:"Main Users",
          icon:<HiOutlineShieldCheck />,
        },
      ],
    },
    {
      title: 'Admin Tools',
      links: [
        {
          name:"Companies",
          icon: <HiOutlineBuildingOffice />,
        },
        {
          name:"Stores",
          icon: <HiOutlineShoppingBag />,
        },
        {
          name:"Roles",
          icon: <HiOutlineShieldCheck />,
        },
        {
          name:"Permissions",
          icon: <HiOutlineKey />,
        },
        {
          name:"Warehouse",
          icon: <HiOutlineCube />,
        },
        {
          name:"Reports",
          icon: <TbReportAnalytics />,
        },
        {
          name:"Banking",
          icon: <HiOutlineBanknotes />,
        },
        {
          name:"Treasury",
          icon: <HiOutlineBanknotes />,
        },
        {
          name:"Settings",
          icon: <FiSettings />,
        },
      ],
    },
  ];