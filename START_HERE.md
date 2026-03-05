# 🚀 TrueDom - Быстрый Старт

## ✅ Что Готово

- ✅ Backend API (Express + PostgreSQL)
- ✅ Frontend UI (React + TypeScript)
- ✅ Полная интеграция Frontend-Backend
- ✅ Аутентификация (JWT)
- ✅ База данных (15+ таблиц)
- ✅ Seed данные (тестовые объекты)

---

## 🎯 Запуск за 3 Шага

### Шаг 1: Запустите Backend

```powershell
cd backend
npm run dev
```

✅ Backend запустится на http://localhost:3001

### Шаг 2: Заполните Базу Данных (первый раз)

```powershell
# В папке backend
npm run db:seed
```

Это создаст:
- 3 тестовых пользователя
- 5 объектов недвижимости
- 5 листингов
- 5 офферов
- Фотографии

### Шаг 3: Запустите Frontend

```powershell
# В корневой папке проекта
npm run dev
```

✅ Frontend запустится на http://localhost:3000

---

## 🧪 Тестирование

### 1. Откройте Приложение

Перейдите на http://localhost:3000

### 2. Войдите в Систему

Нажмите кнопку "Войти" в правом верхнем углу

**Тестовые аккаунты:**
```
Покупатель:
Email: buyer@truedom.ru
Password: password123

Продавец:
Email: seller@truedom.ru
Password: password123

Агент:
Email: agent@truedom.ru
Password: password123
```

### 3. Попробуйте Функции

- ✅ Просмотр объектов на карте
- ✅ Детальная информация об объекте
- ✅ Создание оффера
- ✅ Просмотр стакана офферов
- ✅ Переключение Supply/Demand режимов
- ✅ Визуализация ликвидности

---

## 📊 Что Вы Увидите

### Главная Страница
- Карта с пинами объектов (5 объектов)
- Список объектов с фотографиями
- Фильтры и поиск
- Переключение Supply/Demand

### Детальная Страница Объекта
- Галерея фотографий
- Характеристики объекта
- Информация о здании
- Стакан офферов (Order Book)
- AI оценка стоимости (UI)
- История сделок
- Инфраструктура района

### Создание Оффера
- Форма с суммой
- Валидация
- Отправка на backend
- Сохранение в базе данных

---

## 🔧 Troubleshooting

### Backend не запускается

**Проблема:** Ошибка подключения к PostgreSQL

**Решение:**
1. Убедитесь, что PostgreSQL запущен
2. Проверьте пароль в `backend/.env`
3. Создайте базу данных: `createdb truedom`
4. Инициализируйте схему: `npm run db:init`

### Frontend показывает "No properties found"

**Проблема:** База данных пустая

**Решение:**
```powershell
cd backend
npm run db:seed
```

### CORS ошибки

**Проблема:** Backend не принимает запросы от Frontend

**Решение:** Проверьте, что backend запущен на порту 3001

---

## 📝 Следующие Шаги

### 1. Добавьте Свои Объекты

Используйте API для создания объектов:

```powershell
# Войдите и получите токен
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"seller@truedom.ru","password":"password123"}'
$token = $response.data.token

# Создайте объект
$body = @{
  cadastral_number = "77:01:0001006:1111"
  address = @{
    region = "Тверской"
    city = "Москва"
    street = "Тверская ул."
    house_number = "12"
    lat = 55.764
    lng = 37.605
  }
  rooms = 3
  area = 100
  floor = 5
  total_floors = 10
  renovation_status = "euro"
  has_balcony = $true
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3001/api/properties" -Method POST -Headers @{Authorization="Bearer $token"} -ContentType "application/json" -Body $body
```

### 2. Интегрируйте Яндекс.Карты

- Получите API ключ: https://developer.tech.yandex.ru/
- Добавьте в `.env`: `VITE_YANDEX_MAPS_KEY=ваш_ключ`
- Замените mock карту на реальную

### 3. Добавьте Загрузку Фотографий

- Настройте S3/MinIO
- Создайте API endpoint загрузки
- Добавьте UI для выбора файлов

---

## 📚 Документация

- `IMPLEMENTATION_GUIDE.md` - Полное руководство по реализации
- `INTEGRATION_COMPLETE.md` - Детали интеграции Frontend-Backend
- `BACKEND_COMPLETE.md` - Документация Backend API
- `PROJECT_STATUS.md` - Текущий статус проекта
- `DEVELOPMENT_PLAN.md` - План дальнейшей разработки

---

## 🎉 Готово!

Теперь у вас есть полностью работающее приложение TrueDom!

**Что работает:**
- ✅ Регистрация и вход
- ✅ Просмотр объектов
- ✅ Создание офферов
- ✅ Стакан офферов (Order Book)
- ✅ Digital Property Passport
- ✅ Аналитика и оценка (UI)

**Следующие этапы:**
- 🗺️ Яндекс.Карты
- 📸 Загрузка фотографий
- 🔔 Real-time уведомления
- 🤖 AI оценка цен
- 🔗 Интеграции (Росреестр, Госуслуги)

**Начните разработку! 🚀**
