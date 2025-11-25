import { Router } from 'express';
import { getIssuesController } from './controller';

const router = Router();

router.get('/', getIssuesController);

export { router as issuesRouter };
