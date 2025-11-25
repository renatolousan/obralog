import { Router } from 'express';
import * as controller from './controller';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.post('/register', isBuildingManager, controller.registerItemController);

router.post(
  '/mass-register',
  isBuildingManager,
  controller.upload.single('file'),
  controller.validateCSV,
  controller.massRegisterController,
);

export { router as itemsRouter };
