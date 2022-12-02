import { AxiosError } from "axios";
import { Request, Response } from "express";
import { addContact, sendMessage } from "../models/message";

export default async (req: Request, res: Response) => {
    const body = req.body;

    for (const iterator of body.to) {
        const mobile: string = iterator.mobile ?? null;
        const text: string = body.text ?? null;

        if (!mobile || !text) {
            return res.sendStatus(400);
        }

        addContact(mobile).then(() => {
            sendMessage(mobile, text).catch((error: AxiosError) => {
                console.error(error);
            });
        }).catch((error: AxiosError) => {
            console.error(error);
        });
    }

    return res.sendStatus(200);
};
