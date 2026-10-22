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
    <div className="soft-page">
      <div className="mb-4">
        <h1 className="soft-title">Update Vendor</h1>
        <p className="soft-subtitle">Edit vendor details, then save.</p>
      </div>
        <form onSubmit={handleSubmit} className="soft-card">
          <div className="formdiv flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="flex flex-col">
                <label htmlFor="vendor_name">Vendor name</label>
                <input
                  type="text"
                  name="vendor_name"
                  className="soft-field"
                  value={vendorData.vendor_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="vendor_address">Vendor Address</label>
                <input
                  type="text"
                  name="vendor_address"
                  className="soft-field"
                  value={vendorData.vendor_address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="vendor_phone">Vendor Phone</label>
                <input
                  type="tel"
                  name="vendor_phone"
                  className="soft-field"
                  value={vendorData.vendor_phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="vendor_email">Email</label>
                <input
                  type="email"
                  name="vendor_email"
                  className="soft-field"
                  value={vendorData.vendor_email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="soft-actions">
            <button type='submit' className='soft-submit'>Update Vendor</button>
          </div>
        </form>
    </div>
  );
}

export default UpdateVendors;
