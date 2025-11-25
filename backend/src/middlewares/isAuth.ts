import { type Request, type Response, type NextFunction } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session.uid && req.session.userTypeId) next();
  else
    res
      .status(StatusCodes.NETWORK_AUTHENTICATION_REQUIRED)
      .json({ message: ReasonPhrases.NETWORK_AUTHENTICATION_REQUIRED });
};

export default isAuth;
