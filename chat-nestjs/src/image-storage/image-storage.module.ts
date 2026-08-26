import { Module } from '@nestjs/common';
import { Services } from '../utils/constants';
import { v2 as cloudinary } from 'cloudinary';
import { ImageStorageService } from './image-storage.service';

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
  ],
  exports: [Services.CLOUDINARY_CLIENT, Services.IMAGE_UPLOAD_SERVICE],
})
export class ImageStorageModule {}
