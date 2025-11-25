import { Router } from 'express';
import * as controller from './controller';
import isAuth from '../../middlewares/isAuth';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.get('/:id/units', isAuth, controller.getUnitsByBuildingController);
router.get('/:id/context', isAuth, controller.getUnitContextController);
router.get('/:id/complaints', isAuth, controller.getFeedbacksPerUnitController);
router.post('/', isBuildingManager, controller.createNewUnitController);

export { router as unitsRouter };
