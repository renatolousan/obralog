import { Router } from 'express';
import * as controller from './controller';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.post(
  '/suppliers/incidents',
  isBuildingManager,
  controller.getRecurrentSuppliersController,
);
router.post(
  '/installers/incidents',
  isBuildingManager,
  controller.getRecurrentInstallersController,
);
router.post(
  '/buildings/incidents',
  isBuildingManager,
  controller.getRecurrentBuildingsController,
);
router.post(
  '/items/incidents',
  isBuildingManager,
  controller.getRecurringItemsController,
);

// Dashboard Gerencial - rotas para Engenheiros/Coordenadores Técnicos
router.get(
  '/managerial/top-items',
  isBuildingManager,
  controller.getTop5MostComplainedItemsController,
);
router.get(
  '/managerial/top-suppliers',
  isBuildingManager,
  controller.getTopSuppliersByOccurrencesController,
);
router.get(
  '/managerial/top-installers',
  isBuildingManager,
  controller.getTopInstallersByFailuresController,
);

export { router as analyticsRouter };
