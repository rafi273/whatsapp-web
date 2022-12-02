export interface Temp {
    level: number;
    step: number;
    answer: boolean;
    data: any[];
    dataPrevious: any[];
    dateOfBirth: string;
    name: string;
    postalCodeId: number;
    gender: string;
    answerDetailId: number;
    projectId: number;
    email: string;
    city: string;
    urbanVillage: string;
    province: string;
    districts: string;
    address: string;
    userId: number;
    messageId: string[];
    postalCode: number;
}

declare module "Temp";
