import WAWebJS from "whatsapp-web.js";
import { sendMessage } from "../models/message";

export function textHandling(message: WAWebJS.Message, chatId:string) {
    sendMessage(message, chatId, "Mohon hanya pilih jawaban yang tersedia");
}

export function endMessage(message?: string): string[] {
    const arr = ["-Akhir Pesan-"];

    if (message) {
        arr.unshift(message);
    }
    return arr;
}
