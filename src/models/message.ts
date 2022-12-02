import WAWebJS, { Buttons, List } from "whatsapp-web.js";
import "dotenv/config";

export function sendMessage(message: WAWebJS.Message, chatId: string, text: string) {
    return message.reply(text, chatId);
}

export function sendMultipleMessage(message: WAWebJS.Message, chatId: string, object: string[]) {
    for (const iterator of object) {
        sendMessage(message, chatId, iterator);
    }
}

export async function sendButtonMessage(message: WAWebJS.Message, chatId: string, body: string, action: string[]) {
    const buttons = [];

    console.log(action);
    for (let index = 0; index < action.length; index++) {
        console.log(action[index]);
        buttons.push({
            id: (index + 1).toString(),
            body: action[index]
        });
    }

    console.log(buttons);
    return message.reply(new Buttons(body, buttons), chatId);
}

export async function sendListMessage(message: WAWebJS.Message, chatId: string, body: string, action: string[]) {
    const buttons = [];

    for (const iterator of action) {
        buttons.push({
            title: iterator
        });
    }

    console.log(buttons);
    return message.reply(new List(body, "Pilih", buttons), chatId);
}
