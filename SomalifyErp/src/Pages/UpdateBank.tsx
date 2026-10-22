import { getOneBankFn } from '@/Redux/Slice/GetOneBank';
import { resetBankUpdates, UpdateBankFn } from '@/Redux/Slice/UpdateBankSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import  { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateBank() {
  const toastId = "update";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OneBankState = useSelector((state: RootState) => state.GetOneBank);
  const UpdateBankState = useSelector((state: RootState) => state.UpdateBank);

  const params = useParams();
  const id = params.bank_id;

  const [bankData, setBankData] = useState({
    bank_name: '',
    amount: '',
    sale_id: null as number | null,
    bank_id:0
  });

  useEffect(() => {
    if (id) {
      dispatch(getOneBankFn(+id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (OneBankState.data) {
      setBankData({
        bank_name: OneBankState.data.bank_name || '',
        amount: OneBankState.data.amount || '',
        sale_id: OneBankState.data.sale_id || null,
        bank_id:OneBankState.data.bank_id || 0
      });
    }
  }, [OneBankState.data]);

  useEffect(() => {
    if (UpdateBankState.isLoading) {
      toast.loading('Updating bank...', { id: toastId });
    }
    if (UpdateBankState.IsSuccess) {
      toast.success('Successfully updated.', { id: toastId });
      navigate('/Dashboard/Banks');
    }
    if (UpdateBankState.isError) {
      toast.error(UpdateBankState.errorMsg, { id: toastId });
    }
    if (UpdateBankState.isLoading || UpdateBankState.IsSuccess || UpdateBankState.isError) {
      dispatch(resetBankUpdates());
    }
  }, [UpdateBankState.isLoading, UpdateBankState.IsSuccess, UpdateBankState.isError, dispatch, navigate]);

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setBankData({
      ...bankData,
      [name]: name === 'sale_id' ? (value ? Number(value) : null) : value
    });
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    dispatch(UpdateBankFn(bankData));
  };

  return (
    <div className="soft-page">
      <div className="mb-4">
        <h1 className="soft-title">Update Bank</h1>
        <p className="soft-subtitle">Edit bank details, then save.</p>
      </div>
        <form onSubmit={handleSubmit} className="soft-card">
          <div className="formdiv flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <div className="flex flex-col">
                <label htmlFor="bank_name">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  className="soft-field"
                  value={bankData.bank_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  name="amount"
                  className="soft-field"
                  value={bankData.amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="sale_id">Sale ID (Optional)</label>
                <input
                  type="number"
                  name="sale_id"
                  className="soft-field"
                  value={bankData.sale_id || ''}
                  onChange={handleInputChange}
                  placeholder="Leave empty if not linked to sale"
                />
              </div>
            </div>
          </div>
          <div className="soft-actions">
            <button type='submit' className='soft-submit'>Update Bank</button>
          </div>
        </form>
    </div>
  );
}

export default UpdateBank;
