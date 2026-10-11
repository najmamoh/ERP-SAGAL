
import { Outlet, createBrowserRouter } from 'react-router-dom'
import Login from './Pages/Login'
import AdminLogin from './Pages/Admin/AdminLogin'
import Register from './Pages/Register'

import DhashRoute from './Pages/DhashRoute'
import AdminDhashRoute from './Pages/Admin/AdminDhashRoute'
import Notfound from './Pages/Notfound'
import Vendor from './Pages/Vendor'
import { SheetCreateV } from './Pages/CreateVendor'
import Products from './Pages/Products'
import { ProductCreate } from './Pages/ProductCreate'
import CreatePurchase from './Pages/CreatePurchase'
import { SAlesCreate } from './Pages/Sales'
import { CreateCustomer } from './Pages/CreateCustomer'
import Payables from './Pages/Payables'
import Payment from './Pages/Payment'
import TopSale from './Pages/TopSale'
import Reports from './Pages/Reports'
import AdminReports from './Pages/Admin/AdminReports'
import Recipt from './Pages/Recipt'
import UpdateVendors from './Pages/UpdateVendors'
import ProductUpdate from './Pages/ProductUpdate'
import RecieveAble from './Pages/ReceiveAble'
import ReceivePayment from './Pages/ReceivePayment'
import SaleReports from './Pages/SaleReports'
import ExpensesReport from './Pages/ExpenesesReport'
import UnpaidExpensesReport from './Pages/UnpaidExpensesReport'
import PurchaseReport from './Pages/PurchaseReport'
import ProfitOr from './Pages/ProfitOr'
import AllEmoloye from './Pages/Employee/AllEmoloye'
import UpdateEmployee from './Pages/Employee/UpdateEmployee'
import { Allsalary } from './Pages/Salary/AllSalreis'
import { AdminExpensesList } from './Pages/Expenses/AdminExpensesList'
import CompanyExpenses from './Pages/CompanyExpenses'
import CreateExpenses from './Pages/Expenses/CreateExpenses'
import UpdateExpenses from './Pages/Expenses/UpdateExpenses'
import SaleRecipt from './Pages/SaleRecipt'
import UserCompany from './Pages/UserCompany'
import Companies from './Pages/Companies'
import Stores from './Pages/Stores'
import CreateStore from './Pages/CreateStore'
import UpdateStore from './Pages/UpdateStore'
import RolesManagement from './Pages/RolesManagement'
import PermissionsManagement from './Pages/PermissionsManagement'
import UpdateUser from './Pages/UpdateUser'
import MainUsers from './Pages/MainUsers'
import UserManagement from './Pages/UserManagement'
import AllSalesList from './Pages/AllSalesList'
import CompanySalesList from './Pages/CompanySalesList'
import UpdateSale from './Pages/UpdateSale'
import AllPurchases from './Pages/AllPurchases'
import PurchaseDetails from './Pages/PurchaseDetails'
import UpdatePurchase from './Pages/UpdatePurchase'
import InvoiceP from './Pages/Invoice'
import InvoicePage from './Pages/InvoicePage'
import AllPurchasesAlert from './Pages/AlertItems'
import Settings from './Pages/Settings'
import Banking from './Pages/Banking'
import Warehouse from './Pages/Warehouse'
import CompanyStore from './Pages/CompanyStore'
import TransferredItems from './Pages/TransferredItems'
import Transfer_Money from './Pages/Transfer'
import { CreateBank } from './Pages/CreateBank'
import UpdateBank from './Pages/UpdateBank'
import { CreateTransfer } from './Pages/CreateTransfer'
import Treasury from './Pages/Treasury'
import CreateTreasury from './Pages/CreateTreasury'
import RequestWithdrawal from './Pages/RequestWithdrawal'
import AdminTreasury from './Pages/AdminTreasury'
import CompanySales from './Pages/CompanySales'






function Route() {
  return (
    <div>
     <div><Outlet/></div>

    </div>
  )
}

export default Route


export const router = createBrowserRouter([
    {
        path:'/',
        element:<Route/>,
        children:[
            {
                index:true,
                element:<Login/>
            },
            {
              path:'SignIn',
              element:<Login/>
            },
            {
              path:'AdminSignIn',
              element:<AdminLogin/>
            },
            {
              path:'*',
              element:<Notfound/>
            }
        ]
    },
    {
      path:'Dashboard',
      element:<DhashRoute/>,
      children:[
        {
          index:true,
          element:<Reports/>
        },
        {
          path:"Home",
          element:<Reports/>
        },
        {
          path:'*',
          element:<Notfound/>
        },
        {
          path:"Vendor",
          element:<Vendor/>
        },
        {
          path:"User",
          element:<UserManagement/>
        },
        {
          path:"UserCompany",
          element:<UserCompany/>
        },
        {
          path:"User/Create",
          element:<Register/>
        },
        {
          path:"User/Update/:user_id",
          element:<UpdateUser/>
        },
        {
          path:"Vendor/CreateVendor",
          element:<SheetCreateV/>
        },
        {
          path:"Transfer_Money",
          element:<Transfer_Money/>
        },
        {
          path:"Treasury",
          element:<Treasury/>
        },
        {
          path:"Treasury/CreateTreasury",
          element:<CreateTreasury/>
        },
        {
          path:"Treasury/RequestWithdrawal",
          element:<RequestWithdrawal/>
        },
        {
          path:"Treasury",
          element:<Treasury/>
        },
        {
          path:"Banks/CreateBank",
          element:<CreateBank/>
        },
        {
          path:"Banks/Update/:bank_id",
          element:<UpdateBank/>
        },
        {
          path:"Banks/CreateTransfer",
          element:<CreateTransfer/>
        },
        {
          path:"Products",
          element:<Products/>
        },
        {
          path:"Store",
          element:<CompanyStore/>
        },
        {
          path:"TransferredItems",
          element:<TransferredItems/>
        },
        {
          path:"Products/Expenses",
          element:<CompanyExpenses/>
        },
        {
          path:"Expenses",
          element:<CompanyExpenses/>
        },
        {
          path:"CompanyExpenses",
          element:<CompanyExpenses/>
        },
        {
          path:"Expenses/Create",
          element:<CreateExpenses/>
        },
        {
          path:"Products/Expenses/Create",
          element:<CreateExpenses/>
        },
        {
          path:"Products/Expenses/Update/:expense_id",
          element:<UpdateExpenses/>
        },
        {
          path:"Products/Create",
          element:<ProductCreate/>
        },
        {
          path:"Purchases",
          element:<AllPurchases/>
        },
        {
          path:"Purchases/Update/:purchase_id",
          element:<UpdatePurchase/>
        },
        {
          path:"Purchases/Details/:purchase_id",
          element:<PurchaseDetails/>
        },
        {
          path:"Purchases/Create",
          element:<CreatePurchase/>
        },
        {
          path:"Purchases/Alert",
          element:<AllPurchasesAlert/>
        },
        {
          path:"Sales/Update/:sale_id",
          element:<UpdateSale/>
        },
        {
          path:"Sales",
          element:<CompanySales/>
        },
        {
          path:"Sales/Create",
          element:<CompanySales/>
        },
        {
          path:"Sales/Lists",
          element:<CompanySalesList/>
        },
        {
          path:"Sales/Lists/Sales",
          element:<CompanySales/>
        },
        {
          path:"Sales/CreateCustomer",
          element:<CreateCustomer/>
        },
        {
          path:"Payables",
          element:<Payables/>
        },
        {
          path:"Payables/payment/:purchase_id",
          element:<Payment/>
        },
        {
          path:"TopSales",
          element:<TopSale/>
        },
        {
          path:"Reports",
          element:<Reports/>
        },
        {
          path:"Reports/SaleReport",
          element:<SaleReports/>
        },
        {
          path:"Home/SaleReport",
          element:<SaleReports/>
        },
        {
          path:"Reports/ExpensesReport",
          element:<ExpensesReport/>
        },
        {
          path:"Home/ExpensesReport",
          element:<ExpensesReport/>
        },
        {
          path:"Reports/UnpaidExpensesReport",
          element:<UnpaidExpensesReport/>
        },
        {
          path:"Home/UnpaidExpensesReport",
          element:<UnpaidExpensesReport/>
        },
        {
          path:"Reports/PurchasesReport",
          element:<PurchaseReport/>
        },
        {
          path:"Home/PurchasesReport",
          element:<PurchaseReport/>
        },
        {
          path:"Reports/Income",
          element:<ProfitOr/>
        },
        {
          path:"Home/Income",
          element:<ProfitOr/>
        },
        {
          path:"Receipt",
          element:<Recipt/>
        },
        {
          path:"SaleReceipt",
          element:<SaleRecipt/>
        },
        {
          path:"Vendor/Update/:vendor_id",
          element:<UpdateVendors/>
        },
        {
          path:"Products/Update/:product_id",
          element:<ProductUpdate/>
        },
        {
          path:"Receiveable",
          element:<RecieveAble/>
        },
        {
          path:"Receiveable/RecieveAblepayment/:sale_id",
          element:<ReceivePayment/>
        },
        {
          path:"Employees",
          element:<AllEmoloye/>
        },
        {
          path:"Employees/update/:employee_id",
          element:<UpdateEmployee/>
        },
        {
          path:"Employees/salaries",
          element:<Allsalary/>
        },
        {
          path:"invoices",
          element:<InvoiceP/>
        },
        {
         path:"invoices/:id",
         element:<InvoicePage/>
        },
        {
          path:"Settings",
          element:<Settings/>
        },
        {
          path:"Sales/Company",
          element:<CompanySales/>
        }

      ]
    },
    {
      path:'AdminDashboard',
      element:<AdminDhashRoute/>,
      children:[
        {
          index:true,
          element:<AdminReports/>
        },
        {
          path:"Home",
          element:<AdminReports/>
        },
        {
          path:"Vendor",
          element:<Vendor/>
        },
        // {
        //   path:"Customer",
        //   element:<AllCustomers/>
        // },
        {
          path:"User",
          element:<UserManagement/>
        },
        {
          path:"UserCompany",
          element:<UserCompany/>
        },
        {
          path:"User/Create",
          element:<Register/>
        },
        {
          path:"User/Update/:user_id",
          element:<UpdateUser/>
        },
        {
          path:"Vendor/CreateVendor",
          element:<SheetCreateV/>
        },
        {
          path:"Products",
          element:<Products/>
        },
        {
          path:"Products/Expenses",
          element:<AdminExpensesList/>
        },
        {
          path:"Expenses",
          element:<AdminExpensesList/>
        },
        {
          path:"CompanyExpenses",
          element:<AdminExpensesList/>
        },
        {
          path:"Expenses/Create",
          element:<CreateExpenses/>
        },
        {
          path:"Products/Expenses/Create",
          element:<CreateExpenses/>
        },
        {
          path:"Products/Expenses/Update/:expense_id",
          element:<UpdateExpenses/>
        },
        {
          path:"Products/Create",
          element:<ProductCreate/>
        },
        {
          path:"Purchases",
          element:<AllPurchases/>
        },
        {
          path:"Purchases/Update/:purchase_id",
          element:<UpdatePurchase/>
        },
        {
          path:"Purchases/Details/:purchase_id",
          element:<PurchaseDetails/>
        },
        {
          path:"Purchases/Create",
          element:<CreatePurchase/>
        },
        {
          path:"Purchases/Alert",
          element:<AllPurchasesAlert/>
        },
        {
          path:"Sales/Update/:sale_id",
          element:<UpdateSale/>
        },
        {
          path:"Sales",
          element:<AllSalesList/>
        },
        {
          path:"Sales/Create",
          element:<SAlesCreate/>
        },
        {
          path:"Sales/Lists",
          element:<AllSalesList/>
        },
        {
          path:"Sales/Lists/Sales",
          element:<SAlesCreate/>
        },
        {
          path:"Sales/CreateCustomer",
          element:<CreateCustomer/>
        },
        {
          path:"Payables",
          element:<Payables/>
        },
        {
          path:"Payables/payment/:purchase_id",
          element:<Payment/>
        },
        {
          path:"TopSales",
          element:<TopSale/>
        },
        {
          path:"Reports",
          element:<AdminReports/>
        },
        {
          path:"Reports/SaleReport",
          element:<SaleReports/>
        },
        {
          path:"Home/SaleReport",
          element:<SaleReports/>
        },
        {
          path:"Reports/ExpensesReport",
          element:<ExpensesReport/>
        },
        {
          path:"Home/ExpensesReport",
          element:<ExpensesReport/>
        },
        {
          path:"Reports/UnpaidExpensesReport",
          element:<UnpaidExpensesReport/>
        },
        {
          path:"Home/UnpaidExpensesReport",
          element:<UnpaidExpensesReport/>
        },
        {
          path:"Reports/PurchasesReport",
          element:<PurchaseReport/>
        },
        {
          path:"Home/PurchasesReport",
          element:<PurchaseReport/>
        },
        {
          path:"Reports/Income",
          element:<ProfitOr/>
        },
        {
          path:"Home/Income",
          element:<ProfitOr/>
        },
        {
          path:"Receipt",
          element:<Recipt/>
        },
        {
          path:"SaleReceipt",
          element:<SaleRecipt/>
        },
        {
          path:"Vendor/Update/:vendor_id",
          element:<UpdateVendors/>
        },
        {
          path:"Products/Update/:product_id",
          element:<ProductUpdate/>
        },
        {
          path:"Receiveable",
          element:<RecieveAble/>
        },
        {
          path:"Receiveable/RecieveAblepayment/:sale_id",
          element:<ReceivePayment/>
        },
        {
          path:"Employees",
          element:<AllEmoloye/>
        },
        {
          path:"Employees/update/:employee_id",
          element:<UpdateEmployee/>
        },
        {
          path:"Employees/salaries",
          element:<Allsalary/>
        },
        {
          path:"invoices",
          element:<InvoiceP/>
        },
        {
         path:"invoices/:id",
         element:<InvoicePage/>
        },
        {
          path:"Companies",
          element:<Companies/>
        },
        {
          path:"Stores",
          element:<Stores/>
        },
        {
          path:"Stores/Create",
          element:<CreateStore/>
        },
        {
          path:"Stores/Update/:store_id",
          element:<UpdateStore/>
        },
        {
          path:"Roles",
          element:<RolesManagement/>
        },
        {
          path:"Permissions",
          element:<PermissionsManagement/>
        },
        {
          path:"MainUsers",
          element:<MainUsers/>
        },
        {
          path:"MainUser/Create",
          element:<Register/>
        },
        {
          path:"MainUser/Update/:user_id",
          element:<UpdateUser/>
        },
        {
          path:"Warehouse",
          element:<Warehouse/>
        },
        {
          path:"Settings",
          element:<Settings/>
        },
        {
          path:"Banking",
          element:<Banking/>
        },
        {
          path:"Treasury",
          element:<AdminTreasury/>
        },
        {
          path:"Treasury/CreateTreasury",
          element:<CreateTreasury/>
        },
        {
          path:'*',
          element:<Notfound/>
        }
      ]
    }
])
