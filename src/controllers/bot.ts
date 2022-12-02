/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendMessage, sendMultipleMessage, sendButtonMessage, sendListMessage } from "../models/message";
import { getQuestionCache, searchIndex, insertAnswer, getQuestionData, getProject, getChatQuestion } from "../models/data";
import { endMessage, textHandling } from "../utils/notification";
import { AnswerData } from "answerData";
import { AxiosError } from "axios";
import cache from "../models/cache";
import redis from "../config/redis";
import WAWebJS from "whatsapp-web.js";
import "dotenv/config";

export async function bot(message: WAWebJS.Message, step: boolean = false): Promise<void> {
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
                sendMultipleMessage(message, chatId, endMessage("Cache dibersihkan"));
                redis.flushdb();
                return;
            }

            if (text.match(/^batal$/i)) {
                sendMultipleMessage(message, chatId, endMessage("Sesi telah dibatalkan"));
                redis.del(chatId);
                return;
            }

            break;

        // case "interactive":
        //     switch (message.interactive.type) {
        //         case "button_reply":
        //             text = message.interactive.button_reply;

        //             break;

        //         case "list_reply":
        //             text = message.interactive.list_reply;

        //             break;
        //     }

        //     break;

        default:
            sendMultipleMessage(message, chatId, endMessage("Jenis pesan tidak didukung"));
            return;
    }

    if (temp.level == 1) {
        let chatQuestionTrigger: any;

        if (typeof text == "string") {
            chatQuestionTrigger = (await getProject()).find((obj: { hastag: string; }) => obj.hastag == text.replace(/ .*/g, ""));
        }

        if (!chatQuestionTrigger) {
            sendMultipleMessage(message, chatId, endMessage(`${typeof text == "object" ? text.title : text} tidak ditemukan`));
            return;
        }

        temp.projectId = chatQuestionTrigger.project_id;
        questionData = await getQuestionCache(temp.projectId.toString(), await getChatQuestion((temp.projectId.toString() ?? "").toString()));
        temp.level = 2;
        temp = await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
    }

    if (temp.level == 2) {
        data = questionData[temp.step];

        if (!data) {
            return;
        }

        if (temp.answer) {
            if (temp.dataPrevious.length) {
                const dataPrevious = temp.dataPrevious[temp.dataPrevious.length - 1];

                switch (dataPrevious.question_type) {
                    case "choice":
                        // const multipleChoiceOptions : string[] = dataPrevious.question_choice;

                        // if (!ctx.text || !multipleChoiceOptions.includes(text)) {
                        //     temp.step = searchIndex(questionData, dataPrevious.question_id);

                        //     textHandling(message);
                        //     await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                        //     return;
                        // }

                        break;

                    case "open text":
                        if (message.type.toString() != "chat") {
                            temp.step = searchIndex(questionData, dataPrevious.question_id);

                            textHandling(message, chatId);
                            await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                            return;
                        }

                        break;
                }

                if (dataPrevious.question_execution) {
                    const questionExecutionPrevious: string[] = JSON.parse(dataPrevious.question_execution);

                    if (questionExecutionPrevious.includes("insert gender")) {
                        temp.gender = text.title;
                    }

                    if (questionExecutionPrevious.includes("insert name")) {
                        temp.name = text.toUpperCase();
                    }

                    if (questionExecutionPrevious.includes("insert gender")) {
                        temp.gender = text.title;
                    }

                    if (questionExecutionPrevious.includes("insert age")) {
                        temp.dateOfBirth = text;
                    }

                    if (questionExecutionPrevious.includes("insert postal code")) {
                        temp.postalCodeId = text;
                    }

                    if (questionExecutionPrevious.includes("insert province")) {
                        temp.province = text;
                    }

                    if (questionExecutionPrevious.includes("insert districts")) {
                        temp.districts = text;
                    }

                    if (questionExecutionPrevious.includes("insert city")) {
                        temp.city = text;
                    }

                    if (questionExecutionPrevious.includes("insert urban village")) {
                        temp.urbanVillage = text;
                    }

                    if (questionExecutionPrevious.includes("insert email")) {
                        temp.email = text;
                    }

                    if (questionExecutionPrevious.includes("insert address")) {
                        temp.address = text;
                    }
                }

                const questionRedirect = questionData[temp.step].question_redirect;

                if (questionRedirect && !step) {
                    const choose: number[] = JSON.parse(questionRedirect);

                    if (choose.length > 1) {
                        temp.step = choose[text.id - 1];
                    } else {
                        temp.step = choose[0];
                    }

                    temp.step -= 1;

                    await insertAnswer(chatId, answerData(data.question_id, text), temp).catch((error: AxiosError) => {
                        throw new Error(JSON.stringify(error.toJSON()));
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
        data.question = await getQuestionData(data, chatId, temp);

        if (data.question_redirect) {
            choose = JSON.parse(data.question_redirect);
        }

        // if (data.question_execution) {
        //     const questionExecution: string[] = JSON.parse(data.question_execution);
        // }

        switch (data.question_type) {
            case "choice":
                const questionChoice: string[] = data.question_choice;

                if (questionChoice.length > 2) {
                    sendListMessage(chatId, data.question, data.question_choice);
                } else {
                    sendButtonMessage(chatId, data.question, data.question_choice);
                }

                break;

            case "open text":
                // if (data.question.match(/--(.*)--/)) {
                //     const caption = data.question.replace(/--.*--/, "");
                //     const link = data.question.match(/--(.*)--/)[1];

                //     sendImageMessage(chatId, caption, link);
                // } else {
                //     sendMessage(chatId, data.question);
                // }
                
                sendMessage(message, chatId, data.question);
                break;

            case "text":
                sendMessage(message, chatId, data.question);

                if (!choose) {
                    sendMessage(message, chatId, endMessage()[0]);
                    redis.del(chatId);
                    return;
                }

                temp.step = choose[0] - 1;
                temp.dataPrevious = data;

                temp.dataPrevious.push(data);
                await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                return;
        }

        temp.dataPrevious.push(data);

        temp.answer = true;
    }

    await cache(chatId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
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