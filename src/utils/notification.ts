import { Client } from "whatsapp-web.js";
import { sendMessage } from "../models/message";

export function textHandling(client: Client, chatId:string) {
    sendMessage(client, chatId, "Mohon hanya pilih jawaban yang tersedia");
}

export function endMessage(message?: string): string[] {
    const arr = ["-Akhir Pesan-"];

    if (message) {
        arr.unshift(message);
    }
    return arr;
}
