// import express from 'express';

// import { checkCompanyHasThisSale } from '../middlewares/receivables';
// import { decodeToken } from '../middlewares';
// import { getReceivables, updateReceivable } from '../controllers';


// const router = express.Router();

// router.use(decodeToken);

// router.get('/products', getReceivables);
// router.post('/', updateReceivable);

// export default router;



import express from 'express';
import { createReceivable, getReceivables, getServiceReceivables, createServiceReceivable } from '../controllers';
import { decodeTokenOrMainToken, requirePermission } from '../middlewares';

const router = express.Router();
router.use(decodeTokenOrMainToken);

router.get('/products', requirePermission('sales', 'read'), getReceivables);
router.post('/products', requirePermission('sales', 'create'), createReceivable);
router.get('/services', requirePermission('sales', 'read'), getServiceReceivables);
router.post('/services', requirePermission('sales', 'create'), createServiceReceivable);

export default router;