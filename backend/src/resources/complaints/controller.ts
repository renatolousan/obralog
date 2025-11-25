import { type Request, type Response, type NextFunction } from 'express';
import * as service from './service';
import { firstValue } from '../../utils/feedback';
import { deleteUploadedFiles } from '../../utils/files';
import {
  ComplaintStatusUpdate,
  VisitDto,
  type UploadedFile,
} from '../../types/types';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export async function getAllComplaintsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      issue,
      status,
      id_usuario: idUsuario,
      id_item: legacyItemId,
      item_id: itemId,
      search,
      start_date: startDate,
      end_date: endDate,
      development_id: developmentId,
      building_id: buildingId,
      unit_id: unitId,
      supplier_id: supplierId,
      installer_id: installerId,
    } = req.query as Record<string, string | undefined>;

    const complaints = await service.getAllComplaints({
      ...(issue && { issue }),
      ...(status && { status }),
      ...(idUsuario && { id_usuario: idUsuario }),
      ...(legacyItemId && { id_item: legacyItemId }),
      ...(itemId && { item_id: itemId }),
      ...(search && { search }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(developmentId && { development_id: developmentId }),
      ...(buildingId && { building_id: buildingId }),
      ...(unitId && { unit_id: unitId }),
      ...(supplierId && { supplier_id: supplierId }),
      ...(installerId && { installer_id: installerId }),
    });

    res
      .status(StatusCodes.OK)
      .json({ total: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintsByUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session.uid!;
    const {
      issue,
      status,
      id_usuario: idUsuario,
      id_item: legacyItemId,
      item_id: itemId,
      search,
      start_date: startDate,
      end_date: endDate,
      development_id: developmentId,
      building_id: buildingId,
      unit_id: unitId,
      supplier_id: supplierId,
      installer_id: installerId,
    } = req.query as Record<string, string | undefined>;

    const complaints = await service.getUserComplaints(userId, {
      ...(issue && { issue }),
      ...(status && { status }),
      ...(idUsuario && { id_usuario: idUsuario }),
      ...(legacyItemId && { id_item: legacyItemId }),
      ...(itemId && { item_id: itemId }),
      ...(search && { search }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(developmentId && { development_id: developmentId }),
      ...(buildingId && { building_id: buildingId }),
      ...(unitId && { unit_id: unitId }),
      ...(supplierId && { supplier_id: supplierId }),
      ...(installerId && { installer_id: installerId }),
    });

    res
      .status(StatusCodes.OK)
      .json({ total: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintsByDevelopmentController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id;
    const complaints = await service.getComplaintsByDevelopment(id);
    res.status(StatusCodes.OK).json(complaints);
  } catch (error) {
    next(error);
  }
}

export async function getComplaintByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const complaint = await service.getComplaintById(req.params.id);

    if (!complaint) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: ReasonPhrases.NOT_FOUND });
    }

    return res.status(StatusCodes.OK).json({ data: complaint });
  } catch (error) {
    next(error);
  }
}

export async function createComplaintController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const files = (req.files as UploadedFile[]) ?? [];

  try {
    const descricao = firstValue(req.body.descricao)?.trim();
    const issue = firstValue(req.body.issue)?.trim();
    const idItem = firstValue(req.body.id_item)?.trim();
    const idUsuario = req.session.uid!;

    if (!descricao) {
      return res
        .status(400)
        .json({ message: 'O campo "descricao" e obrigatorio.' });
    }

    if (!issue) {
      return res
        .status(400)
        .json({ message: 'O campo "issue" e obrigatorio.' });
    }

    if (!idItem) {
      return res
        .status(400)
        .json({ message: 'O campo "id_item" e obrigatorio.' });
    }

    if (!idUsuario) {
      return res.status(400).json({ message: 'Usuario nao autenticado.' });
    }

    const complaint = await service.createComplaint({
      descricao,
      issue,
      id_item: idItem,
      id_usuario: idUsuario,
      files,
    });

    res.status(StatusCodes.CREATED).json({
      message: ReasonPhrases.CREATED,
      data: complaint,
    });
  } catch (error) {
    await deleteUploadedFiles(files);
    next(error);
  }
}

export async function getIssuesController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const issues = await service.getIssues();

    res.status(StatusCodes.OK).json({
      total: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
}

export async function scheduleVisitController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const complaintId: string = req.params.id;
    const visitData = req.body as VisitDto;
    const visit = await service.scheduleVisit(complaintId, visitData);
    res.status(StatusCodes.CREATED).json(visit);
  } catch (error) {
    next(error);
  }
}

export async function updateComplaintStatusController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const complaintId: string = req.params.id;
    const data = req.body as ComplaintStatusUpdate;
    const message = await service.updateComplaintStatus(complaintId, data);
    res.status(StatusCodes.OK).json({ message });
  } catch (error) {
    next(error);
  }
}
