import { Injectable } from '@nestjs/common';
import { uuid } from 'uuidv4';
import { S3 } from 'aws-sdk';
import { Response } from 'express';

@Injectable()
export class UploadService {
    private readonly s3 = new S3({
        region: process.env.AWS_BUCKET_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    async upload(files: Array<Express.Multer.File>): Promise<{ filePath: string[] }> {
        const result = files.map((file) => {
            const fileExt = file?.mimetype?.split("/")[1];
            const newFileName = `${uuid()}.${fileExt}`;

            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: newFileName,
                Body: file?.buffer
            }

            return new Promise((resolve, reject) => {
                this.s3.upload(uploadParams, (err: Error, data: S3.ManagedUpload.SendData) => {
                    if (!err) {
                        resolve(data);
                    }
                    reject(err);
                });
            });
        });

        // wait all files to upload in promise result[]
        try {
            const promiseResult = await Promise.all(result);
            const path = promiseResult.map((awsResult) => awsResult["key"]);
            return {
                filePath: path
            }
        } catch (err) {
            console.log(err);
        }
    }

    async getImage(key: string, res: Response) {
        const dowloadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        }
        const result = this.s3.getObject(dowloadParams).createReadStream();
        return result.pipe(res);
    }

    async deleteImage(key: string): Promise<{ msg: string }> {
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        }
        try {
            await this.s3.deleteObject(deleteParams).promise();
            return {
                msg: "image deleted successfully."
            }
        } catch (err) {
            console.log(err);
        }
    }
}
