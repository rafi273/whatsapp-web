/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buttons, Client, List } from "whatsapp-web.js";
import "dotenv/config";

export function sendMessage(client: Client,  chatId: string, text: string) {
    return client.sendMessage(chatId, text.substring(0, 1024));
}

export function sendMultipleMessage(client: Client, chatId: string, object: string[]) {
    for (const iterator of object) {
        sendMessage(client, chatId, iterator);
    }
}

export function sendButtonMessage(client: Client, chatId: string, body: string, action: string[]) {
    const buttons = [];

    for (let index = 0; index < action.length; index++) {
        buttons.push({
            id: (index + 1).toString(),
            body: action[index].substring(0, 20)
        });
    }

    return client.sendMessage(chatId, new Buttons(body.substring(0, 1024), buttons));
}

export function sendListMessage(client: Client, chatId: string, body: string, action: string[]) {
    const length = action.length;
    const sections = [
        {
            title: "Pilih",
            rows: [] as any[]
        }
    ];

    for (let index = 0; index < (length > 10 ? 10 : length); index++) {
        sections[0].rows.push({
            id: (index + 1).toString(),
            title: action[index].substring(0, 24)
        });
    }

    return client.sendMessage(chatId, new List(body.substring(0, 1024), "Pilih", sections));
}
