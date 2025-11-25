import { Router } from 'express';
import * as controller from './controller';
import { upload } from '../../middlewares/uploadImage';
import isAuth from '../../middlewares/isAuth';
import isClient from '../../middlewares/isClient';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

// rotas de leitura
router.get('/', isClient, controller.getComplaintsByUserController);
router.get(
  '/:id',
  isBuildingManager,
  controller.getComplaintsByDevelopmentController,
);
router.get('/:id', isAuth, controller.getComplaintByIdController);

router.post('/', isClient, upload.any(), controller.createComplaintController);
router.post(
  '/:id/visit',
  isBuildingManager,
  controller.scheduleVisitController,
);

router.put('/:id/visit', isAuth, controller.updateComplaintStatusController);

export { router as complaintsRouter };
