import { Router } from 'express';
import * as controller from './controller';
import isAuth from '../../middlewares/isAuth';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.get('/', isAuth, controller.getAllInstallersController);
router.post('/', isBuildingManager, controller.createInstallerController);

export { router as installersRouter };
