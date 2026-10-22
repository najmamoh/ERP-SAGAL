const fs = require('fs');

const files = [
  'src/Pages/CreatePurchase.tsx',
  'src/Pages/CreateBank.tsx',
  'src/Pages/UpdateBank.tsx',
  'src/Pages/CreateVendor.tsx',
  'src/Pages/ProductUpdate.tsx',
  'src/Pages/UpdateVendors.tsx',
  'src/Pages/Employee/UpdateEmployee.tsx',
  'src/Pages/UpdateSale.tsx',
  'src/Pages/Employee/createEmployee.tsx',
  'src/Pages/Expenses/UpdateExpenses.tsx',
  'src/Pages/Salary/UpdateSalary.tsx',
  'src/Pages/CreateTransfer.tsx',
  'src/Pages/Payment.tsx',
  'src/Pages/ReceivePayment.tsx',
  'src/Pages/UpdatePurchase.tsx',
  'src/components/ui/ProductForm.tsx',
  'src/components/ui/VendorForm.tsx',
  'src/components/ui/EmployeeForm.tsx',
  'src/components/ui/UserForm.tsx',
  'src/components/ui/SalaryForm.tsx',
  'src/components/ui/CompanyForm.tsx',
  'src/components/ui/SalesForm.tsx',
  'src/components/CreateCustomerModal.tsx',
];

const reps = [
  ['border border-gray-400 rounded-[10px] p-2 min-h-[80px]', 'soft-field min-h-[80px]'],
  ['border border-gray-400 rounded-[10px] p-2 bg-gray-200 cursor-not-allowed', 'soft-field cursor-not-allowed'],
  ['border border-gray-400 rounded-[10px] p-2', 'soft-field'],
  ['bg-[#F7F7F8] p-2 rounded-[8px] text-gray-400 my-2', 'soft-field'],
  ['bg-[#F7F7F8] p-2 rounded-[8px] my-2', 'soft-field'],
  ['border rounded-lg p-2 w-full', 'soft-field'],
  ['border-2 rounded-xl p-2 mb-4', 'soft-field mb-4'],
  ['border-2 rounded-xl p-2', 'soft-field'],
  ['bg-white text-black dark:text-black my-2 p-4 sm:p-8 rounded-[8px] w-full max-w-4xl mx-auto', 'soft-card max-w-4xl mx-auto'],
  ['bg-white  text-black dark:text-black my-2 p-4 sm:p-8 rounded-[8px] w-full max-w-4xl mx-auto', 'soft-card max-w-4xl mx-auto'],
  ['bg-white text-black dark:text-black my-2 p-4 rounded-[8px] w-full flex flex-col', 'soft-card'],
  ['bg-white dark:text-black my-2 p-4 rounded-[8px] w-full flex flex-col', 'soft-card'],
  ['bg-white text-black my-2 p-4 rounded-[8px] w-full flex flex-col', 'soft-card'],
  ['bg-white p-4 rounded-lg shadow-sm', 'soft-card'],
  ['bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center min-w-[180px] w-[14%] text-white p-2', 'soft-submit'],
  ['bg-[#605BFF] min-w-[160px] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] my-8 text-white p-2   ', 'soft-submit my-6'],
  ['bg-[#605BFF] min-w-[160px] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] my-8 text-white p-2', 'soft-submit my-6'],
  ['bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] text-white p-2', 'soft-submit'],
  ['bg-[#605BFF] rounded-[8px] shadow-md flex justify-center w-full sm:w-auto text-white px-4 py-2', 'soft-submit'],
  ['p-2 px-4 my-4 max-w-[480px] m-auto bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center items-center text-white', 'soft-submit my-2'],
  ['bg-[#605BFF] text-white px-6 py-2 rounded-lg', 'soft-submit'],
  ['grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-2', 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5'],
  ['grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2', 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'],
  ['grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'],
  ['grid grid-cols-1 md:grid-cols-4 gap-3', 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5'],
  ['grid grid-cols-4 gap-2', 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5'],
  ['className="font-semibold text-lg dark:text-white"', 'className="soft-title"'],
  ['className="font-semibold text-lg"', 'className="soft-title"'],
  ['className="font-semibold dark:text-black text-lg"', 'className="soft-title"'],
  ['className="font-semibold text-lg sm:text-xl mb-4"', 'className="soft-title mb-4"'],
  ['className="formdiv py-20 flex flex-col gap-4"', 'className="formdiv flex flex-col gap-5"'],
  ['className="py-20 p-4 sm:p-6"', 'className="p-4 sm:p-6 max-w-6xl"'],
  ['className="py-10 sm:py-20 p-4 sm:p-6"', 'className="p-4 sm:p-6 max-w-6xl"'],
  ['className="bg-[#008CC8] px-2 gap-2 flex items-center text-white rounded-xl"', 'className="px-3 py-2 gap-2 flex items-center text-sm font-medium text-sky-700 bg-sky-50 border border-sky-100 rounded-xl"'],
  ['className="p-2 flex gap-2 items-center"', 'className="px-3 py-2 flex gap-2 items-center text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl"'],
  ['className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"', 'className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 disabled:opacity-40"'],
  ['flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500', 'soft-field flex-1'],
  ['w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none', 'soft-field'],
  ['w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none', 'soft-field'],
  ['w-full rounded border text-sm border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/90 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all', 'soft-field'],
  ['w-full min-w-[140px] rounded-lg border text-base border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/90 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all', 'soft-field'],
  ['w-full min-w-[280px] px-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none cursor-pointer', 'soft-field cursor-pointer'],
  ['w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed', 'soft-field'],
  ['w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100', 'soft-field pl-8'],
  ['w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100', 'soft-field'],
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log('missing', f);
    continue;
  }
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  for (const [a, b] of reps) s = s.split(a).join(b);
  if (s !== before) {
    fs.writeFileSync(f, s);
    console.log('updated', f);
  } else {
    console.log('unchanged', f);
  }
}
