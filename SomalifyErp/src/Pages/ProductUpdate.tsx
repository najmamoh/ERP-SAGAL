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
    <div className="soft-page">
      <div className="mb-4">
        <h1 className="soft-title">Update Product</h1>
        <p className="soft-subtitle">Edit product details, then save.</p>
      </div>
        <form onSubmit={handleSubmit} className="soft-card">
          <div className="formdiv flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="flex flex-col">
                <label htmlFor="product_name">Product name</label>
                <input
                  type="text"
                  name="product_name"
                  className="soft-field"
                  value={ProductData.product_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="product_code">Product code</label>
                <input
                  type="text"
                  name="product_code"
                  className="soft-field"
                  value={ProductData.product_code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="product_price">Price</label>
                <input
                  type="number"
                  name="product_price"
                  className="soft-field"
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
                  className="soft-field"
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
                  className="soft-field"
                  value={ProductData.product_alert_number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  name="category"
                  className="soft-field"
                  value={ProductData.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Electronics, Food"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  className="soft-field min-h-[80px]"
                  value={ProductData.description}
                  onChange={handleInputChange}
                  placeholder="Product description (optional)"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div className="soft-actions">
            <button type='submit' className='soft-submit'>Update Product</button>
          </div>
        </form>
    </div>
  );
}

export default ProductUpdate;
