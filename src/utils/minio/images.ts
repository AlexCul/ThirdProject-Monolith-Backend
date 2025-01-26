import { Client } from "minio";
import crypto from "crypto";

export const createMinIOClient = (
    endpoint: string, port: number,
    accessKey: string, secretKey: string,
    useSSL = false,
) => {
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

export const uploadBase64Image = async (
    client: Client, bucketName: string,
    base64Image: string, objectName?: string,
) => {
    const buffer = Buffer.from(base64Image, "base64");
    const uniqueObjectName = objectName || `image-${crypto.randomUUID()}`;
    await client.putObject(bucketName, uniqueObjectName, buffer);

    return uniqueObjectName;
};

export const uploadImageToNewBucket = async (
    client: Client, base64Image: string,
) => {
    const bucketName = generateUniqueBucketName();
    await createBucket(client, bucketName);

    const objectName = await uploadBase64Image(
        client, bucketName, base64Image,
    );

    return { bucketName, objectName };
};

