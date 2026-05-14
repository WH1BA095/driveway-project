-- ============================================================
-- Driveway — демо-данные
-- Вставить через phpMyAdmin → выбрать БД driveway_db → вкладка SQL
-- Пароль всех демо-аккаунтов: demo1234
-- ============================================================

SET NAMES utf8mb4;

-- ── 1. Пользователи ──────────────────────────────────────────
INSERT IGNORE INTO `users`
    (email, password_hash, firstname, lastname, full_name, phone, is_admin, created_at)
VALUES
('aleksey.petrov@mail.ru',   '$2y$12$007SMt8iFZgFtXP5CW2ZDe71UuGHmkQjwQwJ22TSCA1tBfoii8mxu', 'Алексей',   'Петров',   'Алексей Петров',     '+79161234567', 0, NOW() - INTERVAL 180 DAY),
('maria.ivanova@gmail.com',  '$2y$12$007SMt8iFZgFtXP5CW2ZDe71UuGHmkQjwQwJ22TSCA1tBfoii8mxu', 'Мария',     'Иванова',  'Мария Иванова',      '+79031112233', 0, NOW() - INTERVAL 140 DAY),
('d.sidorov@yandex.ru',      '$2y$12$007SMt8iFZgFtXP5CW2ZDe71UuGHmkQjwQwJ22TSCA1tBfoii8mxu', 'Дмитрий',   'Сидоров',  'Дмитрий Сидоров',    '+79671239876', 0, NOW() - INTERVAL 95  DAY),
('anna.kozlova@inbox.ru',    '$2y$12$007SMt8iFZgFtXP5CW2ZDe71UuGHmkQjwQwJ22TSCA1tBfoii8mxu', 'Анна',      'Козлова',  'Анна Козлова',       '+79885556677', 0, NOW() - INTERVAL 60  DAY),
('s.novikov@rambler.ru',     '$2y$12$007SMt8iFZgFtXP5CW2ZDe71UuGHmkQjwQwJ22TSCA1tBfoii8mxu', 'Сергей',    'Новиков',  'Сергей Новиков',     '+79251010203', 0, NOW() - INTERVAL 45  DAY),
('katya.morozova@mail.ru',   '$2y$12$007SMt8iFZgFtXP5CW2ZDe71UuGHmkQjwQwJ22TSCA1tBfoii8mxu', 'Екатерина', 'Морозова', 'Екатерина Морозова', '+79174321234', 0, NOW() - INTERVAL 30  DAY),
('andrey.volkov@gmail.com',  '$2y$12$007SMt8iFZgFtXP5CW2ZDe71UuGHmkQjwQwJ22TSCA1tBfoii8mxu', 'Андрей',    'Волков',   'Андрей Волков',      '+79621234000', 0, NOW() - INTERVAL 20  DAY),
('julia.zakharova@bk.ru',    '$2y$12$007SMt8iFZgFtXP5CW2ZDe71UuGHmkQjwQwJ22TSCA1tBfoii8mxu', 'Юлия',      'Захарова', 'Юлия Захарова',      '+79803456789', 0, NOW() - INTERVAL 10  DAY);

-- ── 2. Запоминаем ID пользователей ───────────────────────────
SET @u1 = (SELECT id FROM users WHERE email = 'aleksey.petrov@mail.ru'  LIMIT 1);
SET @u2 = (SELECT id FROM users WHERE email = 'maria.ivanova@gmail.com' LIMIT 1);
SET @u3 = (SELECT id FROM users WHERE email = 'd.sidorov@yandex.ru'     LIMIT 1);
SET @u4 = (SELECT id FROM users WHERE email = 'anna.kozlova@inbox.ru'   LIMIT 1);
SET @u5 = (SELECT id FROM users WHERE email = 's.novikov@rambler.ru'    LIMIT 1);
SET @u6 = (SELECT id FROM users WHERE email = 'katya.morozova@mail.ru'  LIMIT 1);
SET @u7 = (SELECT id FROM users WHERE email = 'andrey.volkov@gmail.com' LIMIT 1);
SET @u8 = (SELECT id FROM users WHERE email = 'julia.zakharova@bk.ru'   LIMIT 1);

-- ── 3. Автомобили ─────────────────────────────────────────────
INSERT IGNORE INTO `user_cars` (user_id, brand, model, year) VALUES
(@u1, 'Toyota',     'Camry',   2019),
(@u2, 'Volkswagen', 'Polo',    2021),
(@u3, 'Lada',       'Vesta',   2020),
(@u4, 'Hyundai',    'Solaris', 2022),
(@u5, 'Kia',        'Rio',     2018),
(@u6, 'Ford',       'Focus',   2017),
(@u7, 'Skoda',      'Rapid',   2020),
(@u8, 'Renault',    'Logan',   2016);

-- ── 4. Берём первые 10 товаров из каталога ───────────────────
-- (если товаров меньше — лишние переменные будут NULL, эти строки просто не добавятся)
SET @p1  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 0);
SET @p2  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 1);
SET @p3  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 2);
SET @p4  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 3);
SET @p5  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 4);
SET @p6  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 5);
SET @p7  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 6);
SET @p8  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 7);
SET @p9  = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 8);
SET @p10 = (SELECT id FROM products ORDER BY id LIMIT 1 OFFSET 9);

-- ── 5. Отзывы к товарам ──────────────────────────────────────
INSERT IGNORE INTO `product_reviews`
    (product_id, user_id, rating, title, body, status, admin_reply, admin_reply_at, created_at)
VALUES

-- Алексей (p1, p2, p3)
(@p1, @u1, 5, 'Отличное качество!',
 'Заказывал впервые — товар пришёл в срок, упакован аккуратно. Поставил на машину — всё идеально подошло. Буду заказывать ещё.',
 'approved', 'Спасибо за ваш отзыв! Рады, что товар вам понравился. Ждём вас снова!',
 NOW() - INTERVAL 55 DAY, NOW() - INTERVAL 60 DAY),

(@p2, @u1, 4, 'Хорошая деталь',
 'В целом доволен. Встала нормально, работает как надо. Минус балл — ждал чуть дольше обещанного, но оно того стоило.',
 'approved', 'Спасибо за отзыв! Приносим извинения за задержку, работаем над сроками.',
 NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 55 DAY),

(@p3, @u1, 5, 'Топ за свои деньги',
 'Брал для замены изношенного. Встал без доработок, резьбы совпали, материал крепкий. За такие деньги — шикарно.',
 'approved', NULL, NULL, NOW() - INTERVAL 40 DAY),

-- Мария (p2, p4, p5)
(@p4, @u2, 5, 'Рекомендую!',
 'Полностью соответствует описанию. Качество на уровне оригинала, цена разумная. Доставка быстрая. Очень довольна покупкой.',
 'approved', 'Спасибо большое! Рады видеть вас снова :)',
 NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 50 DAY),

(@p5, @u2, 3, 'Средне',
 'Деталь рабочая, но к качеству отделки есть вопросы. Функционально всё ок, но за такую цену ожидала чуть лучше.',
 'approved', 'Спасибо за честный отзыв! Передадим замечание поставщику.',
 NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 42 DAY),

-- Дмитрий (p3, p6)
(@p6, @u3, 4, 'Неплохо',
 'Купил как замену заводскому — не разочарован. Чуть дороговато, но зато надёжно. Год уже прошло — нареканий нет.',
 'approved', NULL, NULL, NOW() - INTERVAL 35 DAY),

(@p3, @u3, 5, 'Всё чётко',
 'Быстро доставили, хорошая упаковка. Качество устраивает полностью. Сервис на высоте — консультировали вежливо.',
 'approved', 'Благодарим! Приятно получать такие отзывы.',
 NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 30 DAY),

-- Анна (p5, p7, p8)
(@p7, @u4, 5, 'Отличный товар',
 'Заказала для мужа — он доволен. Деталь подошла точно по размеру, качество хорошее. Доставка за день, упаковка надёжная.',
 'approved', 'Передайте мужу привет! Рады, что всё подошло :)',
 NOW() - INTERVAL 22 DAY, NOW() - INTERVAL 25 DAY),

(@p8, @u4, 4, 'Почти идеально',
 'Качество хорошее, подошло по размеру. Небольшая царапина на упаковке, но сама деталь целая. Рекомендую магазин.',
 'approved', NULL, NULL, NOW() - INTERVAL 18 DAY),

-- Сергей (p1, p9)
(@p9, @u5, 5, 'Лучшее предложение в городе',
 'Объездил несколько магазинов — нигде не было нужного артикула. Здесь нашёл сразу. Цена ниже чем у конкурентов.',
 'approved', 'Очень рады помочь! Обращайтесь.',
 NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 17 DAY),

(@p1, @u5, 4, 'Хорошее качество',
 'Деталь качественная, встала без проблем. Единственный минус — инструкции по установке нет. Но разобрался сам.',
 'approved', NULL, NULL, NOW() - INTERVAL 12 DAY),

-- Екатерина (p6, p10)
(@p10, @u6, 5, 'Супер!',
 'Очень довольна покупкой. Пришло быстро, упаковано отлично. Деталь оригинального качества. Буду постоянным клиентом.',
 'approved', 'Спасибо! Ждём вас снова!',
 NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 10 DAY),

-- Андрей (p2, p7)
(@p2, @u7, 3, 'Нормально, но есть нюансы',
 'Встала не с первого раза — пришлось немного подогнать. В итоге стоит нормально. Доставка быстрая — это плюс.',
 'approved', 'Приносим извинения за неудобства! Если остались вопросы — пишите в поддержку.',
 NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 7 DAY),

-- Юлия (p4, p8)
(@p4, @u8, 5, 'Рекомендую всем!',
 'Качество на высоте, цена честная. Доставили быстрее обещанного. Менеджер ответил на все вопросы. Отличный магазин!',
 'approved', 'Большое спасибо! Вы очень добры :)',
 NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY);

-- ── 6. Вопросы к товарам ─────────────────────────────────────
INSERT INTO `product_questions`
    (product_id, user_id, question, answer, answered_at, status, created_at)
VALUES

(@p1, @u1,
 'Подойдёт ли данная деталь на праворульный автомобиль? Стоит ли отдельно уточнять при заказе?',
 'Здравствуйте! Данный артикул универсальный и подходит как для право-, так и для леворульных автомобилей. Уточнение не требуется.',
 NOW() - INTERVAL 55 DAY, 'answered', NOW() - INTERVAL 58 DAY),

(@p3, @u2,
 'Есть ли гарантия на данный товар? Если деталь окажется бракованной — что делать?',
 'Гарантия на данную позицию составляет 12 месяцев. При обнаружении производственного брака — оформляйте возврат через личный кабинет, заменим бесплатно.',
 NOW() - INTERVAL 48 DAY, 'answered', NOW() - INTERVAL 50 DAY),

(@p5, @u3,
 'Сколько времени займёт доставка в Москву? Есть ли экспресс-доставка на сегодня?',
 'Доставка по Москве — 1–2 рабочих дня курьером. Экспресс-доставка до 3 часов доступна при оформлении до 14:00.',
 NOW() - INTERVAL 30 DAY, 'answered', NOW() - INTERVAL 32 DAY),

(@p7, @u4,
 'Можно ли вернуть, если не подойдёт по размеру? Принимаете ли возвраты?',
 'Возврат в течение 14 дней при сохранении товарного вида — пожалуйста. Деньги вернём на карту в течение 5 рабочих дней.',
 NOW() - INTERVAL 22 DAY, 'answered', NOW() - INTERVAL 24 DAY),

(@p9, @u5,
 'Есть ли этот же артикул в чёрном цвете или только в сером варианте?',
 NULL, NULL, 'open', NOW() - INTERVAL 10 DAY),

(@p2, @u6,
 'Совместима ли деталь с турбированным двигателем? У меня 1.6T 2020 года выпуска.',
 NULL, NULL, 'open', NOW() - INTERVAL 6 DAY),

(@p6, @u7,
 'Какой максимальный допуск по толщине? Оригинал 2.4 мм — аналог подойдёт?',
 'Допуск ±0.1 мм относительно оригинала. При оригинале 2.4 мм данная позиция 2.35 мм — полностью в допуске.',
 NOW() - INTERVAL 3 DAY, 'answered', NOW() - INTERVAL 5 DAY),

(@p4, @u8,
 'Есть ли в наличии оригинальная упаковка? Покупаю в подарок — важен внешний вид.',
 NULL, NULL, 'open', NOW() - INTERVAL 2 DAY);

-- ── 7. Обращения в поддержку ─────────────────────────────────
INSERT INTO `support_messages`
    (user_id, name, email, subject, message, status, reply, replied_at, created_at)
VALUES

(@u1, 'Алексей Петров', 'aleksey.petrov@mail.ru', 'Вопрос по заказу',
 'Добрый день. Оформил заказ три дня назад, но статус до сих пор «Ожидает подтверждения». Подскажите, когда ожидать отправку? Номер заказа: DW-20241015.',
 'replied',
 'Здравствуйте, Алексей! Приносим извинения за задержку. Ваш заказ уже передан на склад и будет отправлен сегодня. Трек-номер пришлём на почту.',
 NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 14 DAY),

(@u2, 'Мария Иванова', 'maria.ivanova@gmail.com', 'Возврат и обмен',
 'Здравствуйте, получила деталь — она не подошла по размеру, хотя указывала VIN. Хочу оформить обмен на подходящую позицию. Как это сделать?',
 'replied',
 'Здравствуйте, Мария! Для обмена напишите VIN и артикул полученной детали на info@driveway.ru. Мы подберём подходящую позицию и организуем бесплатный обмен.',
 NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 11 DAY),

(@u3, 'Дмитрий Сидоров', 'd.sidorov@yandex.ru', 'Доставка',
 'Хотел уточнить: вы работаете с транспортной компанией СДЭК? И сколько стоит доставка до Екатеринбурга примерно?',
 'read', NULL, NULL, NOW() - INTERVAL 7 DAY),

(@u4, 'Анна Козлова', 'anna.kozlova@inbox.ru', 'Гарантия',
 'Купила деталь 8 месяцев назад, вчера обнаружила трещину в корпусе. Гарантия ещё действует — как оформить гарантийный случай? Чек и фото имеются.',
 'new', NULL, NULL, NOW() - INTERVAL 3 DAY),

(@u5, 'Сергей Новиков', 's.novikov@rambler.ru', 'Вопрос по товару',
 'Добрый день! Подскажите, есть ли у вас в наличии масляный фильтр для Kia Rio 1.6 2018 года? На сайте не нашёл нужный артикул.',
 'new', NULL, NULL, NOW() - INTERVAL 1 DAY),

(NULL, 'Иван Гостевой', 'ivan.guest@example.com', 'Другое',
 'Хочу предложить партнёрство — у меня небольшой автосервис, могу давать рекомендации клиентам. Как связаться с отделом по работе с партнёрами?',
 'new', NULL, NULL, NOW() - INTERVAL 2 DAY);

-- ── 8. Избранное ─────────────────────────────────────────────
INSERT IGNORE INTO `user_favorites` (user_id, product_id) VALUES
(@u1, @p1), (@u1, @p3), (@u1, @p5), (@u1, @p7),
(@u2, @p2), (@u2, @p4), (@u2, @p6),
(@u3, @p1), (@u3, @p4), (@u3, @p8), (@u3, @p10),
(@u4, @p3), (@u4, @p5), (@u4, @p9),
(@u5, @p2), (@u5, @p7), (@u5, @p10),
(@u6, @p1), (@u6, @p6), (@u6, @p8),
(@u7, @p3), (@u7, @p5), (@u7, @p9),
(@u8, @p2), (@u8, @p4), (@u8, @p6), (@u8, @p10);

-- ── Готово! ───────────────────────────────────────────────────
-- Создано: 8 пользователей, 8 автомобилей, 13 отзывов,
--          8 вопросов, 6 обращений, 27 избранных товаров
-- Пароль всех демо-аккаунтов: demo1234
