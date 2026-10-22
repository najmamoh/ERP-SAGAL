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

  const inputBase = 'soft-field';
  const labelBase = 'soft-label';
  const btnPrimary = 'soft-submit';
  const btnSecondary = 'soft-btn-secondary';

  return (
    <div className="soft-page">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header card */}
        <div className="soft-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#605BFF] dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center justify-center">
                <HiOutlineCurrencyDollar className="text-xl" />
              </div>
              <div>
                <h1 className="soft-title">Create Expense</h1>
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
          className="soft-card"
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