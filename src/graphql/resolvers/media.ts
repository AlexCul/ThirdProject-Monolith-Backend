// Я клянусь, я перебровал все способы настроить 
// TypeScript, чтобы работал абсолютный путь,
// уже просто на клавиатуре танцевал,
// настраивая outDir, rootDir, rootDirs,
// baseUrl, paths, но ничего не помогло.
// Сегодня 25 января, у меня осталось 2 дня до сдачи
// проекта, а я пишу бэкенд. Надо торопиться.
// Так что я просто тут относительный путь пропишу,
// но упомяну, что можно настроить TypeScript на 
// абсолютные пути (это просто я дурак, что не смог)
import {
    createMinIOClient, uploadBase64Media
} from "../../utils/minio/helper";

const client = createMinIOClient({});

const mediaResolver = {
    Query: {
        media: async (_: any, {
            objectName,
        }: {
            objectName: string,
        }) => {
            try {
                const stream = await client.getObject(
                    "media", objectName,
                );
                const chunks: Buffer[] = [];

                return new Promise((resolve, reject) => {
                    stream.on("data", (chunk) => chunks.push(chunk));
                    stream.on("end", () => {
                        const base64 = Buffer
                            .concat(chunks)
                            .toString("base64");
                        resolve(`data:image/png;base64,${base64}`);
                    });
                    stream.on("error", (error) => reject(error));
                });
            } catch (error) {
                throw new Error(
                    `Getting media error: ${(error as Error).message}`,
                );
            }
        },
    },

    Mutation: {
        createMedia: async (_: any, {
            base64,
        }: { base64: string }) => {
            try {
                const result = await uploadBase64Media(
                    client, base64,
                );

                return base64;
            } catch (error) {
                throw new Error(
                    `Creating image error: ${(error as Error).message}`,
                );
            }
        },
        deleteMedia: async (_: any, {
            objectName
        }: {
            objectName: string,
        }) => {
            try {
                await client.removeObject("media", objectName);
                
                return true;
            } catch (error) {
                return false;
            }
        },
    },
};

export default mediaResolver;
