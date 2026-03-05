# TrueDom Backend API

Полноценный backend для платформы TrueDom с PostgreSQL, Express и TypeScript.

## 🚀 Быстрый Старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка PostgreSQL

Убедитесь, что PostgreSQL установлен и запущен.

Создайте базу данных:
```bash
createdb truedom
```

Или через psql:
```bash
psql -U postgres
CREATE DATABASE truedom;
\q
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте:
```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=truedom
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Инициализация базы данных

Создайте таблицы:
```bash
npm run db:init
```

Или вручную:
```bash
psql -U postgres -d truedom -f database/schema.sql
```

### 5. Запуск сервера

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь
- `PATCH /api/auth/profile` - Обновить профиль

### Properties
- `GET /api/properties/search` - Поиск объектов
- `GET /api/properties/:id` - Получить объект
- `GET /api/properties/cadastral/:number` - По кадастровому номеру
- `POST /api/properties` - Создать объект
- `PATCH /api/properties/:id` - Обновить
- `DELETE /api/properties/:id` - Удалить

### Listings
- `POST /api/listings` - Создать листинг
- `GET /api/listings/:id` - Получить листинг
- `GET /api/listings/property/:propertyId` - Листинги объекта
- `GET /api/listings/my` - Мои листинги
- `PATCH /api/listings/:id` - Обновить
- `POST /api/listings/:id/sold` - Отметить как проданный
- `DELETE /api/listings/:id` - Удалить

### Offers
- `POST /api/offers` - Создать оффер
- `GET /api/offers/property/:propertyId` - Офферы объекта (Order Book)
- `GET /api/offers/my` - Мои офферы
- `POST /api/offers/:id/accept` - Принять оффер
- `POST /api/offers/:id/reject` - Отклонить оффер
- `POST /api/offers/:id/withdraw` - Отозвать оффер

## 🗄️ База Данных

### Основные таблицы:
- `users` - Пользователи
- `addresses` - Адреса с геоданными
- `buildings` - Здания
- `properties` - Объекты недвижимости
- `listings` - Листинги
- `offers` - Офферы покупателей
- `transactions` - История сделок
- `buyer_requests` - Запросы покупателей
- `documents` - Документы
- `building_ratings` - Рейтинги зданий
- `infrastructure` - Инфраструктура
- `property_photos` - Фотографии
- `agents` - Агенты
- `agencies` - Агентства

## 🔐 Аутентификация

API использует JWT токены. Для защищенных endpoints добавьте заголовок:
```
Authorization: Bearer <your_token>
```

## 🛡️ Безопасность

- Rate limiting на всех endpoints
- Валидация данных с Zod
- Хеширование паролей с bcrypt
- JWT токены с истечением
- CORS настроен
- SQL injection защита через параметризованные запросы

## 📊 Структура Проекта

```
backend/
├── src/
│   ├── config/          # Конфигурация (БД)
│   ├── controllers/     # Контроллеры
│   ├── middleware/      # Middleware
│   ├── models/          # Модели данных
│   ├── routes/          # Роуты
│   ├── services/        # Бизнес-логика
│   ├── types/           # TypeScript типы
│   ├── utils/           # Утилиты
│   └── index.ts         # Точка входа
├── database/
│   ├── migrations/      # Миграции
│   ├── seeds/           # Seed данные
│   └── schema.sql       # SQL схема
├── .env                 # Переменные окружения
├── tsconfig.json        # TypeScript конфиг
└── package.json
```

## 🧪 Тестирование API

Используйте Postman, Insomnia или curl:

```bash
# Health check
curl http://localhost:3001/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Search properties
curl http://localhost:3001/api/properties/search?city=Москва&rooms=3
```

## 🔧 Troubleshooting

### Ошибка подключения к БД
- Проверьте, что PostgreSQL запущен
- Проверьте credentials в `.env`
- Убедитесь, что база данных создана

### Ошибка при создании таблиц
- Убедитесь, что расширения PostGIS установлены
- Проверьте права пользователя PostgreSQL

## 📝 TODO

- [ ] WebSocket для real-time обновлений
- [ ] Elasticsearch для поиска
- [ ] Redis для кэширования
- [ ] Email уведомления
- [ ] Загрузка файлов (S3)
- [ ] AI оценка цен
- [ ] Интеграция с Росреестром
- [ ] Интеграция с Госуслугами

## 🤝 Contributing

Backend готов к использованию и расширению!
