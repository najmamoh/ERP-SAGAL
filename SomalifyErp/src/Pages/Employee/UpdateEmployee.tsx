import { getOneEmploymentFn } from '@/Redux/Slice/Employe/OneEmplaymentSlice';
import { resetemployeeUpdates, UpdateEmployeeFn } from '@/Redux/Slice/Employe/UpdateEmployeeSlice';

import { AppDispatch, RootState } from '@/Redux/Store';
import  { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateEmployee() {
  const toastId = "update";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OneEmployeesState = useSelector((state: RootState) => state.OneEmployee);
  const UpdateEmployeeState = useSelector((state: RootState) => state.UpdateEmployees);

  const params = useParams();
  const id = params.employee_id;

  const [employData, setemployData] = useState({
    employee_name: '',
    employee_address: '',
    employee_phone: '',
    salary_amount: '',
    employee_id:''
  });

  useEffect(() => {
    if (id) {
      dispatch(getOneEmploymentFn(+id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (OneEmployeesState.data) {
      setemployData({
        employee_name: OneEmployeesState.data.employee_name || '',
        employee_address: OneEmployeesState.data.employee_address || '',
        employee_phone: OneEmployeesState.data.employee_phone || '',
        salary_amount: OneEmployeesState.data.salary_amount || '',
        employee_id:OneEmployeesState.data.employee_id || ''
      });
    }
  }, [OneEmployeesState.data]);

  useEffect(() => {
    if (UpdateEmployeeState.isLoading) {
      toast.loading('Updating ...', { id: toastId });
    }
    if (UpdateEmployeeState.IsSuccess) {
      toast.success('Successfully updated.', { id: toastId });
      navigate('/Dashboard/Employees');
    }
    if (UpdateEmployeeState.isError) {
      toast.error(UpdateEmployeeState.errorMsg, { id: toastId });
    }
    if (UpdateEmployeeState.isLoading || UpdateEmployeeState.IsSuccess || UpdateEmployeeState.isError) {
      dispatch(resetemployeeUpdates());
    }
  }, [UpdateEmployeeState.isLoading, UpdateEmployeeState.IsSuccess, UpdateEmployeeState.isError, dispatch, navigate]);

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setemployData({
      ...employData,
      [name]: value
    });
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    dispatch(UpdateEmployeeFn(employData));
  };

  return (
    <div className="soft-page">
      <div className="p-4 sm:p-6 max-w-6xl">
        <h1 className="soft-title">Update Employee</h1>
        <form onSubmit={handleSubmit} className="soft-card">
          <div className="formdiv flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="flex flex-col">
                <label htmlFor="employee_name">Employee  name</label>
                <input
                  type="text"
                  name="employee_name"
                  className="soft-field"
                  value={employData.employee_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="employee_address">Employee  Address</label>
                <input
                  type="text"
                  name="employee_address"
                  className="soft-field"
                  value={employData.employee_address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="employee_phone">Employee  Phone</label>
                <input
                  type="tel"
                  name="employee_phone"
                  className="soft-field"
                  value={employData.employee_phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="salary_amount">Salary amount</label>
                <input
                  type="number"
                  name="salary_amount"
                  className="soft-field"
                  value={employData.salary_amount}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="soft-actions"><button type="submit" className="soft-submit">Update Employee</button></div>
        </form>
      </div>
    </div>
  );
}

export default UpdateEmployee;
