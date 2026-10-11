import { Router } from 'express';
import { decodeTokenOrMainToken } from '../middlewares';
import {
  getAllWarehouses,
  getTransferDestinations,
  ensureCompanyWarehouses,
  createWarehouse,
  getWarehouseStock,
  getAllTransfers,
  createTransfer,
  approveTransfer,
  completeTransfer,
  cancelTransfer,
  addWarehouseStock,
  setDefaultWarehouse,
  transferFromCompanies,
  getStoreByCompany,
  getTransfersToCompany,
} from '../controllers/warehouseController';

const router = Router();

router.use(decodeTokenOrMainToken);

router.get('/health', (req, res) => res.json({ ok: true, route: '/api/warehouse' }));
router.get('/', getAllWarehouses);
router.get('/transfer-destinations', getTransferDestinations);
router.post('/ensure-warehouses', ensureCompanyWarehouses);
router.get('/by-company/:companyId', getStoreByCompany);
router.get('/transfers/to-company/:companyId', getTransfersToCompany);
router.post('/', createWarehouse);
router.get('/stock/:warehouseId', getWarehouseStock);
router.get('/transfers', getAllTransfers);
router.post('/transfer', createTransfer);
router.post('/transfer-from-companies', transferFromCompanies);
router.put('/:warehouseId/set-default', setDefaultWarehouse);
router.post('/:warehouseId/stock', addWarehouseStock);
router.put('/transfers/:id/approve', approveTransfer);
router.put('/transfers/:id/complete', completeTransfer);
router.put('/transfers/:id/cancel', cancelTransfer);

export default router;
