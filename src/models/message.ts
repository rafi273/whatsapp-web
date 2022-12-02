import { getProperty } from "./data";
import axios from "axios";
import WAWebJS from "whatsapp-web.js";
import "dotenv/config";

export function sendMessage(message: WAWebJS.Message, chatId: string, text: string) {
    return message.reply(text, chatId);
}

export function sendMultipleMessage(message: WAWebJS.Message, chatId: string, object: string[]) {
    for (const iterator of object) {
        sendMessage(message, chatId, iterator);
    }
}

export async function sendButtonMessage(to: string, body: string, action: string[]) {
    const buttons = [];

    for (const iterator of action) {
        buttons.push({
            text: iterator
        });
    }

    return await axios.post(
        `${process.env.WA_API_HOST}/api/v1/sendInteractiveButtonsMessage?whatsappNumber=${to}`,
        {
            body: body,
            buttons: buttons
        },
        getProperty()
    );
}

export async function sendListMessage(to: string, body: string, action: string[]) {
    const buttons = [];

    for (const iterator of action) {
        buttons.push({
            title: iterator
        });
    }

    return await axios.post(
        `${process.env.WA_API_HOST}/api/v1/sendInteractiveListMessage?whatsappNumber=${to}`,
        {
            body: body,
            buttonText: "Pilih",
            sections: [
                {
                    rows: buttons
                }
            ]
        },
        getProperty()
    );
}
