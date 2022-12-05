/* eslint-disable @typescript-eslint/no-explicit-any */
import cache from "./cache";
import redis from "../config/redis";
import WAWebJS, { Client } from "whatsapp-web.js";
import { sendMessage, sendMultipleMessage, sendButtonMessage, sendListMessage } from "./message";
import { getQuestionCache, searchIndex, insertAnswer, getQuestionData, getProject, getChatQuestion, getPostalCode, getCity, getProvince, getDistricts, getUrbanVillage, insertCorrespondent } from "./data";
import { endMessage, textHandling } from "../util/notification";
import { AnswerData } from "answerData";
import "dotenv/config";

export async function bot(client: Client, message: WAWebJS.Message): Promise<void> {
    const chatId: string = message.from;
    let temp = await cache(chatId),
        data,
        questionData = await getQuestionCache(temp.projectId?.toString()),
        text: any,
        answer: AnswerData = null;

    switch (message.type.toString()) {
        case "chat":
            text = message.body;

            if (text.match(/^clear cache$/i)) {
                await sendMultipleMessage(client, chatId, endMessage("Cache dibersihkan"));
                redis.flushdb();
                return;
            }

            if (text.match(/^batal$/i)) {
                await sendMultipleMessage(client, chatId, endMessage("Sesi telah dibatalkan"));
                redis.del(chatId);
                return;
            }

            break;

        case "buttons_response":
            text = {
                id: message.selectedButtonId,
                title: message.body
            };

            break;

        case "list_response":
            text = {
                id: message.selectedRowId,
                title: message.body
            };

            break;

        case "location":
            text = `${message.location.latitude};${message.location.longitude}`;

            break;

        default:
            await sendMultipleMessage(client, chatId, endMessage("Jenis pesan tidak didukung"));
            return;
    }

    if (temp.level == 1) {
        let chatQuestionTrigger: any;

        if (typeof text == "string") {
            chatQuestionTrigger = (await getProject()).find((obj: { hastag: string; }) => obj.hastag == text.replace(/ .*/g, ""));
        }

        if (!chatQuestionTrigger) {
            await sendMultipleMessage(client, chatId, endMessage(`${typeof text == "object" ? text.title : text} tidak ditemukan`));
            return;
        }

        temp.projectId = chatQuestionTrigger.project_id;
        questionData = await getQuestionCache(temp.projectId.toString(), await getChatQuestion((temp.projectId.toString() ?? "").toString()));
        temp.level = 2;
        temp = await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
    }

    if (temp.level == 2) {
        data = questionData[temp.step];

        if (!data) {
            return;
        }

        if (temp.answer) {
            if (temp.previousData.length) {
                const previousData = temp.previousData[temp.previousData.length - 1];
                const messageType = message.type.toString();

                switch (previousData.question_type) {
                    case "choice":
                        const questionChoice: any[] = previousData.question_choice;
                        const idOptions = questionChoice.map((_value, index) => (index + 1).toString());
                        const titleOptions: string[] = questionChoice.map(value => value);

                        if (!["buttons_response", "list_response"].includes(messageType) || !idOptions.includes(text.id) || !titleOptions.includes(text.title)) {
                            temp.step = searchIndex(questionData, previousData.question_id);

                            await textHandling(client, chatId);
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                            return;
                        }

                        break;

                    case "open text":
                        if (messageType != "chat") {
                            temp.step = searchIndex(questionData, previousData.question_id);

                            await textHandling(client, chatId);
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                            return;
                        }

                        break;

                    case "location":
                        if (messageType != "location") {
                            temp.step = searchIndex(questionData, previousData.question_id);
    
                            await textHandling(client, chatId);
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                            return;
                        }
    
                        break;
                }

                if (previousData.question_execution) {
                    const questionExecutionPrevious: string[] = JSON.parse(previousData.question_execution);

                    if (questionExecutionPrevious.includes("insert name")) {
                        temp.name = text;
                    }

                    if (questionExecutionPrevious.includes("insert gender")) {
                        temp.gender = text.title;
                    }

                    if (questionExecutionPrevious.includes("insert date of birth")) {
                        temp.dateOfBirth = text;
                    }

                    if (questionExecutionPrevious.includes("insert postal code")) {
                        temp.postalCodeId = typeof text == "object" ? text.title : text;
                    }

                    if (questionExecutionPrevious.includes("insert province")) {
                        temp.province = typeof text == "object" ? text.title : text;
                    }

                    if (questionExecutionPrevious.includes("insert districts")) {
                        temp.districts = typeof text == "object" ? text.title : text;
                    }

                    if (questionExecutionPrevious.includes("insert city")) {
                        temp.city = typeof text == "object" ? text.title : text;
                    }

                    if (questionExecutionPrevious.includes("insert urban village")) {
                        temp.urbanVillage = typeof text == "object" ? text.title : text;
                    }

                    if (questionExecutionPrevious.includes("insert email")) {
                        temp.email = text;
                    }

                    if (questionExecutionPrevious.includes("insert address")) {
                        temp.address = text;
                    }

                    if (questionExecutionPrevious.includes("insert correspondent")) {
                        insertCorrespondent(temp, chatId.split("@")[0]).catch(error => {
                            throw new Error(error);
                        });
                    }

                    if (questionExecutionPrevious.includes("insert postal code id from urban village")) {
                        const postalCodeData = await getPostalCode("", temp.urbanVillage).catch(error => {
                            throw new Error(error);
                        });

                        if (!postalCodeData.length) {
                            temp.step = searchIndex(questionData, previousData.question_id);

                            await sendMessage(client, chatId, "Data kode pos tidak ditemukan");
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                            return;
                        }

                        temp.postalCodeId = postalCodeData[0].postal_code_id;
                    }

                    if (questionExecutionPrevious.includes("search province")) {
                        const provinceData = await getProvince(temp.province).catch(error => {
                            throw new Error(error);
                        });

                        if (!provinceData.length) {
                            temp.step = searchIndex(questionData, previousData.question_id);

                            await sendMessage(client, chatId, "Provinsi tidak ditemukan");
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                            return;
                        }

                        temp.provinceData = provinceData;
                    }

                    if (questionExecutionPrevious.includes("search city")) {
                        const cityData = await getCity(temp.city, temp.province).catch(error => {
                            throw new Error(error);
                        });

                        if (!cityData.length) {
                            temp.step = searchIndex(questionData, previousData.question_id);

                            await sendMessage(client, chatId, "Kota tidak ditemukan");
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                            return;
                        }

                        temp.cityData = cityData;
                    }

                    if (questionExecutionPrevious.includes("search districts")) {
                        const districtsData = await getDistricts(temp.districts, temp.city).catch(error => {
                            throw new Error(error);
                        });

                        if (!districtsData.length) {
                            temp.step = searchIndex(questionData, previousData.question_id);

                            await sendMessage(client, chatId, "Kecamatan tidak ditemukan");
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                            return;
                        }

                        temp.districtsData = districtsData;
                    }

                    if (questionExecutionPrevious.includes("search urban village")) {
                        const urbanVillageData = await getUrbanVillage(temp.urbanVillage, temp.districts).catch(error => {
                            throw new Error(error);
                        });

                        if (!urbanVillageData.length) {
                            temp.step = searchIndex(questionData, previousData.question_id);

                            await sendMessage(client, chatId, "Kelurahan tidak ditemukan");
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                            return;
                        }

                        temp.urbanVillageData = urbanVillageData;
                    }
                }

                const questionRedirect = questionData[temp.step].question_redirect;

                if (questionRedirect) {
                    const choose: number[] = JSON.parse(questionRedirect);

                    if (choose.length > 1) {
                        temp.step = choose[text.id - 1];
                    } else {
                        temp.step = choose[0];
                    }

                    temp.step -= 1;

                    await insertAnswer(chatId, answerData(data.question_id, text), temp).catch(error => {
                        throw new Error(error);
                    });
                }

                data = questionData[temp.step];

                if (!data) {
                    return;
                }

                answer = answerData(data.question_id, text);
            }
        }

        data = questionData[temp.step];

        if (!data) {
            return;
        }

        let choose: number[];
        data.question = await getQuestionData(data, temp);

        if (data.question_redirect) {
            choose = JSON.parse(data.question_redirect);
        }

        switch (data.question_choice) {
            case "province":
                data.question_choice = temp.provinceData.map((value: any) => value.province);

                break;

            case "city":
                data.question_choice = temp.cityData.map((value: any) => value.city);

                break;

            case "districts":
                data.question_choice = temp.districtsData.map((value: any) => value.districts);

                break;

            case "urban village":
                data.question_choice = temp.urbanVillageData.map((value: any) => value.urban_village);

                break;
        }

        switch (data.question_type) {
            case "choice":
                const questionChoice: string[] = typeof data.question_choice == "string" ? JSON.parse(data.question_choice) : data.question_choice;

                if (questionChoice.length > 3) {
                    await sendListMessage(client, chatId, data.question, questionChoice);
                } else {
                    await sendButtonMessage(client, chatId, data.question, questionChoice);
                }

                break;

            case "open text":
                await sendMessage(client, chatId, data.question);
                break;

            case "text":
                await sendMessage(client, chatId, data.question);

                if (!choose) {
                    await sendMessage(client, chatId, endMessage()[0]);
                    redis.del(chatId);
                    return;
                }

                temp.step = choose[0] - 1;
                temp.previousData = data;

                temp.previousData.push(data);
                await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
                return;

            case "location":
                await sendMessage(client, chatId, data.question);
                break;
        }

        temp.previousData.push(data);

        temp.answer = true;
    }

    await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.previousData, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode, temp.provinceData, temp.cityData, temp.districtsData, temp.urbanVillageData);
}

function answerData(questionId: number, answer: any): AnswerData {
    if (answer.title) {
        answer = answer.title;
    }

    return {
        questionId: questionId,
        answer: answer
    };
}