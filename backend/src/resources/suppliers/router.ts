import { Router } from 'express';
import * as controller from './controller';
import { upload, validateCSV } from '../../middlewares/uploadTable';
import isAuth from '../../middlewares/isAuth';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.get('/', isAuth, controller.getAllSuppliersController);
router.post('/', isBuildingManager, controller.createNewSupplierController);
router.post(
  '/bulk-register',
  isBuildingManager,
  upload.single('file'),
  validateCSV,
  controller.bulkRegistrationController,
);

export { router as suppliersRouter };
