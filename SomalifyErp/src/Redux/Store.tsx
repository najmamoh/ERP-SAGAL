import {configureStore} from '@reduxjs/toolkit'
import registerSlice from './Slice/RegisterSlice';
// import userInfoSlice from './Slice/userinfo';
import { LoginSlice } from './Slice/LoginSlice';
import { GetAllVendorSlice } from './Slice/GetAllVendor';
import { GetAllProductSlice } from './Slice/getAllProductsSlice';
import { createVendorSlice } from './Slice/CreateVendorSlice';
import { createProductSlice } from './Slice/CreateProductSlice';
import { CreatePurchaseSlice } from './Slice/CreatePurchhaseSlice';
import  { createSaleSlice } from './Slice/CreateSaleSlice';
import { createCustomerSlice } from './Slice/CreateCustomerSlice';
import { GetAllCustomerSlice } from './Slice/AllCustomers';
import { GetAllPurchaseSlice } from './Slice/AllPurchases';
import { UpdateVendorSlice } from './Slice/updateVEnderSlice';
import { GetAllIncomeSlice } from './Slice/Incomestatement';
import { delVendorSlice } from './Slice/DeleteVendor';
import { delProductSlice } from './Slice/DeleteProductSlice';
import { GetOneVendorSlice } from './Slice/GetOneVendor';
import { GetOneProductSlice } from './Slice/GEtOneProduct';
import { UpdateProductSlice } from './Slice/ProductUpdateSlice';
import { GetAllPayableSlice } from './Slice/GetAllPayableSlice';
import { GetAllRecieveAbleSlice } from '@/Redux/Slice/ReceiveAbleSlice';
import { PayPAyableSlice } from './Slice/PayPayable';
import { PayReceiveAbleSlice } from './Slice/PayReceive';
import { GetAllSaleSlice } from './Slice/GetAllSaleSlice';

import { GetAllPurchasesSlice } from './Slice/GetPurchasesReport';
import { GetAllIncomeReportSlice } from './Slice/Los/Porift';
import { GetOnePurchaseSlice } from './Slice/GetOnePurchaseSlice';
import { GetAllEmployeesSlice,  } from './Slice/Employe/AllEmloyers';
import { createEmployeesSlice } from './Slice/Employe/CreateEmployesSlice';
import { delEmployeesSlice } from './Slice/Employe/DeleteEmployesSlice';
import { UpdateEmployeeSlice } from './Slice/Employe/UpdateEmployeeSlice';
import { GetOneEmployeesSlice } from './Slice/Employe/OneEmplaymentSlice';
import { createSalarySlice } from './Slice/Salareis/CreateSalarySlice';
import { UpdateSalarySlice } from './Slice/Salareis/UpdateSalarySlice';

import { delSalarySlice } from './Slice/Salareis/DeleteSalaryslice';
import { GetOneSalarySlice } from './Slice/Salareis/getoneSlary';
import { GetAllExpensesOnlySlice } from './Slice/expenses/AllExpensesSlice';
import CompanyExpensesSlice from './Slice/expenses/CompanyExpensesSlice';
import { createExpensesSlice } from './Slice/expenses/CreateExpensesSlice';
import { delExpensesSlice } from './Slice/expenses/DeleteExpensesSlice';
import { UpdateExpensesSlice } from './Slice/expenses/UpdateExpensesSLice';
import { GetOneExpenseSlice } from './Slice/expenses/GetOneExpenses';
import { GetOneCompanySlice } from './Slice/GetOneCompanaySlice';
import { GetAllCompaniesSlice } from './Slice/GetAllCompaniesSlice';
import { CreateCompanySlice } from './Slice/CreateCompanySlice';
import { UpdateCompanySlice } from './Slice/UpdateCompanySlice';
import { DeleteCompanySlice } from './Slice/DeleteCompanySlice';
import { GetAllSalariesSlice } from './Slice/Salareis/AllSalarySlice';
import { GetAllUserCompnaySLice } from './Slice/AllComUsersSlice';
import { GetOneUserComSlice } from './Slice/OneUserComSlice';
import { UpdateUserSlice } from './Slice/UpdateuserSlice';
import { GetOneCustomerSlice } from './Slice/GetOneCustomerSlice';
import { GetAllSalesSlice } from './Slice/AllSalesSlice';
import { delSaleSlice } from './Slice/DeleteSale';
import { GetOneSaleSlice } from './Slice/GetOneSale';
import UpdateSaleSlice from './UpdateSaleSlice';
import { GetAllPurchaseSortSlice } from './Slice/AllPurchaseSortSlice';
import { delPurchaseSlice } from './Slice/DeletePurchase';
import { UpdatePurchaseSlice } from './Slice/updatePurchase';
import { AllIncomeReportSlice } from './Slice/ReportIncomeSlice';
import { SearchAllPurchaseSortSlice } from './SearhPurchaseSlice';
import { GetAllInvoiceSlice } from './Slice/InvoicesSlice';
import { GetOneInvoiceSlice } from './Slice/getOneInvoice';
import { GetAllPurchaseSAlertlice } from './Slice/productAlertSlice';
import { expensesSliceReport } from './Slice/ExpensesSlice';
import { UnpaidExpensesReportSlice } from './Slice/UnpaidExpensesReportSlice';
import { userInfoSlice } from './Slice/userinfo';
import { delUserSlice } from './Slice/Deluser';
import whoamiSlice from './Slice/whoami';
import adminWhoamiSlice from './Slice/adminWhoami';
import dashboardSlice from './Slice/dashslice';
import BankingSlice from './Slice/BankingSlice';
import { MainUsersSlice } from './Slice/MainUsersSlice';

import { GetAllBanksSlice } from './Slice/GetAllBanks';
import { createBankSlice } from './Slice/CreateBankSlice';
import { UpdateBankSlice } from './Slice/UpdateBankSlice';
import { delBankSlice } from './Slice/DeleteBank';
import { GetOneBankSlice } from './Slice/GetOneBank';
import { createTransferSlice } from './Slice/CreateTransferSlice';
import GetAllTransactionsReducer from './Slice/GetAllTransactions';
import TreasuryReducer from "./Slice/TreasurySlice";
import rolesReducer from "./Slice/RolesSlice";
import permissionsReducer from "./Slice/PermissionsSlice";
import userRoleAssignmentReducer from "./Slice/UserRoleAssignmentSlice";
import rolesManagementReducer from "./Slice/RolesManagementSlice";
import permissionsManagementReducer from "./Slice/PermissionsManagementSlice";
import companyUsersReducer from "./Slice/CompanyUsersSlice";
import allCompanyUsersReducer from "./Slice/AllCompanyUsersSlice";
import { WarehouseSlice } from './Slice/WarehouseSlice';
import { GetAllStoresSlice } from './Slice/GetAllStoresSlice';
import { CreateStoreSlice } from './Slice/CreateStoreSlice';
import { GetOneStoreSlice } from './Slice/GetOneStoreSlice';
import { UpdateStoreSlice } from './Slice/UpdateStoreSlice';
import { LinkedStoresSlice } from './Slice/LinkedStoresSlice';
import CompanyInventorySlice from './Slice/CompanyInventorySlice';

export const store =configureStore({
reducer:{
    user:registerSlice.reducer,
    GetOneuser:GetOneUserComSlice.reducer,
    UpdateUser:UpdateUserSlice.reducer,
    ALLUsers:GetAllUserCompnaySLice.reducer,
    userInfo:userInfoSlice.reducer,
    LoginStore: LoginSlice.reducer,
    AllVendors:GetAllVendorSlice.reducer,
    AllProduct:GetAllProductSlice.reducer,
    CreateVendor:createVendorSlice.reducer,
    CreateProduct:createProductSlice.reducer,
    createPurchase:CreatePurchaseSlice.reducer,
    createSales:createSaleSlice.reducer,
    AllPurchases:GetAllPurchaseSlice.reducer,
    CreateCustomer:createCustomerSlice.reducer,
    AllCustomer:GetAllCustomerSlice.reducer,
    UpdateVendor:UpdateVendorSlice.reducer,
    AllIncome:GetAllIncomeSlice.reducer,
    DelVendor:delVendorSlice.reducer,
    DelProducs:delProductSlice.reducer,
    GetOneVendor:GetOneVendorSlice.reducer,
    GetONeProduct:GetOneProductSlice.reducer,
    UpdateProduct:UpdateProductSlice.reducer,
    AllPayable:GetAllPayableSlice.reducer,
    AllReceive:GetAllRecieveAbleSlice.reducer,
    PAymentPayable: PayPAyableSlice.reducer,
    ReceiveAple:PayReceiveAbleSlice.reducer,
    GetSale:GetAllSaleSlice.reducer,
    GetExpenses:expensesSliceReport.reducer,
    UnpaidExpensesReport: UnpaidExpensesReportSlice.reducer,
    GetPurchaseReport:GetAllPurchasesSlice.reducer,
    GetIncome:GetAllIncomeReportSlice.reducer,
    GetOnePurhhase:GetOnePurchaseSlice.reducer,
    getOneCustomer:GetOneCustomerSlice.reducer,
    GetSortPurchase:GetAllPurchaseSortSlice.reducer,
    DeletePurchase:delPurchaseSlice.reducer,
    UpdatePurchase:UpdatePurchaseSlice.reducer,
    searchPuSearchAllpurchases:SearchAllPurchaseSortSlice.reducer,
    AlertItem:GetAllPurchaseSAlertlice.reducer,
    DelUser:delUserSlice.reducer,
    


    AllEmployes:GetAllEmployeesSlice.reducer,
    CreateEmployee:createEmployeesSlice.reducer,
    deleteEmployee:delEmployeesSlice.reducer,
    UpdateEmployees:UpdateEmployeeSlice.reducer,
    OneEmployee:GetOneEmployeesSlice.reducer,


    //salary
    CreateSalary:createSalarySlice.reducer,
    updateSalary:UpdateSalarySlice.reducer,
    AllSalaries:GetAllSalariesSlice.reducer,
    DeleteSalary:delSalarySlice.reducer,
    getOnesalary:GetOneSalarySlice.reducer,

    // expenses
    GetAllExpensesOnly:GetAllExpensesOnlySlice.reducer,
    CompanyExpenses: CompanyExpensesSlice,
    CreateExpenses:createExpensesSlice.reducer,
    DelExpenses:delExpensesSlice.reducer,
    UpdateExpenses:UpdateExpensesSlice.reducer,
    OneExpense:GetOneExpenseSlice.reducer,
   
    //Companay
    GetOneCompanay:GetOneCompanySlice.reducer,
    AllCompanies:GetAllCompaniesSlice.reducer,
    CreateCompany:CreateCompanySlice.reducer,
    UpdateCompany:UpdateCompanySlice.reducer,
    DeleteCompany:DeleteCompanySlice.reducer,


    ///Sale
    GetAllSale:GetAllSalesSlice.reducer,
    DeleteSale:delSaleSlice.reducer,
    getOneSale:GetOneSaleSlice.reducer,
    UpdateSale:UpdateSaleSlice,



    //Income Report
    getAllIncomeReport:AllIncomeReportSlice.reducer,


    // Invoice
    AllInvoice:GetAllInvoiceSlice.reducer,
    getOneInvoice:GetOneInvoiceSlice.reducer,


    whoami:whoamiSlice.reducer,
    adminWhoami:adminWhoamiSlice.reducer,
    dashData:dashboardSlice.reducer,
    banking:BankingSlice,
    mainUsers:MainUsersSlice.reducer,
    warehouse:WarehouseSlice.reducer,
    AllStores: GetAllStoresSlice.reducer,
    CreateStore: CreateStoreSlice.reducer,
    OneStore: GetOneStoreSlice.reducer,
    UpdateStore: UpdateStoreSlice.reducer,
    linkedStores: LinkedStoresSlice.reducer,
    companyInventory: CompanyInventorySlice,
    // dashData:dashboardSlice.reducer,

    // Banks
    AllBanks:GetAllBanksSlice.reducer,
    CreateBank:createBankSlice.reducer,
    UpdateBank:UpdateBankSlice.reducer,
    DelBank:delBankSlice.reducer,
    GetOneBank:GetOneBankSlice.reducer,

    // Transactions
    CreateTransfer:createTransferSlice.reducer,
    AllTransactions: GetAllTransactionsReducer, 
    treasury: TreasuryReducer,

    roles: rolesReducer,
    permissions: permissionsReducer,
    userRoleAssignment: userRoleAssignmentReducer,
    rolesManagement: rolesManagementReducer,
    permissionsManagement: permissionsManagementReducer,
    companyUsers: companyUsersReducer,
    allCompanyUsers: allCompanyUsersReducer,


},
devTools:true
})
export type RootState = ReturnType<typeof store.getState>; //use Selector
export type AppDispatch =typeof store.dispatch;//useDispatch