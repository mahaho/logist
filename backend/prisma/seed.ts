import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@logist.ru' },
    update: {},
    create: {
      email: 'admin@logist.ru',
      password: hashedPassword,
      firstName: 'Администратор',
      lastName: 'Системы',
      role: 'admin',
    },
  });

  // Create dispatcher
  const dispatcherPassword = await bcrypt.hash('dispatcher123', 10);
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@logist.ru' },
    update: {},
    create: {
      email: 'dispatcher@logist.ru',
      password: dispatcherPassword,
      firstName: 'Диспетчер',
      lastName: 'Тестовый',
      role: 'dispatcher',
    },
  });

  // Create accountant
  const accountantPassword = await bcrypt.hash('accountant123', 10);
  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@logist.ru' },
    update: {},
    create: {
      email: 'accountant@logist.ru',
      password: accountantPassword,
      firstName: 'Бухгалтер',
      lastName: 'Тестовый',
      role: 'accountant',
    },
  });

  // Create mechanic
  const mechanicPassword = await bcrypt.hash('mechanic123', 10);
  const mechanic = await prisma.user.upsert({
    where: { email: 'mechanic@logist.ru' },
    update: {},
    create: {
      email: 'mechanic@logist.ru',
      password: mechanicPassword,
      firstName: 'Механик',
      lastName: 'Тестовый',
      role: 'mechanic',
    },
  });

  console.log('Created users:', { admin, dispatcher, accountant, mechanic });
  console.log('\nDefault passwords:');
  console.log('Admin: admin123');
  console.log('Dispatcher: dispatcher123');
  console.log('Accountant: accountant123');
  console.log('Mechanic: mechanic123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



