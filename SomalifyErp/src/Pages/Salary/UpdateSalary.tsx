import { resetSalaryUpdates, UpdateSalaryFn } from '@/Redux/Slice/Salareis/UpdateSalarySlice';
import { getOneSalaryFn } from '@/Redux/Slice/Salareis/getoneSlary';

import { AppDispatch, RootState } from '@/Redux/Store';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateSalary() {
  const toastId = "updatesalary";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OneSalarytate = useSelector((state: RootState) => state.getOnesalary);
  const UpdateSalarytate = useSelector((state: RootState) => state.updateSalary);

  const params = useParams();
  const id = params.employee_id;
  console.log(params)

  const [SalaryData, setSalaryData] = useState({
    paid_amount: '',
    date: '',
    employee_id: 0, 
    salary_id:0
  });

  useEffect(() => {
    if (id) {
      dispatch(getOneSalaryFn(+id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (OneSalarytate.data) {
      setSalaryData({
        paid_amount: OneSalarytate.data.paid_amount || '',
        date: OneSalarytate.data.date ? new Date(OneSalarytate.data.date).toISOString().slice(0, 10) : '', 
        employee_id: OneSalarytate.data.employee_id || 0,
        salary_id: OneSalarytate.data.salary_id|| 0,
      });
    }
  }, [OneSalarytate.data]);

  useEffect(() => {
    if (UpdateSalarytate.isLoading) {
      toast.loading('Updating ...', { id: toastId });
    }
    if (UpdateSalarytate.IsSuccess) {
      toast.success('Successfully updated.', { id: toastId });
      navigate('/Dashboard/Employees/salaries');
    }
    if (UpdateSalarytate.isError) {
      toast.error(UpdateSalarytate.errorMsg, { id: toastId });
    }
    if (UpdateSalarytate.isLoading || UpdateSalarytate.IsSuccess || UpdateSalarytate.isError) {
      dispatch(resetSalaryUpdates());
    }
  }, [UpdateSalarytate.isLoading, UpdateSalarytate.IsSuccess, UpdateSalarytate.isError, dispatch, navigate]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setSalaryData({
      ...SalaryData,
      [name]: name === 'employee_id' ? +value : value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    dispatch(UpdateSalaryFn(SalaryData));
  };

  return (
    <div className="soft-page">
      <div className="p-4 sm:p-6 max-w-6xl">
        <form onSubmit={handleSubmit} className="soft-card max-w-4xl mx-auto">
        <Link to={'/Dashboard/Employees/salaries'}>
        <h1 className="text-3xl font-bold"><IoIosArrowRoundBack />
        </h1>
        </Link>
          <h1 className="soft-title mb-4">Update Salary</h1>
          <div className="formdiv py-4 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div className="flex flex-col">
                <label htmlFor="paid_amount" className="mb-2">Paid Amount</label>
                <input
                  type="text"
                  name="paid_amount"
                  className="soft-field"
                  value={SalaryData.paid_amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="date" className="mb-2">Date</label>
                <input
                  type="text"
                  name="date"
                  className="soft-field"
                  value={SalaryData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="employee_id" className="mb-2">Employee</label>
                <input
                  type="tel"
                  name="employee_id"
                  className="soft-field cursor-not-allowed"
                  value={SalaryData.employee_id}
                  readOnly
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="employee_id" className="mb-2">Salary_id</label>
                <input
                  type="tel"
                  name="salary_id"
                  className="soft-field cursor-not-allowed"
                  value={SalaryData.salary_id}
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="soft-submit">
              Update Salary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateSalary;
