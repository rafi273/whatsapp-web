/* eslint-disable @typescript-eslint/no-explicit-any */
import redis from "../config/redis";
import { AnswerData } from "answerData";
import { Temp } from "temp";

export default async function(waId: string, update = false, level?: number, step?: number, answer?: boolean, data?: AnswerData, dataPrevious?: any, dateOfBirth?: string, name?: string, postalCodeId?: number, gender?: string, answerDetailId?: number, projectId?: number, email?: string, city?: string, urbanVillage?: string, province?: string, districts?: string, address?: string, userId?: number, messageId?: string[], postalCode?: number): Promise<Temp> {
    const arr = await redis.get(waId);
    let temp: Temp = {
        level: 1,
        step: 0,
        answer: false,
        data: [],
        dataPrevious: [],
        dateOfBirth: null,
        name: null,
        postalCodeId: null,
        gender: null,
        answerDetailId: null,
        projectId: null,
        email: null,
        city: null,
        urbanVillage: null,
        province: null,
        districts: null,
        address: null,
        userId: null,
        messageId: [],
        postalCode: null
    };

    if (arr) {
        temp = JSON.parse(arr);
    }

    if (level) {
        temp.level = level;
    }

    if (step) {
        temp.step = step;
    }

    if (answer) {
        temp.answer = answer;
    }

    if (data) {
        temp.data.push(data);
    }

    if (dataPrevious) {
        temp.dataPrevious.push(dataPrevious);
    }

    if (dateOfBirth) {
        temp.dateOfBirth = dateOfBirth;
    }

    if (name) {
        temp.name = name;
    }

    if (postalCodeId) {
        temp.postalCodeId = postalCodeId;
    }

    if (gender) {
        temp.gender = gender;
    }

    if (answerDetailId) {
        temp.answerDetailId = answerDetailId;
    }

    if (projectId) {
        temp.projectId = projectId;
    }

    if (email) {
        temp.email = email;
    }

    if (city) {
        temp.city = city;
    }

    if (urbanVillage) {
        temp.urbanVillage = urbanVillage;
    }

    if (province) {
        temp.province = province;
    }

    if (districts) {
        temp.districts = districts;
    }

    if (address) {
        temp.address = address;
    }

    if (userId) {
        temp.userId = userId;
    }

    if (messageId) {
        temp.messageId = messageId;
    }

    if (postalCode) {
        temp.postalCode = postalCode;
    }

    if (update) {
        try {
            await redis.setex(waId, 600, JSON.stringify(temp));
        } catch (error) {
            console.error(error);
        }
    }

    return temp;
}
