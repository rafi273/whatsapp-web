import { NextFunction, Request, Response } from "express";

export function getKartiniSignature(req: Request, res: Response, next: NextFunction) {
    if (req.headers["X-Aulianovasi-Signature"] != "YXVsaWFpbm92YXNpQDIzMQ==") {
        return res.sendStatus(401);
    }

    next();
}
