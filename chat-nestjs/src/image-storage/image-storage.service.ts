import { Inject, Injectable } from '@nestjs/common';
import { Services } from '../utils/constants';
import { IImageStorageService } from './image-storage';
import {
  UploadGroupMessageAttachmentParams,
  UploadImageParams,
  UploadMessageAttachmentParams,
} from '../utils/types';
import { GroupMessageAttachment } from '../utils/typeorm';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ImageStorageService implements IImageStorageService {
  constructor(
    @Inject(Services.CLOUDINARY_CLIENT)
    private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  upload(params: UploadImageParams): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder: 'upload',
          public_id: params.key,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result.secure_url);
        },
      );

      stream.end(params.file.buffer);
    });
  }

  async uploadMessageAttachment(params: UploadMessageAttachmentParams) {
    params.messageAttachment.url = await this.upload({
      key: params.messageAttachment.key,
      file: params.file,
    });
    return params.messageAttachment;
  }

  async uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams,
  ): Promise<GroupMessageAttachment> {
    params.messageAttachment.url = await this.upload({
      key: params.messageAttachment.key,
      file: params.file,
    });
    return params.messageAttachment;
  }
}
