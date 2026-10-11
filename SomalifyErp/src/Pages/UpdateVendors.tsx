import { getOneVendorFn } from '@/Redux/Slice/GetOneVendor';
import { resetVendorUpdates, UpdateVendorFn } from '@/Redux/Slice/updateVEnderSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import  { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateVendors() {
  const toastId = "update";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OneVendorState = useSelector((state: RootState) => state.GetOneVendor);
  const UpdateVendorState = useSelector((state: RootState) => state.UpdateVendor);

  const params = useParams();
  const id = params.vendor_id;

  const [vendorData, setVendorData] = useState({
    vendor_name: '',
    vendor_address: '',
    vendor_phone: '',
    vendor_email: '',
    vendor_id:0
  });

  useEffect(() => {
    if (id) {
      dispatch(getOneVendorFn(+id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (OneVendorState.data) {
      setVendorData({
        vendor_name: OneVendorState.data.vendor_name || '',
        vendor_address: OneVendorState.data.vendor_address || '',
        vendor_phone: OneVendorState.data.vendor_phone || '',
        vendor_email: OneVendorState.data.vendor_email || '',
        vendor_id:OneVendorState.data.vendor_id || 0
      });
    }
  }, [OneVendorState.data]);

  useEffect(() => {
    if (UpdateVendorState.isLoading) {
      toast.loading('Updating vendor...', { id: toastId });
    }
    if (UpdateVendorState.IsSuccess) {
      toast.success('Successfully updated.', { id: toastId });
      navigate('/Dashboard/Vendor');
    }
    if (UpdateVendorState.isError) {
      toast.error(UpdateVendorState.errorMsg, { id: toastId });
    }
    if (UpdateVendorState.isLoading || UpdateVendorState.IsSuccess || UpdateVendorState.isError) {
      dispatch(resetVendorUpdates());
    }
  }, [UpdateVendorState.isLoading, UpdateVendorState.IsSuccess, UpdateVendorState.isError, dispatch, navigate]);

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setVendorData({
      ...vendorData,
      [name]: value
    });
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    dispatch(UpdateVendorFn(vendorData));
  };

  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="p-4 sm:p-6">
        <h1 className="font-semibold text-lg dark:text-white">Update Vendor</h1>
        <form onSubmit={handleSubmit} className="bg-white text-black my-2 p-4 rounded-[8px] w-full flex flex-col">
          <div className="formdiv flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col">
                <label htmlFor="vendor_name">Vendor name</label>
                <input
                  type="text"
                  name="vendor_name"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.vendor_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="vendor_address">Vendor Address</label>
                <input
                  type="text"
                  name="vendor_address"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.vendor_address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="vendor_phone">Vendor Phone</label>
                <input
                  type="tel"
                  name="vendor_phone"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.vendor_phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="vendor_email">Email</label>
                <input
                  type="email"
                  name="vendor_email"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={vendorData.vendor_email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end my-4">
            <button type='submit' className='bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center w-[14%] text-white p-2'>Update Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateVendors;
