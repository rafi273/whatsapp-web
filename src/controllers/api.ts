import client from "../socket";
import { Request, Response } from "express";
import { sendMessage } from "../models/message";

/**
 * Broadcast API example.
 * @route GET /api/broadcast
 */
export const getBroadcast = async (req: Request, res: Response) => {
    const body = req.body;

    for (const iterator of body.to) {
        const mobileNumber: string = iterator.mobile_number ?? null;
        const text: string = body.text ?? null;

        if (!mobileNumber || !text) {
            return res.sendStatus(400);
        }

        await sendMessage(client, `${mobileNumber.substring(1)}@c.us`, text).catch(error => {
            throw new Error(error);
        });
    }

    return res.sendStatus(200);
};
