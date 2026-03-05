# 🚀 Инструкция по Запуску TrueDom

## ✅ Что УЖЕ Готово

### Frontend (100%)
- ✅ React приложение полностью работает
- ✅ UI компоненты готовы
- ✅ Запущен на http://localhost:3000

### Backend (100% код готов)
- ✅ Express сервер с TypeScript
- ✅ Все API endpoints
- ✅ Модели данных
- ✅ Аутентификация (JWT)
- ✅ Валидация (Zod)
- ✅ Rate limiting
- ✅ Error handling
- ✅ SQL схема базы данных

## ❌ Что Нужно Установить

### 1. PostgreSQL

**Windows:**
1. Скачайте PostgreSQL: https://www.postgresql.org/download/windows/
2. Запустите установщик
3. Установите пароль для пользователя `postgres` (запомните его!)
4. Порт оставьте 5432
5. Завершите установку

**Или используйте Chocolatey:**
```powershell
choco install postgresql
```

### 2. Создание Базы Данных

После установки PostgreSQL:

```powershell
# Откройте PowerShell и выполните:
psql -U postgres

# В psql выполните:
CREATE DATABASE truedom;
\q
```

### 3. Настройка Backend

```powershell
# Перейдите в папку backend
cd backend

# Обновите .env файл с вашим паролем PostgreSQL
# Откройте backend/.env и измените:
DB_PASSWORD=ваш_пароль_postgres

# Создайте таблицы в базе данных
psql -U postgres -d truedom -f database/schema.sql

# Запустите backend сервер
npm run dev
```

Backend запустится на http://localhost:3001

---

## 🎯 Быстрый Старт (Пошагово)

### Шаг 1: Установите PostgreSQL
- Скачайте: https://www.postgresql.org/download/windows/
- Установите с паролем (например: `postgres`)

### Шаг 2: Создайте базу данных
```powershell
psql -U postgres
CREATE DATABASE truedom;
\q
```

### Шаг 3: Настройте backend
```powershell
cd backend
# Откройте .env и установите DB_PASSWORD=postgres (или ваш пароль)
```

### Шаг 4: Инициализируйте БД
```powershell
psql -U postgres -d truedom -f database/schema.sql
```

### Шаг 5: Запустите backend
```powershell
npm run dev
```

### Шаг 6: Проверьте работу
Откройте http://localhost:3001/health

Должны увидеть:
```json
{
  "success": true,
  "message": "TrueDom API is running"
}
```

---

## 🧪 Тестирование API

### 1. Регистрация пользователя
```powershell
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"first_name\":\"Иван\",\"last_name\":\"Иванов\"}'
```

### 2. Вход
```powershell
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

Сохраните полученный `token`!

### 3. Создание объекта недвижимости
```powershell
curl -X POST http://localhost:3001/api/properties `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{
    \"cadastral_number\":\"77:01:0001001:1234\",
    \"address\":{
      \"region\":\"Хамовники\",
      \"city\":\"Москва\",
      \"street\":\"ул. Остоженка\",
      \"house_number\":\"11\",
      \"lat\":55.741,
      \"lng\":37.598
    },
    \"rooms\":3,
    \"area\":120,
    \"floor\":4,
    \"total_floors\":7,
    \"ceiling_height\":3.2,
    \"renovation_status\":\"euro\",
    \"has_balcony\":true
  }'
```

### 4. Поиск объектов
```powershell
curl http://localhost:3001/api/properties/search?city=Москва
```

---

## 🔗 Подключение Frontend к Backend

### Обновите frontend для работы с API:

1. Создайте `src/services/api.ts`:
```typescript
const API_URL = 'http://localhost:3001/api';

export async function fetchProperties(params?: any) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/properties/search?${query}`);
  return response.json();
}

export async function createOffer(data: any, token: string) {
  const response = await fetch(`${API_URL}/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

2. Замените MOCK_PROPERTIES на реальные данные из API

---

## 📊 Проверка Состояния

### Backend работает?
```powershell
curl http://localhost:3001/health
```

### База данных подключена?
```powershell
psql -U postgres -d truedom -c "SELECT COUNT(*) FROM users;"
```

### Frontend работает?
Откройте http://localhost:3000

---

## 🐛 Troubleshooting

### Ошибка: "psql не распознано"
- PostgreSQL не установлен или не добавлен в PATH
- Перезапустите PowerShell после установки
- Или используйте полный путь: `C:\Program Files\PostgreSQL\16\bin\psql.exe`

### Ошибка: "Database connection failed"
- Проверьте, что PostgreSQL запущен
- Проверьте пароль в backend/.env
- Проверьте, что база данных `truedom` создана

### Ошибка: "Port 3001 already in use"
- Остановите другой процесс на порту 3001
- Или измените PORT в backend/.env

---

## 📝 Следующие Шаги

После успешного запуска:

1. ✅ Backend API работает
2. ✅ Frontend работает
3. 🔄 Подключить frontend к backend API
4. 🗺️ Интегрировать Яндекс.Карты
5. 📸 Добавить загрузку фотографий
6. 🤖 Реализовать AI оценку цен
7. 🔔 Добавить real-time уведомления

---

## 💡 Полезные Команды

```powershell
# Backend
cd backend
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run lint         # Проверка типов

# Frontend
cd ..
npm run dev          # Запуск frontend (уже работает)

# Database
psql -U postgres -d truedom                    # Подключиться к БД
psql -U postgres -d truedom -c "SELECT * FROM users;"  # Выполнить запрос
```

---

## 🎉 Готово!

Теперь у вас:
- ✅ Работающий frontend на React
- ✅ Полноценный backend API
- ✅ PostgreSQL база данных
- ✅ Аутентификация
- ✅ CRUD операции
- ✅ Система офферов

**Следующий шаг:** Подключите frontend к backend API и замените mock данные на реальные!
