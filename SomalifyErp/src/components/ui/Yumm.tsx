import { AiOutlineProduct } from "react-icons/ai";
import { FaSellsy } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { IoPeopleSharp } from "react-icons/io5";
import { MdCategory, MdOutlinePayment } from "react-icons/md";
import { TbLayoutDashboardFilled, TbReportAnalytics } from "react-icons/tb";
import { MdOutlineInventory2, MdOutlineLocalShipping } from "react-icons/md";

/** Permission required to see each link: "resource:action" (e.g. "sales:read") */
export type LinkPermission = string;

export interface NavLink {
  name: string;
  label?: string;
  title?: string;
  icon: React.ReactNode;
  permission?: LinkPermission;
}

export const links: { title?: string; links: NavLink[] }[] = [
  {
    title: "Dashboard",
    links: [
      { name: "Home", title: "Dashboard", icon: <TbLayoutDashboardFilled />, permission: "reports:read" },
      { name: "Sales/Lists", label: "Company Sales", icon: <FaSellsy />, permission: "sales:read" },
      { name: "Sales/CreateCustomer", label: "Create Customer", icon: <IoPeopleSharp />, permission: "customers:read" },
    ],
  },
  {
    links: [
      { name: "Products", icon: <AiOutlineProduct />, permission: "products:read" },
      { name: "Store", label: "Company Store", icon: <MdOutlineInventory2 />, permission: "products:read" },
      { name: "TransferredItems", label: "Transferred items", icon: <MdOutlineLocalShipping />, permission: "products:read" },
      { name: "Invoices", icon: <MdCategory />, permission: "invoices:read" },
      { name: "Receiveable", icon: <IoIosNotifications />, permission: "sales:read" },
      { name: "User", icon: <IoPeopleSharp />, permission: "users:read" },
      { name: "Treasury", icon: <MdOutlinePayment />, permission: "banking:read" },
      { name: "CompanyExpenses", label: "Company Expenses", icon: <MdOutlinePayment />, permission: "expenses:read" },
      { name: "Reports", icon: <TbReportAnalytics />, permission: "reports:read" },
    ],
  },
];
  