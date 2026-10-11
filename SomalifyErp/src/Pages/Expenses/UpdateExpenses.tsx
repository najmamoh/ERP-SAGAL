import { getOneExpensesFn } from '@/Redux/Slice/expenses/GetOneExpenses';
import { resetExpensesUpdates, UpdateExpensesFn } from '@/Redux/Slice/expenses/UpdateExpensesSLice';
import { AppDispatch, RootState } from '@/Redux/Store';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

function UpdateExpenses() {
  const toastId = "UpdateExpenses";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OneExpenseState = useSelector((state: RootState) => state.OneExpense);
  const Updatetate = useSelector((state: RootState) => state.UpdateExpenses);

  const params = useParams();
  const id = params.expense_id;

 


  const [ExpensesData, setExpensesData] = useState({
    item_name: "",
    item_qty: 0,
    item_cost: "",
    paid_amount: "",
    date: "",
    expense_id: 0
  });

  useEffect(() => {
    if (id) {
      dispatch(getOneExpensesFn(+id));
    }
  }, [id, dispatch]);

 


  useEffect(() => {
    if (OneExpenseState.data) {
      setExpensesData({
        item_name: OneExpenseState.data.item_name || '',
        item_qty: OneExpenseState.data.item_qty || 0,
        item_cost: OneExpenseState.data.item_cost || '',
        paid_amount: OneExpenseState.data.paid_amount || '',
        date: OneExpenseState.data.date ? new Date(OneExpenseState.data.date).toISOString().slice(0, 10) : '',
        expense_id: OneExpenseState.data.expense_id
      });
    }
  }, [OneExpenseState.data]);

  useEffect(() => {
    if (Updatetate.isLoading) {
      toast.loading('Updating ...', { id: toastId });
    }
    if (Updatetate.IsSuccess) {
      toast.success('Successfully updated.', { id: toastId });
      navigate('/Dashboard/Products/Expenses');
    }
    if (Updatetate.isError) {
      toast.error(Updatetate.errorMsg, { id: toastId });
    }
    if (Updatetate.isLoading || Updatetate.IsSuccess || Updatetate.isError) {
      dispatch(resetExpensesUpdates());
    }
  }, [Updatetate.isLoading, Updatetate.IsSuccess, Updatetate.isError, dispatch, navigate]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setExpensesData({
      ...ExpensesData,
      [name]: name === 'item_qty' || name === 'expense_id' ? +value : value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    dispatch(UpdateExpensesFn(ExpensesData));
  };

  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="py-10 sm:py-20 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="bg-white text-black dark:text-black my-2 p-4 sm:p-8 rounded-[8px] w-full max-w-4xl mx-auto">
          <Link to={'/Dashboard/Products/Expenses'}>
            <h1 className="text-3xl font-bold"><IoIosArrowRoundBack /></h1>
          </Link>
          <h1 className="font-semibold text-lg sm:text-xl mb-4">Update Expenses</h1>
          <div className="formdiv py-4 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label htmlFor="item_name" className="mb-2">Item Name</label>
                <input
                  type="text"
                  name="item_name"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ExpensesData.item_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="paid_amount" className="mb-2">Paid Amount</label>
                <input
                  type="text"
                  name="paid_amount"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ExpensesData.paid_amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="date" className="mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ExpensesData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="item_qty" className="mb-2">Quantity</label>
                <input
                  type="number"
                  name="item_qty"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ExpensesData.item_qty}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="item_cost" className="mb-2">Item Cost</label>
                <input
                  type="number"
                  name="item_cost"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ExpensesData.item_cost}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="bg-[#605BFF] rounded-[8px] shadow-md flex justify-center w-full sm:w-auto text-white px-4 py-2">
              Update Expenses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateExpenses;
