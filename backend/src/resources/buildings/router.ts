import { Router } from 'express';
import * as controller from './controller';
import isAuth from '../../middlewares/isAuth';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.get(
  '/:id/buildings',
  isAuth,
  controller.getBuildingsByDevelopmentController,
);
router.get('/:id', isAuth, controller.getBuildingByIdController);
router.post('/', isBuildingManager, controller.createNewBuilding);

export { router as buildingsRouter };
