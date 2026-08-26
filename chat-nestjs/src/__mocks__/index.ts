import { User } from '../utils/typeorm';

export const mockUser = {
  id: 4444000455,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'Test User',
  password: 'djiasdhjdgdhjasd',
  messages: [],
  groups: [],
} as User;

/**
 * Repository giả vừa đủ để Nest resolve được token khi dựng TestingModule.
 * Hành vi thật thì từng test tự stub bằng mockResolvedValue.
 */
export const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});
