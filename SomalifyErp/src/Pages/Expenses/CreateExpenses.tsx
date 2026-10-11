import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { createExpensesFn, resetExpenses } from '@/Redux/Slice/expenses/CreateExpensesSlice';
import { HiOutlineCube, HiOutlineCurrencyDollar } from 'react-icons/hi2';






function CreateExpenses() {
  const [item_name, setName] = useState('');
  const [item_qty, setQty] = useState('');
  const [item_cost, setCost] = useState('');
  const [paid_amount, setAmount] = useState('');
  const [date, setdate] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/AdminDashboard') ? '/AdminDashboard' : '/Dashboard';
 
  // 
// const Allemployees= useSelector((state:RootState)=>state.AllEmployes)
// useEffect(() => {
//   dispatch(getAllEmployersFn());
// }, [dispatch]);
   
  const CreateExpensesState = useSelector(
    (state: RootState) => state.CreateExpenses
  );

 
  const submitHandler =async(e:React.FormEvent)=>{

    e.preventDefault();
    const data= {
        item_name,
        item_qty:+item_qty,
        item_cost,
      paid_amount,
      date,
    //   company_id,
    }
    dispatch(createExpensesFn(data))
  }
  
useEffect(() => {
    dispatch(resetExpenses());
  }, [dispatch])

  useEffect(() => {
    if (CreateExpensesState.isLoading) {
      toast.loading('loading... ', { id: 'salry' });
      
    }
    if (CreateExpensesState.IsSuccess) {
      toast.success('Expense created successfully', { id: 'salry' });
      const basePath = location.pathname.includes('/AdminDashboard') ? '/AdminDashboard' : '/Dashboard';
      navigate(`${basePath}/Expenses`);
      dispatch(resetExpenses());
    }
  
    if (CreateExpensesState.isError) {
      toast.error(CreateExpensesState.errorMsg, { id: 'salry' });
      dispatch(resetExpenses());
    }
    dispatch(resetExpenses())
  }, [CreateExpensesState.IsSuccess, CreateExpensesState.isError, CreateExpensesState.isLoading, dispatch, navigate, location]);

  const inputBase =
    'w-full px-4 py-3 rounded-xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 transition-all duration-200';
  const labelBase = 'text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block';
  const btnPrimary =
    'px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#605BFF] to-[#3a3799] shadow-[0_4px_23px_0_rgba(96,91,255,0.5)] hover:shadow-[0_6px_28px_0_rgba(96,91,255,0.6)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2';
  const btnSecondary =
    'px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-700/80 shadow-sm transition-all flex items-center gap-2';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 overflow-auto">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header card */}
        <div className="mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-lg shadow-indigo-100/50 dark:shadow-slate-900/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/30">
                <HiOutlineCurrencyDollar className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Expense</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Add a new expense to your records
                </p>
              </div>
            </div>
            <Link to={`${basePath}/Expenses`} className={btnSecondary}>
              <HiOutlineCube className="text-lg" />
              Back to Expenses
            </Link>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={submitHandler}
          className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100/80 dark:border-slate-700/80 shadow-xl shadow-indigo-100/30 dark:shadow-slate-900/30 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <label htmlFor="item_name" className={labelBase}>
                  Item Name
                </label>
                <input
                  id="item_name"
                  type="text"
                  className={inputBase}
                  value={item_name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="item_qty" className={labelBase}>
                  Quantity
                </label>
                <input
                  id="item_qty"
                  type="number"
                  className={inputBase}
                  value={item_qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="item_cost" className={labelBase}>
                  Item Cost
                </label>
                <input
                  id="item_cost"
                  type="number"
                  className={inputBase}
                  value={item_cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="paid_amount" className={labelBase}>
                  Paid Amount
                </label>
                <input
                  id="paid_amount"
                  type="number"
                  className={inputBase}
                  value={paid_amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="date" className={labelBase}>
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className={inputBase}
                  value={date}
                  onChange={(e) => setdate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={CreateExpensesState.isLoading}
                className={`${btnPrimary} min-w-[200px] justify-center`}
              >
                {CreateExpensesState.isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Expense'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateExpenses