import express from 'express';
import { decodeTokenOrMainToken } from '../middlewares';
import { createSalary, deleteSalary, getAllSalaries, getSalary, updateSalary } from '../controllers';


const router = express.Router();

router.use(decodeTokenOrMainToken);

router.get('/', getAllSalaries);
router.get('/:id', getSalary);
router.post('/', createSalary);
router.put('/:id', updateSalary);
router.delete('/:id', deleteSalary);

export default router;