import  { useEffect, useState } from 'react';
// import { resetVendorUpdates, UpdateVendorFn } from '@/Redux/Slice/updateVEnderSlice';
import { AppDispatch, RootState } from '@/Redux/Store';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getOneProductFN } from '@/Redux/Slice/GEtOneProduct';
import { UpdateProductFn,  resetProductUpdates } from '@/Redux/Slice/ProductUpdateSlice';

function ProductUpdate() {
  const toastId = "update";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const OneProductState = useSelector((state: RootState) => state.GetONeProduct);
  const UpdateProductState = useSelector((state: RootState) => state.UpdateProduct);

const params = useParams();
  const id = params.product_id 
  console.log("params",id)

  const [ProductData, setProductData] = useState({
    product_name: '',
    product_code: '',
    product_price: '',
    product_cost: '',
    product_id: 0,
    product_alert_number: 0,
    category: '',
    description: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(getOneProductFN(+id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (OneProductState.data) {
      setProductData({
        product_name: OneProductState.data.product_name || '',
        product_code: OneProductState.data.product_code || '',
        product_price: OneProductState.data.product_price || '',
        product_cost: OneProductState.data.product_cost != null ? String(OneProductState.data.product_cost) : '',
        product_id: OneProductState.data.product_id || 0,
        product_alert_number: OneProductState.data.product_alert_number || 0,
        category: OneProductState.data.category || '',
        description: OneProductState.data.description || '',
      });
    }
  }, [OneProductState.data]);

  useEffect(() => {
    if (UpdateProductState.isLoading) {
      toast.loading('Updating Product...', { id: toastId });
    }
    if (UpdateProductState.IsSuccess) {
      toast.success('Successfully updated.', { id: toastId });
      navigate('/Dashboard/Products');
    }
    if (UpdateProductState.isError) {
      toast.error(UpdateProductState.errorMsg, { id: toastId });
    }
    if (UpdateProductState.isLoading || UpdateProductState.IsSuccess || UpdateProductState.isError) {
      dispatch(resetProductUpdates());
    }
  }, [UpdateProductState.isLoading, UpdateProductState.IsSuccess, UpdateProductState.isError, dispatch, navigate]);

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setProductData({
      ...ProductData,
      [name]: value
    });
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    dispatch(UpdateProductFn(ProductData));
  };

  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="p-4 sm:p-6">
        <h1 className="font-semibold text-lg dark:text-white">Update Product</h1>
        <form onSubmit={handleSubmit} className="bg-white text-black my-2 p-4 rounded-[8px] w-full flex flex-col">
          <div className="formdiv flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col">
                <label htmlFor="product_name">Product name</label>
                <input
                  type="text"
                  name="product_name"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ProductData.product_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="product_code">Product code</label>
                <input
                  type="text"
                  name="product_code"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ProductData.product_code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="product_price">Price</label>
                <input
                  type="number"
                  name="product_price"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ProductData.product_price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="product_cost">Default cost (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="product_cost"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ProductData.product_cost}
                  onChange={handleInputChange}
                  placeholder="Used in reports when no purchase cost"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="product_alert_number">Alert number</label>
                <input
                  type="number"
                  name="product_alert_number"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ProductData.product_alert_number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  name="category"
                  className="border border-gray-400 rounded-[10px] p-2"
                  value={ProductData.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Electronics, Food"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  className="border border-gray-400 rounded-[10px] p-2 min-h-[80px]"
                  value={ProductData.description}
                  onChange={handleInputChange}
                  placeholder="Product description (optional)"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end my-4">
            <button type='submit' className='bg-[#605BFF] rounded-[8px] shadow-[0_4px_23.5px_rgba(96,91,255,1)] flex justify-center min-w-[180px] w-[14%] text-white p-2'>Update Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductUpdate;
