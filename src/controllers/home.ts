import { Request, Response } from "express";

/**
 * Home page.
 * @route GET /
 */
export async function index(req: Request, res: Response) {
    return res.render("home", {
        socketHost: process.env.SOCKET_HOST ?? "ws://localhost:3001"
    });
}
