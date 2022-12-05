import { Request, Response } from "express";

/**
 * Home page.
 * @route GET /
 */
export const index = (req: Request, res: Response) => {
    res.render("home", {
        socketHost: process.env.SOCKET_HOST ?? "ws://localhost:3001"
    });
};
