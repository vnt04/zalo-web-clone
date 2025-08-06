import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Services } from '../utils/constants';
import { IImageStorageService } from './image-storage';
import { S3 } from '@aws-sdk/client-s3';
import {
  UploadGroupMessageAttachmentParams,
  UploadImageParams,
  UploadMessageAttachmentParams,
} from '../utils/types';
import { compressImage } from '../utils/helpers';
import { GroupMessageAttachment } from '../utils/typeorm';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ImageStorageService implements IImageStorageService {
  constructor(
    @Inject(Services.SPACES_CLIENT)
    private readonly spacesClient: S3,
    @Inject(Services.CLOUDINARY_CLIENT)
    private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  upload(params: UploadImageParams) {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder: 'upload',
          public_id: params.key,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          console.log('url:', result.secure_url);
          return resolve(result.secure_url);
        },
      );

      stream.end(params.file.buffer);
    });
  }

  async uploadMessageAttachment(params: UploadMessageAttachmentParams) {
    this.spacesClient.putObject({
      Bucket: 'chuachat',
      Key: `original/${params.messageAttachment.key}`,
      Body: params.file.buffer,
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
    await this.spacesClient.putObject({
      Bucket: 'chuachat',
      Key: `preview/${params.messageAttachment.key}`,
      Body: await compressImage(params.file),
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
    return params.messageAttachment;
  }

  async uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams,
  ): Promise<GroupMessageAttachment> {
    this.spacesClient.putObject({
      Bucket: 'chuachat',
      Key: `original/${params.messageAttachment.key}`,
      Body: params.file.buffer,
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
    await this.spacesClient.putObject({
      Bucket: 'chuachat',
      Key: `preview/${params.messageAttachment.key}`,
      Body: await compressImage(params.file),
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
    return params.messageAttachment;
  }
}
