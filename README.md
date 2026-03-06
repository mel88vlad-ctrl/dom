# 🏠 TrueDom - Маркетплейс Недвижимости Нового Поколения

> Альтернатива Avito, Cian и DomClick с инновационной системой офферов и прозрачными сделками

---

## 📚 Документация

**Вся документация находится в папке [`docs/`](docs/)**

### 🚀 Быстрый старт:
- **[docs/START_HERE.md](docs/START_HERE.md)** - Начните отсюда!
- **[docs/QUICK_START.md](docs/QUICK_START.md)** - Быстрый запуск проекта
- **[docs/INDEX.md](docs/INDEX.md)** - Полная навигация по документации

---

## 🎯 О Проекте

TrueDom - это PropTech платформа для продажи и аренды недвижимости с новым принципом взаимодействия между участниками рынка.

### Ключевые Особенности:

✅ **Order Book System** - Стакан офферов как на бирже
✅ **Digital Passport** - Полная история каждого объекта
✅ **Яндекс.Карты** - Интерактивная карта объектов
✅ **Прозрачность** - Все офферы и цены видны
✅ **Низкая стоимость** - Альтернатива дорогим площадкам

---

## 🚀 Быстрый Запуск

```powershell
# 1. Запустите Backend
cd backend
npm run dev

# 2. В новом терминале: Запустите Frontend
npm run dev

# 3. Откройте http://localhost:3000
```

**Подробные инструкции:** [docs/QUICK_START.md](docs/QUICK_START.md)

---

## 📊 Статус Проекта

```
Backend:          ████████████████████ 100%
Frontend UI:      ████████████████████ 100%
Integration:      ████████████████████ 100%
Authentication:   ████████████████████ 100%
Database:         ████████████████████ 100%
Maps:             ████████████████████ 100%

ИТОГО:            ████████████████░░░░  80%
```

**Детальный статус:** [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)

---

## 🏗️ Архитектура

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** база данных
- **JWT** аутентификация
- **RESTful API** (25+ endpoints)

### Frontend
- **React** + **TypeScript** + **Vite**
- **TailwindCSS** для стилей
- **Motion** для анимаций
- **Яндекс.Карты** для геолокации

### База Данных
- **15+ таблиц**
- **Индексы** для производительности
- **Triggers** для автоматизации
- **Геоданные** (lat/lng)

---

## ✨ Реализованные Функции

### Для Покупателей:
- ✅ Поиск объектов с фильтрами
- ✅ Интерактивная карта
- ✅ Создание офферов (предложений цены)
- ✅ Просмотр стакана офферов
- ✅ Личный кабинет

### Для Продавцов:
- ✅ Размещение объектов
- ✅ Управление листингами
- ✅ Просмотр офферов
- ✅ Принятие/отклонение офферов

### Для Агентов:
- ✅ Управление портфелем объектов
- ✅ Создание листингов
- ✅ Работа с клиентами

---

## 📖 Документация

### Основные Документы:
- **[INDEX.md](docs/INDEX.md)** - Навигация по всей документации
- **[START_HERE.md](docs/START_HERE.md)** - Быстрый старт
- **[АНАЛИЗ_РЕАЛИЗАЦИИ.md](docs/АНАЛИЗ_РЕАЛИЗАЦИИ.md)** - Что реализовано
- **[12.txt](docs/12.txt)** - Полная концепция проекта

### Технические:
- **[BACKEND_COMPLETE.md](docs/BACKEND_COMPLETE.md)** - Backend архитектура
- **[INTEGRATION_COMPLETE.md](docs/INTEGRATION_COMPLETE.md)** - Интеграция
- **[SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md)** - Настройка

### Планирование:
- **[DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md)** - План разработки
- **[PROJECT_STATUS.md](docs/PROJECT_STATUS.md)** - Текущий статус

---

## 🛠️ Технологии

**Backend:**
- Node.js, Express, TypeScript
- PostgreSQL, JWT, Bcrypt
- Zod (валидация), Rate Limiting

**Frontend:**
- React, TypeScript, Vite
- TailwindCSS, Motion
- Яндекс.Карты API

**DevOps:**
- Git, npm
- PostgreSQL
- Environment Variables

---

## 📦 Структура Проекта

```
truedom/
├── docs/                    # 📚 Вся документация
│   ├── INDEX.md            # Навигация
│   ├── START_HERE.md       # Быстрый старт
│   └── ...                 # Остальные документы
│
├── backend/                # 🔧 Backend API
│   ├── src/
│   │   ├── controllers/   # Контроллеры
│   │   ├── models/        # Модели данных
│   │   ├── routes/        # API роуты
│   │   ├── middleware/    # Middleware
│   │   └── index.ts       # Главный файл
│   ├── database/          # База данных
│   └── package.json
│
├── src/                    # 🎨 Frontend
│   ├── components/        # React компоненты
│   ├── pages/             # Страницы
│   ├── services/          # API клиент
│   └── App.tsx            # Главный компонент
│
├── .env                    # Переменные окружения
└── package.json           # Зависимости
```

---

## 🔗 Полезные Ссылки

- **Backend API:** http://localhost:3001
- **Frontend:** http://localhost:3000
- **API Health:** http://localhost:3001/health
- **Backend README:** [backend/README.md](backend/README.md)

---

## 👥 Тестовые Аккаунты

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

---

## 🎯 Следующие Шаги

### Приоритет 1: Завершить MVP
- [ ] Загрузка фотографий (S3/MinIO)
- [ ] Real-time обновления (WebSocket)
- [ ] Чат между пользователями
- [ ] Уведомления

### Приоритет 2: Монетизация
- [ ] Платежная система
- [ ] Тарифы для агентств
- [ ] Продвижение объявлений
- [ ] Рекламный кабинет

### Приоритет 3: Расширение
- [ ] Аренда недвижимости
- [ ] Новостройки
- [ ] AI оценка цен
- [ ] Интеграции (Росреестр, банки)

**Подробный план:** [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md)

---

## 📄 Лицензия

Проект находится в разработке.

---

## 📞 Контакты

Для вопросов и предложений обращайтесь к команде разработки.

---

**Версия:** 1.0 (MVP)  
**Последнее обновление:** 6 марта 2026

**Готов к тестированию и демонстрации! 🚀**
