import express from 'express';
import {
  getAllStores,
  getOneStore,
  createStore,
  updateStore,
  deleteStore,
  linkCompaniesToStore,
  unlinkCompanyFromStore,
  getStoresLinkedToCompany,
  getCompanyInventory,
  getStoreStock,
  addStoreStock,
} from '../controllers/storeController';
import { decodeTokenOrMainToken, isAdmin } from '../middlewares';

const router = express.Router();
router.use(decodeTokenOrMainToken);

router.get('/', getAllStores);
router.get('/company/:companyId/inventory', getCompanyInventory);
router.get('/linked-to-company/:companyId', getStoresLinkedToCompany);
router.get('/:id/stock', getStoreStock);
router.post('/:id/stock', isAdmin, addStoreStock);
router.get('/:id', getOneStore);
router.post('/', createStore);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);
router.post('/:id/companies', linkCompaniesToStore);
router.delete('/:id/companies/:company_id', unlinkCompanyFromStore);

export default router;
