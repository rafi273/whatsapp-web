/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import cache from "./cache";
import redis from "../config/redis";
import axios, { Method, AxiosRequestConfig } from "axios";
import { AnswerData } from "answerData";
import { Temp } from "temp";
import "dotenv/config";

export function getProperty(): AxiosRequestConfig {
    return {
        headers: {
            "X-Lsn-Signature": "YXVsaWFpbm92YXNpQGxzbjEyMw=="
        }
    };
}

export async function getQuestionCache(key: string, data?: any): Promise<any[]> {
    if (data) {
        await redis.set(key, JSON.stringify(data));
    }

    data = await redis.get(key);

    return JSON.parse(data === undefined ? "" : data);
}

export async function getPostalCode(postalCode = "", urbanVillage = "", districts = "", city = "", province = ""): Promise<any[]> {
    return (await axios.get(
        `${process.env.API_HOST}/postalCode?postal_code=${postalCode}&urban_village=${urbanVillage}&districts=${districts}&city=${city}&province=${province}`,
        getProperty()
    )).data.data;
}

export async function getPostalCodeWithId(postalCodeId: number) {
    return (await axios.get(
        `${process.env.API_HOST}/postalCode/${postalCodeId}`,
        getProperty()
    )).data.data;
}

export async function getQuestionData(data: any, waId: string, temp: Temp): Promise<string> {
    if (data.question.match(/--urban_village--/)) {
        data.question = data.question.replace(/--urban_village--/, temp.urbanVillage ?? "-");
    }

    if (data.question.match(/--districts--/)) {
        data.question = data.question.replace(/--districts--/, temp.districts ?? "-");
    }

    if (data.question.match(/--city--/)) {
        data.question = data.question.replace(/--city--/, temp.city ?? "-");
    }

    if (data.question.match(/--province--/)) {
        data.question = data.question.replace(/--province--/, temp.province, temp.districts ?? "-");
    }

    data.question = data.question.replace(/--name--/g, temp.name ?? "-");
    data.question = data.question.replace(/--gender--/g, temp.gender ?? "-");
    data.question = data.question.replace(/--date_of_birth--/g, temp.dateOfBirth ?? "-");

    return data.question;
}


export async function getProject(): Promise<any[]> {
    return (await axios.get(
        `${process.env.API_HOST}/project?status=active`,
        getProperty()
    )).data.data;
}

export async function getChatQuestion(projectId: string): Promise<any[]> {
    return (await axios.get(
        `${process.env.API_HOST}/v2/collection/chat/project/project_id=${projectId}&status=active`,
        getProperty()
    )).data.data;
}

export async function insertAnswer(mobileNumber: string, answerData: AnswerData, temp: Temp) {
    let answerDetailData: any = [],
        method = "put",
        extend = "";

    if (!temp.answerDetailId) {
        answerDetailData = {
            mobile_number: mobileNumber,
            project_id: temp.projectId
        };
        method = "post";
    } else {
        answerDetailData = (await axios.get(
            `${process.env.API_HOST}/answerDetail/${temp.answerDetailId}`,
            getProperty()
        )).data.data;
        extend = `/${answerDetailData.answer_detail_id}`;
    }

    const property = getProperty();
    const answerDetailUpload = await axios({
        method: method as Method,
        url: `${process.env.API_HOST}/answerDetail${extend}`,
        data: answerDetailData,
        headers: property.headers
    });

    if (!answerData) {
        return answerDetailUpload;
    }

    if (method == "post") {
        temp.answerDetailId = answerDetailUpload.data.data.id;

        await cache(mobileNumber, true, temp.level, temp.step, temp.answer, null, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
    }

    return await axios.post(
        `${process.env.API_HOST}/answer`,
        {
            question_id: answerData.questionId,
            answer: answerData.answer,
            answer_detail_id: temp.answerDetailId
        },
        getProperty()
    );
}

export async function insertCorrespondent(temp: Temp, mobileNumber: string) {
    const userData: any[] = (await axios.get(
        `${process.env.API_HOST}/user?mobile=${mobileNumber}`,
        getProperty()
    )).data.data;

    if (userData.length) {
        temp.userId = userData[0].user_id;
    } else {
        const userPost = (await axios.post(
            `${process.env.API_HOST}/user`,
            {
                name: temp.name,
                email: temp.email,
                mobile: mobileNumber,
                date_of_birth: moment(temp.dateOfBirth, "DD-MM-YYYY").format(),
                gender: temp.gender,
                address: temp.address,
                postal_code_id: temp.postalCodeId
            },
            getProperty()
        )).data;
        temp.userId = userPost.data.id;
    }

    await cache(mobileNumber, true, temp.level, temp.step, temp.answer, null, temp.dataPrevious, temp.dateOfBirth, temp.name, temp.postalCodeId, temp.gender, temp.answerDetailId, temp.projectId, temp.email, temp.city, temp.urbanVillage, temp.province, temp.districts, temp.address, temp.userId, temp.messageId, temp.postalCode);
}

export function searchIndex(question: any[], questionId: number) {
    return question.findIndex((obj: { question_id: number; }) => obj.question_id == questionId);
}
