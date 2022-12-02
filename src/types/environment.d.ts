declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: string;
            PORT: string;
            REDIS_PORT: string;
            API_HOST: string;
            REDIS_HOST: string;
            KEY: string;
        }
    }
}

export {};
