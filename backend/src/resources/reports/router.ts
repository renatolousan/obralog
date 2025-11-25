import { Router } from 'express';
import * as controller from './controller';

const router = Router();

// relatórios gerais (todas as obras do usuário)

router.get('/complaints', controller.generateComplaintReportController);
router.get('/items', controller.getItemComplaintsReportController);

// relatórios parciais (por obra)

router.post(
  '/:id/complaint',
  controller.generateComplaintReportByDevelopmentController,
);

router.get('/:id/', controller.generateDevelopmentReportController);

export { router as reportsRouter };
