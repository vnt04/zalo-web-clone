import { Module } from '@nestjs/common';
import { Services } from '../utils/constants';
import { v2 as cloudinary } from 'cloudinary';
import { ImageStorageService } from './image-storage.service';
import { S3 } from '@aws-sdk/client-s3';

@Module({
  providers: [
    {
      provide: Services.CLOUDINARY_CLIENT,
      useFactory: () => {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        return cloudinary;
      },
    },
    {
      provide: Services.IMAGE_UPLOAD_SERVICE,
      useClass: ImageStorageService,
    },
    {
      provide: Services.SPACES_CLIENT,
      useValue: new S3({
        credentials: {
          accessKeyId: process.env.SPACES_KEY,
          secretAccessKey: process.env.SPACES_SECRET_KEY,
        },
        endpoint: 'https://ams3.digitaloceanspaces.com',
        region: 'ams3',
      }),
    },
  ],
  exports: [
    Services.CLOUDINARY_CLIENT,
    Services.IMAGE_UPLOAD_SERVICE,
    {
      provide: Services.SPACES_CLIENT,
      useValue: new S3({
        credentials: {
          accessKeyId: process.env.SPACES_KEY,
          secretAccessKey: process.env.SPACES_SECRET_KEY,
        },
        endpoint: 'https://ams3.digitaloceanspaces.com',
        region: 'ams3',
      }),
    },
  ],
  // exports: [
  //   {
  //     provide: Services.SPACES_CLIENT,
  //     useValue: new S3({
  //       credentials: {
  //         accessKeyId: process.env.SPACES_KEY,
  //         secretAccessKey: process.env.SPACES_SECRET_KEY,
  //       },
  //       endpoint: 'https://ams3.digitaloceanspaces.com',
  //       region: 'ams3',
  //     }),
  //   },
  //   {
  //     provide: Services.IMAGE_UPLOAD_SERVICE,
  //     useClass: ImageStorageService,
  //   },
  // ],
})
export class ImageStorageModule {}
