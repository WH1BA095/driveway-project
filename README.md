# Driveway — Интернет-магазин автозапчастей

Полноценный интернет-магазин автозапчастей: веб-сайт на PHP + мобильное приложение на React Native (Expo). Единая база данных MariaDB, двунаправленная синхронизация корзины между сайтом и приложением.

---

## Стек технологий

| Слой | Технологии |
|------|-----------|
| Веб-сайт | PHP 8.2, HTML/CSS/JS, сессионная авторизация |
| Мобильное приложение | React Native 0.74, Expo 51, React Navigation |
| API | REST JSON API (token-based, Bearer) |
| База данных | MariaDB 12.2 |
| Инфраструктура | Docker, Nginx, PHP-FPM |
| Тесты | PHPUnit 11, Jest 29 |

---

## Структура проекта

```
driveway-project/
├── backend/              # Веб-сайт и API
│   ├── api/              # REST API для мобильного приложения
│   │   ├── app.php       # Основной обработчик (авторизация, товары, заказы)
│   │   ├── auth.php      # Профиль, избранное, автомобили пользователя
│   │   ├── cart.php      # Синхронизация корзины (сессии)
│   │   ├── availability.php  # Актуальные остатки товаров
│   │   ├── reviews.php   # Отзывы
│   │   ├── save_order.php    # Создание заказа
│   │   └── get_orders.php   # История заказов
│   ├── admin/            # Панель администратора
│   ├── config/           # Подключение к БД, функции авторизации
│   ├── css/              # Стили сайта
│   ├── js/               # cart.js, theme.js
│   ├── includes/         # Шапка, подвал, хелперы каталога
│   ├── index.php         # Главная страница
│   ├── catalog.php       # Каталог товаров
│   ├── product.php       # Страница товара
│   ├── cart.php          # Корзина
│   └── checkout.php      # Оформление заказа
├── app/                  # Мобильное приложение (React Native)
│   └── src/
│       ├── api/          # Обёртка над REST API
│       ├── components/   # ProductCard, CategoryCard, StarRating, Logo
│       ├── context/      # AuthContext, CartContext, ThemeContext
│       ├── navigation/   # Структура навигации (Bottom Tabs)
│       └── screens/      # Home, Catalog, Product, Cart, Profile и др.
├── migrate/              # SQL-миграции
│   ├── 001_init_schema.sql
│   └── 002_seed_data.sql
├── nginx/                # Конфигурация Nginx
├── php/                  # Конфигурация PHP-FPM
├── tests/                # Unit-тесты
│   ├── backend/          # PHPUnit (29 тестов)
│   └── app/              # Jest (26 тестов)
└── docker-compose.yaml
```

---

## Быстрый старт

### Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) 
- [Expo Go](https://expo.dev/client) на телефоне или iOS Simulator / Android Emulator

### 1. Запуск бэкенда

```bash
# Клонировать репозиторий
git clone <repo-url>
cd driveway-project

# Запустить все сервисы
docker compose up -d
```

Сайт доступен по адресу: **http://localhost:8899**

База данных поднимается автоматически, миграции применяются при первом старте из папки `migrate/`.

### 2. Запуск мобильного приложения

```bash
cd app
npm install
npm start        # или: npx expo start
```

Откроется Expo Dev Tools. Отсканируй QR-код в Expo Go, или нажми `i` для iOS Simulator / `a` для Android.

> **Важно:** приложение обращается к API по адресу из `app/src/api/index.js`. При запуске на реальном устройстве замени `localhost` на IP своей машины в локальной сети.

---

## Функциональность

### Веб-сайт
- Каталог товаров с фильтрацией по категориям, поиском и пагинацией
- Страница товара с галереей, описанием, отзывами и рейтингом
- Корзина с валидацией остатков в реальном времени
- Оформление заказа (наличные / онлайн-оплата картой с проверкой по алгоритму Луна)
- Личный кабинет: история заказов, профиль, список автомобилей
- Тёмная / светлая тема
- Адаптивный дизайн
- Панель администратора: управление товарами, заказами, отзывами, экспорт

### Мобильное приложение
- Главная страница: поиск, категории, популярные товары
- Каталог с фильтрами
- Корзина с синхронизацией с сайтом
- Авторизация, регистрация, профиль
- Избранное, автомобили пользователя
- Светлая / тёмная тема

### Синхронизация корзины
Корзина полностью синхронизируется между сайтом и приложением в обе стороны:
- Изменения на сайте → применяются в приложении при возврате в foreground
- Изменения в приложении → применяются на сайте при следующей загрузке страницы
- Очистка корзины на любой платформе → очищает на обеих

---

## API

Базовый URL: `http://localhost:8899/api/app.php`

Авторизация: `Authorization: Bearer <token>`

| Метод | Action | Описание |
|-------|--------|----------|
| POST | `register` | Регистрация |
| POST | `login` | Вход, возвращает токен |
| GET | `products` | Список товаров (`page`, `per_page`, `category_id`, `search`) |
| GET | `product` | Один товар (`id`) |
| GET | `categories` | Список категорий |
| GET | `get_cart` | Корзина пользователя |
| POST | `sync_cart` | Синхронизация корзины |
| POST | `clear_cart` | Очистить корзину |
| GET | `get_orders` | История заказов |
| POST | `save_order` | Создать заказ |
| GET | `favorites` | Избранное |
| POST | `toggle_favorite` | Добавить / убрать из избранного |

---

## Тесты

### PHP (PHPUnit) — 29 тестов

```bash
cd tests/backend
./vendor/bin/phpunit
```

| Файл | Что тестирует |
|------|--------------|
| `ValidationTest.php` | Валидация email и телефона |
| `CartCalculationTest.php` | Расчёт суммы, количества, ограничение qty |
| `ApiResponseTest.php` | Формат JSON-ответов API, статусы заказов, санитизация |

### JavaScript (Jest) — 26 тестов

```bash
cd tests/app
npm test
```

| Файл | Что тестирует |
|------|--------------|
| `luhn.test.js` | Алгоритм Луна (валидация карты) |
| `cartLogic.test.js` | Чистая логика корзины (сумма, количество, capQty) |
| `validation.test.js` | Валидация email и телефона на клиенте |

---

## Переменные окружения

Для локального запуска создай файл `.env` в корне проекта:

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=driveway_db
MYSQL_USER=driveway_user
MYSQL_PASSWORD=driveway_pass
```

---

## Образы

### Nginx
Образ, который выступает в роли фронта хранится на `whnba095/driveway-project-frontend`.
В нем реализован root-less запуск nginx сервера, в `docker-compose` убраны лишние capabilities.

Вес образа - `61.4MB`

### Php
Образ, который выступает в роли фронта хранится на `whnba095/driveway-project-backend`.
В нем реализован root-less запуск backend, в `docker-compose` убраны лишние capabilities.

Вес образа - `164MB`

---
## Actions

Реализован `github action` пайплайн, который автоматически проводит unit-тесты и собирает образ с последующей отправкой в `dockerhub`.

---
## Лицензия

Учебный проект. Все права защищены.
