import express from 'express';
import { 
  createCompany, 
  CreateComUser, 
  deleteCompany, 
  getAllCompanies, 
  getCompany, 
  updateCompany 
} from '../controllers/companyController';
import { decodeToken, isSuperAdmin } from '../middlewares';

const router = express.Router();

// Apply middleware
// router.use(decodeToken);
// router.use(isSuperAdmin);

// Define routes
router.get('/', getAllCompanies);
router.get('/:id', getCompany);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
router.post('/User/Create',CreateComUser)

export default router;