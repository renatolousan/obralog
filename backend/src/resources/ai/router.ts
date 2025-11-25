import { Router } from 'express';
import {
  suggestComplaintActionController,
  suggestIndicatorActionController,
  analyzeDevelopmentRiskController,
} from './controller';
import isClient from '../../middlewares/isClient';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.post('/complaint-action', isClient, suggestComplaintActionController);
router.post(
  '/indicators/suggestion',
  isBuildingManager,
  suggestIndicatorActionController,
);
router.post(
  '/analisar-risco/:id',
  isBuildingManager,
  analyzeDevelopmentRiskController,
);

export { router as aiRouter };
