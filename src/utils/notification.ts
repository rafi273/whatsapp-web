import { sendMessage } from "../models/message";

export async function textHandling(waId: string) {
    await sendMessage(waId, "Mohon hanya pilih jawaban yang tersedia");
}

export function endMessage(message?: string): string[] {
    const arr = ["-Akhir Pesan-"];

    if (message) {
        arr.unshift(message);
    }
    return arr;
}
