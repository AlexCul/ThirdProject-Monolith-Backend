import { Client } from "minio";
import crypto from "crypto";

import dotenv from "dotenv";
dotenv.config();

export const createMinIOClient = ({
    endpoint = "localhost",
    port = 9000,
    accessKey = process.env.MINIO_ACCESS_KEY || "",
    secretKey = process.env.MINIO_SECRET_KEY || "",
    useSSL = false,
}: {
    endpoint?: string, port?: number,
    accessKey?: string, secretKey?: string,
    useSSL?: boolean,
}) => {
    console.log("подключились к минио");
    return new Client({
        endPoint: endpoint,
        port: port,
        accessKey: accessKey,
        secretKey: secretKey,
        useSSL: useSSL
    });
};

export const generateUniqueBucketName = () => {
    return `bucket-${crypto.randomUUID()}`;
};

export const createBucket = async (
    client: Client, bucketName: string,
) => {
    const exists = await client.bucketExists(bucketName);
    if (!exists) {
        await client.makeBucket(bucketName, "");
    }

    return bucketName;
};

export const uploadBase64Media = async (
    client: Client, bucketName: string,
    base64Media: string, objectName?: string,
) => {
    const buffer = Buffer.from(base64Media, "base64");
    const uniqueObjectName = objectName || `media-${crypto.randomUUID()}`;
    await client.putObject(bucketName, uniqueObjectName, buffer);

    return uniqueObjectName;
};

export const uploadMediaToNewBucket = async (
    client: Client, base64Media: string,
) => {
    const bucketName = generateUniqueBucketName();
    await createBucket(client, bucketName);

    const objectName = await uploadBase64Media(
        client, bucketName, base64Media,
    );

    return { bucketName, objectName };
};

