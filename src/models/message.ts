import axios from "axios";
import { getProperty } from "./data";
import "dotenv/config";

export async function sendMessage(to: string, text: string) {
    const formData = new FormData();

    formData.append("messageText", text);
    return await axios.post(
        `${process.env.WA_API_HOST}/api/v1/sendSessionMessage/${to}`,
        formData,
        getProperty()
    );
}

export async function sendMultipleMessage(to: string, object: string[]) {
    for (const iterator of object) {
        await sendMessage(to, iterator);
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

export async function addContact(phone: string) {
    return await axios.post(
        `${process.env.WA_API_HOST}/api/v1/addContact/${phone}`,
        {
            name: phone,
            customParams: [
                {
                    name: "member",
                    value: "VIP"
                }
            ]
        },
        getProperty()
    );
}

export async function getMedia(mediaId: string) {
    const property = getProperty();
    property.responseType = "arraybuffer";
    const formData = new FormData();

    formData.append("fileName", mediaId);
    return await axios({
        method: "get",
        url: `${process.env.WA_API_HOST}/api/v1/getMedia`,
        headers: property.headers,
        data: formData
    });
}
