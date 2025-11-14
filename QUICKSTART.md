# Быстрый старт

## 1. Установка зависимостей

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

## 2. Настройка базы данных

1. Создайте PostgreSQL базу данных:
```sql
CREATE DATABASE logist_db;
```

2. Создайте файл `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/logist_db?schema=public"
JWT_SECRET="change-this-secret-key-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
```

3. Запустите миграции:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

4. Создайте тестовых пользователей:
```bash
npm run prisma:seed
```

## 3. Запуск

Из корневой директории:
```bash
npm run dev
```

Или отдельно:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 4. Вход в систему

Откройте http://localhost:3000 и войдите с одним из тестовых аккаунтов:

- **admin@logist.ru** / admin123
- **dispatcher@logist.ru** / dispatcher123
- **accountant@logist.ru** / accountant123
- **mechanic@logist.ru** / mechanic123

## Готово! 🎉

Теперь вы можете начать использовать систему.



