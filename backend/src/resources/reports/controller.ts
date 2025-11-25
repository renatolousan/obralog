import { type Request, type Response, type NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getMonthlyComplaintsByDevelopment } from '../complaints/service';
import { parse, lastDayOfMonth } from 'date-fns';
import { generateMonthlyComplaintReport } from './generators/monthlyComplaintsReport';
import { getDevelopmentsComplaintsReport } from '../developments/service';
import { generateDevelopmentsReportExcel } from './generators/developmentsComplaintReport';
import { getItemComplaintsReport } from '../items/service';
import { generateItemsReportExcel } from './generators/itemComplaintsReport';
import { generateDevelopmentSummaryPDF } from './generators/developmentStatusSummary';

export async function generateComplaintReportController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session.uid as string;
    const data = await getDevelopmentsComplaintsReport(userId);
    await generateDevelopmentsReportExcel({ data, res });
  } catch (error) {
    next(error);
  }
}

export async function generateComplaintReportByDevelopmentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const developmentID = req.params.id as string;
    const { startMonth, endMonth } = req.body;

    const startDate = parse(startMonth, 'yyyy-MM', new Date());
    const endDate = lastDayOfMonth(parse(endMonth, 'yyyy-MM', new Date()));

    const data = await getMonthlyComplaintsByDevelopment(
      developmentID,
      startDate,
      endDate,
    );
    await generateMonthlyComplaintReport({ data, res });
  } catch (error) {
    next(error);
  }
}
export async function getItemComplaintsReportController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await getItemComplaintsReport();
    await generateItemsReportExcel({ data, res });
  } catch (error) {
    next(error);
  }
}

export async function generateDevelopmentReportController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const developmentId = req.params.id as string;

    await generateDevelopmentSummaryPDF({
      developmentId,
      res,
    });
  } catch (error) {
    next(error);
  }
}
