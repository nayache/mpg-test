import { NextFunction, Request, Response } from "express";
import { HttpException } from "../services/httpException";

export function errorHandler(error: HttpException, req: Request, res: Response, next: NextFunction) {
    const { status, message } = error;
    res.status(status).json({ error: { status, message } });
}