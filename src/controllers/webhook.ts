/* eslint-disable @typescript-eslint/no-explicit-any */
import cache from "../models/cache";
import redis from "../config/redis";
import { sendMessage, sendMultipleMessage, sendButtonMessage, sendListMessage } from "../models/message";
import { getQuestionCache, searchIndex, insertAnswer, getQuestionData, getProject, getChatQuestion } from "../models/data";
import { endMessage } from "../utils/notification";
import { AnswerData } from "answerData";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import "dotenv/config";

export default (req: Request, res: Response) => {
    const body = req.body;

    if (body.contacts && body.messages) {
        bot(body, false);
        return res.sendStatus(200);
    }

    return res.sendStatus(400);
};

async function bot(param: any, step: boolean = false): Promise<void> {
    const message = param.messages[0],
        waId: string = param.contacts[0].wa_id;
    let temp = await cache(waId),
        data,
        questionData = await getQuestionCache(temp.projectId.toString()),
        text: any,
        answer: AnswerData = null;

    switch (message.type) {
        case "text":
            text = message.text.body;

            if (text.match(/^clear cache$/i)) {
                sendMultipleMessage(waId, endMessage("Cache dibersihkan"));
                redis.flushdb();
                return;
            }

            if (text.toLowerCase() == "batal") {
                sendMultipleMessage(waId, endMessage("Sesi telah dibatalkan"));
                redis.del(waId);
                return;
            }

            break;

        case "interactive":
            switch (message.interactive.type) {
                case "button_reply":
                    text = message.interactive.button_reply;

                    break;

                case "list_reply":
                    text = message.interactive.list_reply;

                    break;
            }

            break;

        case "location":
            text = `${message.location.latitude};${message.location.longitude}`;

            break;

        default:
            sendMultipleMessage(waId, endMessage("Jenis pesan tidak didukung"));
            return;
    }

    if (temp.level == 1) {
        let chatQuestionTrigger: any;

        if (typeof text == "string") {
            chatQuestionTrigger = (await getProject()).find((obj: { question_trigger: string; }) => obj.question_trigger == text.replace(/ .*/g, ""));
        }

        if (!chatQuestionTrigger) {
            const output = endMessage("Untuk registrasi, keluhan, dan pertanyaan seputar kartini kirim *#KARTINI*");

            output.unshift(`${typeof text == "object" ? text.title : text} tidak ditemukan`);
            sendMultipleMessage(waId, output);
            return;
        }

        temp.projectId = chatQuestionTrigger.chat_question_trigger_id;
        questionData = await getQuestionCache(temp.projectId.toString(), await getChatQuestion((temp.projectId.toString() ?? "").toString()));
        temp.level = 2;
        temp = await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
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
                    case "two choice":
                        if (message.type != "interactive") {
                            temp.step = searchIndex(questionData, dataPrevious.question_id);

                            // await textHandling(waId);
                            await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                            return bot(param, true);
                        }

                        if (temp.messageId.includes(message.context.id)) {
                            temp.step = searchIndex(questionData, dataPrevious.question_id);

                            // await textHandling(waId);
                            await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                            return bot(param, true);
                        }

                        temp.messageId.push(message.context.id);
                        break;

                    case "multiple choice":
                        if (message.type != "interactive") {
                            temp.step = searchIndex(questionData, dataPrevious.question_id);

                            // await textHandling(waId);
                            await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                            return bot(param, true);
                        }

                        if (temp.messageId.includes(message.context.id)) {
                            temp.step = searchIndex(questionData, dataPrevious.question_id);

                            // await textHandling(waId);
                            await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                            return bot(param, true);
                        }

                        temp.messageId.push(message.context.id);
                        break;

                    case "open text":
                        if (message.type != "text") {
                            temp.step = searchIndex(questionData, dataPrevious.question_id);

                            // await textHandling(waId);
                            await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                            return bot(param, true);
                        }

                        break;

                    case "insert image":
                        if (message.type != "image") {
                            temp.step = searchIndex(questionData, dataPrevious.question_id);

                            // await textHandling(waId);
                            await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                            return bot(param, true);
                        }

                        break;

                    case "location":
                        if (message.type != "location") {
                            temp.step = searchIndex(questionData, dataPrevious.question_id);

                            // await textHandling(waId);
                            await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                            return bot(param, true);
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

                    await insertAnswer(waId, answerData(data.question_id, text), temp).catch((error: AxiosError) => {
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
        data.question = await getQuestionData(data, waId, temp);

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
                    sendListMessage(waId, data.question, data.question_choice);
                } else {
                    sendButtonMessage(waId, data.question, data.question_choice);
                }

                break;

            case "open text":
                // if (data.question.match(/--(.*)--/)) {
                //     const caption = data.question.replace(/--.*--/, "");
                //     const link = data.question.match(/--(.*)--/)[1];

                //     sendImageMessage(waId, caption, link);
                // } else {
                //     sendMessage(waId, data.question);
                // }
                
                sendMessage(waId, data.question);
                break;

            case "text":
                await sendMessage(waId, data.question);

                if (!choose) {
                    endQuestion(waId);
                    redis.del(waId);
                    return;
                }

                temp.step = choose[0] - 1;
                temp.dataPrevious = data;

                await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
                return bot(param, true);
        }

        temp.dataPrevious = data;
        temp.answer = true;
    }

    await cache(waId, true, temp.level, temp.step, temp.answer, answer, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
}

async function endQuestion(waId: string) {
    await sendMessage(waId, endMessage()[0]);
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