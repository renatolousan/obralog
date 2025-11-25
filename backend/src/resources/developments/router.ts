import { Router } from 'express';
import * as controller from './controller';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.get(
  '/',
  isBuildingManager,
  controller.getDevelopmentsByManagerController,
);
router.post('/', isBuildingManager, controller.createDevelopmentController); // cadsatrar uma obra
router.patch(
  '/:id/risk-threshold',
  isBuildingManager,
  controller.updateRiskThresholdController,
);
router.get(
  '/:id/health',
  isBuildingManager,
  controller.getDevelopmentHealthController,
);

export { router as developmentsRouter };
