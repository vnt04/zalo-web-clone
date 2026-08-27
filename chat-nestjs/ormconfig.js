/*
 * Chỉ TypeORM CLI đọc file này (migration:generate / migration:run). Cấu hình
 * runtime của ứng dụng nằm ở src/app.module.ts — sửa kết nối ở một bên thì
 * phải sửa bên kia, không có nguồn chung.
 */
const path = require('path');

const envFile =
  process.env.ENVIRONMENT === 'PRODUCTION'
    ? '.env.production'
    : '.env.development';

// dotenv không ghi đè biến đã có trong process env, nên chạy trong docker thì
// giá trị từ docker-compose thắng và file .env vắng mặt cũng không sao.
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

module.exports = {
  type: 'mysql',
  host: process.env.MYSQL_DB_HOST,
  port: parseInt(process.env.MYSQL_DB_PORT, 10),
  username: process.env.MYSQL_DB_USERNAME,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
  // Glob chứ không phải mảng entities như app.module: CLI chạy qua ts-node,
  // không đi qua hệ thống module của Nest. Thư mục entities chỉ chứa entity,
  // index.ts nằm một cấp trên nên glob này khớp đúng tập đó.
  entities: ['src/utils/typeorm/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  cli: { migrationsDir: 'src/migrations' },
};
