import { Router } from 'express';
import * as controller from './controller';
import isAuth from '../../middlewares/isAuth';
import isAdmin from '../../middlewares/isAdmin';
import { upload, validateCSV } from '../../middlewares/uploadTable';
import isBuildingManager from '../../middlewares/isbuildingManager';

const router = Router();

router.post('/login', controller.loginController);

router.post('/register', controller.registerController);

router.post(
  '/mass-register',
  isBuildingManager,
  upload.single('file'),
  validateCSV,
  controller.massRegisterController,
);

router.post(
  '/first-access/change-password',
  isAuth,
  controller.firstAccessChangePasswordController,
);

router.post('/change-password', isAuth, controller.changePasswordController);

router.post('/logout', isAuth, controller.logoutController);

router.get('/me', isAuth, controller.getCurrentUserController);

// Rotas de administração
router.get('/', isAdmin, controller.getAllUsersController);

router.patch('/:id', isAdmin, controller.updateUserTypeController);

router.delete('/:id', isAdmin, controller.deleteUserController);

export { router as usersRouter };
