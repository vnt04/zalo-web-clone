/**
 * Nạp dữ liệu mẫu để có cái mà nhìn khi làm giao diện.
 *
 *   docker compose exec api yarn seed            # thêm nếu chưa có
 *   docker compose exec api yarn seed --reset    # xoá dữ liệu seed cũ rồi tạo lại
 *
 * Chạy native thì `cd chat-nestjs && yarn seed`, script tự đọc .env.development.
 *
 * Chỉ đụng vào các bản ghi gắn với số điện thoại liệt kê trong seed-data.ts, nên
 * tài khoản bạn tự đăng ký không bị ảnh hưởng.
 */
import { Connection, createConnection } from 'typeorm';
import { hashPassword } from '../utils/helpers';
import { normalizePhone } from '../utils/phone';
import entities, {
  Conversation,
  ConversationState,
  Friend,
  Group,
  GroupMessage,
  Message,
  Profile,
  User,
} from '../utils/typeorm';
import {
  conversations as conversationSeeds,
  groups as groupSeeds,
  people,
  SEED_PASSWORD,
} from './seed-data';

/**
 * Số lưu vào DB phải ở dạng 84xxxxxxxxx như luồng đăng ký thật, nếu không thì
 * đăng nhập (vốn tra theo số đã chuẩn hoá) sẽ không tìm thấy tài khoản.
 */
function storedPhone(raw: string): string {
  const normalized = normalizePhone(raw);
  if (!normalized)
    throw new Error(`Số điện thoại seed không hợp lệ: ${raw}`);
  return normalized;
}

const MINUTE = 60 * 1000;
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * MINUTE);
const asSql = (date: Date) =>
  date.toISOString().slice(0, 19).replace('T', ' ');

/**
 * Trong container thì biến môi trường đã có sẵn; chạy native thì đọc file env
 * giống app.module.ts.
 */
function loadEnv() {
  if (process.env.MYSQL_DB_HOST) return;
  const envFilePath =
    process.env.ENVIRONMENT === 'PRODUCTION'
      ? '.env.production'
      : '.env.development';
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: envFilePath });
  } catch {
    throw new Error(
      `Không đọc được ${envFilePath}. Chạy trong docker (docker compose exec api yarn seed) hoặc tự export các biến MYSQL_DB_*.`,
    );
  }
}

async function connect(): Promise<Connection> {
  return createConnection({
    type: 'mysql',
    host: process.env.MYSQL_DB_HOST,
    port: parseInt(process.env.MYSQL_DB_PORT),
    username: process.env.MYSQL_DB_USERNAME,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    synchronize: true,
    entities,
    logging: false,
  });
}

async function findSeedUsers(connection: Connection): Promise<User[]> {
  // Khớp cả dạng thô lẫn dạng đã chuẩn hoá để --reset dọn được cả dữ liệu do
  // bản seed cũ (lưu sai dạng) tạo ra.
  const phoneNumbers = people.flatMap((person) => [
    person.phoneNumber,
    storedPhone(person.phoneNumber),
  ]);
  return connection
    .getRepository(User)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.profile', 'profile')
    .where('user.phoneNumber IN (:...phoneNumbers)', { phoneNumbers })
    .getMany();
}

/**
 * Xoá theo thứ tự con trước cha. Hai cột last_message_sent phải bị gỡ trước khi
 * xoá tin nhắn, nếu không sẽ vướng khoá ngoại.
 */
async function reset(connection: Connection, seedUsers: User[]) {
  const userIds = seedUsers.map((user) => user.id);
  if (!userIds.length) return;

  const conversations = await connection
    .getRepository(Conversation)
    .createQueryBuilder('conversation')
    .leftJoin('conversation.creator', 'creator')
    .leftJoin('conversation.recipient', 'recipient')
    .where('creator.id IN (:...userIds)', { userIds })
    .orWhere('recipient.id IN (:...userIds)', { userIds })
    .getMany();
  const conversationIds = conversations.map((conversation) => conversation.id);

  if (conversationIds.length) {
    await connection.query(
      `UPDATE conversations SET last_message_sent = NULL WHERE id IN (${conversationIds.join(',')})`,
    );
    await connection.query(
      `DELETE FROM conversation_states WHERE conversationId IN (${conversationIds.join(',')})`,
    );
    await connection.query(
      `DELETE FROM message_attachments WHERE messageId IN (SELECT id FROM messages WHERE conversationId IN (${conversationIds.join(',')}))`,
    );
    await connection.query(
      `DELETE FROM messages WHERE conversationId IN (${conversationIds.join(',')})`,
    );
    await connection.query(
      `DELETE FROM conversations WHERE id IN (${conversationIds.join(',')})`,
    );
  }

  const groups = await connection
    .getRepository(Group)
    .createQueryBuilder('group')
    .leftJoin('group.creator', 'creator')
    .where('creator.id IN (:...userIds)', { userIds })
    .getMany();
  const groupIds = groups.map((group) => group.id);

  if (groupIds.length) {
    await connection.query(
      `UPDATE \`groups\` SET last_message_sent = NULL WHERE id IN (${groupIds.join(',')})`,
    );
    await connection.query(
      `DELETE FROM group_messages WHERE groupId IN (${groupIds.join(',')})`,
    );
    await connection.query(
      `DELETE FROM groups_users_users WHERE groupsId IN (${groupIds.join(',')})`,
    );
    await connection.query(
      `DELETE FROM \`groups\` WHERE id IN (${groupIds.join(',')})`,
    );
  }

  await connection.query(
    `DELETE FROM friends WHERE senderId IN (${userIds.join(',')}) OR receiverId IN (${userIds.join(',')})`,
  );
  await connection.query(
    `DELETE FROM friend_requests WHERE senderId IN (${userIds.join(',')}) OR receiverId IN (${userIds.join(',')})`,
  );
  await connection.query(
    `DELETE FROM users WHERE id IN (${userIds.join(',')})`,
  );

  const profileIds = seedUsers
    .map((user) => user.profile?.id)
    .filter((id): id is number => Boolean(id));
  if (profileIds.length)
    await connection.query(
      `DELETE FROM profiles WHERE id IN (${profileIds.join(',')})`,
    );
}

async function createUsers(connection: Connection): Promise<Map<string, User>> {
  const password = await hashPassword(SEED_PASSWORD);
  const userRepository = connection.getRepository(User);
  const profileRepository = connection.getRepository(Profile);
  const byPhone = new Map<string, User>();

  for (const person of people) {
    const profile = await profileRepository.save(
      profileRepository.create({ about: person.about, avatar: person.avatar }),
    );
    const user = await userRepository.save(
      userRepository.create({
        phoneNumber: storedPhone(person.phoneNumber),
        firstName: person.firstName,
        lastName: person.lastName,
        password,
        profile,
      }),
    );
    byPhone.set(person.phoneNumber, user);
  }

  return byPhone;
}

async function createFriendships(
  connection: Connection,
  byPhone: Map<string, User>,
) {
  const friendRepository = connection.getRepository(Friend);
  const me = byPhone.get(people[0].phoneNumber);

  for (const person of people.slice(1)) {
    await friendRepository.save(
      friendRepository.create({
        sender: me,
        receiver: byPhone.get(person.phoneNumber),
      }),
    );
  }
}

async function createConversations(
  connection: Connection,
  byPhone: Map<string, User>,
) {
  const conversationRepository = connection.getRepository(Conversation);
  const messageRepository = connection.getRepository(Message);
  const stateRepository = connection.getRepository(ConversationState);
  const me = byPhone.get(people[0].phoneNumber);
  let messageCount = 0;

  for (const seed of conversationSeeds) {
    const other = byPhone.get(seed.phoneNumber);
    if (!other) continue;

    const conversation = await conversationRepository.save(
      conversationRepository.create({ creator: me, recipient: other }),
    );

    const sentAt = seed.lines.map((_line, index) =>
      minutesAgo(
        seed.lastActivityMinutesAgo +
          (seed.lines.length - 1 - index) * seed.gapMinutes,
      ),
    );

    const messages: Message[] = [];
    for (let index = 0; index < seed.lines.length; index++) {
      const line = seed.lines[index];
      const message = await messageRepository.save(
        messageRepository.create({
          content: line.content,
          author: line.from === 'me' ? me : other,
          conversation,
        }),
      );
      // created_at là @CreateDateColumn nên TypeORM luôn ghi đè lúc insert —
      // phải sửa lại bằng UPDATE thì mốc thời gian mẫu mới có tác dụng.
      await connection.query('UPDATE messages SET created_at = ? WHERE id = ?', [
        asSql(sentAt[index]),
        message.id,
      ]);
      messages.push(message);
      messageCount++;
    }

    const lastMessage = messages[messages.length - 1];
    const lastSentAt = sentAt[sentAt.length - 1];
    conversation.lastMessageSent = lastMessage;
    await conversationRepository.save(conversation);
    await connection.query(
      'UPDATE conversations SET updated_at = ?, created_at = ? WHERE id = ?',
      [asSql(lastSentAt), asSql(sentAt[0]), conversation.id],
    );

    // Hội thoại chưa đọc: đặt mốc đọc trước hai tin cuối để badge có số nhỏ,
    // giống lúc mới có tin tới. Không có bản ghi nào thì cả hội thoại là chưa đọc.
    const lastReadAt = seed.read
      ? new Date()
      : sentAt[Math.max(0, sentAt.length - 3)];
    await stateRepository.save(
      stateRepository.create({
        user: me,
        conversation,
        lastReadAt,
        isPinned: Boolean(seed.pinned),
        isMuted: Boolean(seed.muted),
      }),
    );
  }

  return messageCount;
}

async function createGroups(
  connection: Connection,
  byPhone: Map<string, User>,
) {
  const groupRepository = connection.getRepository(Group);
  const groupMessageRepository = connection.getRepository(GroupMessage);
  let messageCount = 0;

  for (const seed of groupSeeds) {
    const members = seed.memberPhones
      .map((phone) => byPhone.get(phone))
      .filter((user): user is User => Boolean(user));
    if (members.length < 2) continue;

    const group = await groupRepository.save(
      groupRepository.create({
        title: seed.title,
        users: members,
        creator: members[0],
        owner: members[0],
      }),
    );

    const sentAt = seed.lines.map((_line, index) =>
      minutesAgo(
        seed.lastActivityMinutesAgo +
          (seed.lines.length - 1 - index) * seed.gapMinutes,
      ),
    );

    const messages: GroupMessage[] = [];
    for (let index = 0; index < seed.lines.length; index++) {
      const line = seed.lines[index];
      const message = await groupMessageRepository.save(
        groupMessageRepository.create({
          content: line.content,
          author: byPhone.get(line.fromPhone),
          group,
        }),
      );
      await connection.query(
        'UPDATE group_messages SET created_at = ? WHERE id = ?',
        [asSql(sentAt[index]), message.id],
      );
      messages.push(message);
      messageCount++;
    }

    group.lastMessageSent = messages[messages.length - 1];
    await groupRepository.save(group);
    await connection.query(
      'UPDATE `groups` SET updated_at = ?, created_at = ? WHERE id = ?',
      [asSql(sentAt[sentAt.length - 1]), asSql(sentAt[0]), group.id],
    );
  }

  return messageCount;
}

async function main() {
  loadEnv();
  const shouldReset = process.argv.includes('--reset');
  const connection = await connect();

  try {
    const existing = await findSeedUsers(connection);
    if (existing.length && !shouldReset) {
      console.log(
        `Đã có ${existing.length} tài khoản seed trong database. Chạy lại với --reset nếu muốn tạo mới.`,
      );
      return;
    }
    if (existing.length) {
      console.log(`Xoá dữ liệu seed cũ (${existing.length} tài khoản)...`);
      await reset(connection, existing);
    }

    const byPhone = await createUsers(connection);
    await createFriendships(connection, byPhone);
    const messageCount = await createConversations(connection, byPhone);
    const groupMessageCount = await createGroups(connection, byPhone);

    console.log('');
    console.log('Đã tạo:');
    console.log(`  ${people.length} tài khoản, tất cả là bạn bè của người đầu tiên`);
    console.log(`  ${conversationSeeds.length} hội thoại / ${messageCount} tin nhắn`);
    console.log(`  ${groupSeeds.length} nhóm / ${groupMessageCount} tin nhắn nhóm`);
    console.log('');
    console.log('Đăng nhập bằng:');
    console.log(`  Số điện thoại: ${people[0].phoneNumber}`);
    console.log(`  Mật khẩu:      ${SEED_PASSWORD}`);
    console.log('');
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
