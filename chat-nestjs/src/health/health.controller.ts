import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Routes } from '../utils/constants';

// Cố ý KHÔNG có AuthenticatedGuard, khác mọi controller còn lại: healthcheck
// của orchestrator chạy trước khi có phiên đăng nhập nào. Đừng "sửa" chỗ này.
// Vì thế endpoint chỉ trả trạng thái, không kèm phiên bản hay thông tin hạ tầng.
@SkipThrottle()
@Controller(Routes.HEALTH)
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async check() {
    try {
      await this.connection.query('SELECT 1');
    } catch (err) {
      // Chi tiết chỉ vào log phía server: thông điệp của driver MySQL lộ host,
      // user và tên database.
      this.logger.error('Healthcheck failed: database unreachable', err);
      throw new ServiceUnavailableException('database unreachable');
    }
    return { status: 'ok' };
  }
}
