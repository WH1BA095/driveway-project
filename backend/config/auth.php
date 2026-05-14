<?php
// config/auth.php — управление сессией и авторизацией

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* ── дополняем существующую таблицу users нужными колонками ─────────────── */
function ensureAuthTables(): void {
    try {
        require_once __DIR__ . '/db.php';
        $db = Database::getInstance()->getConnection();

        // Добавляем колонки, которых нет в исходной схеме (MariaDB 10.2+ поддерживает IF NOT EXISTS)
        $db->exec("ALTER TABLE `users`
            ADD COLUMN IF NOT EXISTS `firstname`   VARCHAR(100) NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS `lastname`    VARCHAR(100) NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS `birthdate`   DATE         DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS `address`     VARCHAR(500) NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS `avatar`      VARCHAR(255) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS `updated_at`  TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
        ");

        // Избранное
        $db->exec("CREATE TABLE IF NOT EXISTS `user_favorites` (
            `id`         INT AUTO_INCREMENT PRIMARY KEY,
            `user_id`    INT UNSIGNED NOT NULL,
            `product_id` INT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `uf_unique` (`user_id`, `product_id`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Таблица автомобилей пользователя (новая)
        $db->exec("CREATE TABLE IF NOT EXISTS `user_cars` (
            `id`      INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `brand`   VARCHAR(100) NOT NULL,
            `model`   VARCHAR(100) NOT NULL,
            `year`    SMALLINT DEFAULT NULL,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Отзывы к товарам
        $db->exec("CREATE TABLE IF NOT EXISTS `product_reviews` (
            `id`             INT AUTO_INCREMENT PRIMARY KEY,
            `product_id`     INT NOT NULL,
            `user_id`        INT UNSIGNED NOT NULL,
            `rating`         TINYINT NOT NULL DEFAULT 5,
            `title`          VARCHAR(255) NOT NULL DEFAULT '',
            `body`           TEXT NOT NULL,
            `status`         ENUM('approved','rejected') NOT NULL DEFAULT 'approved',
            `admin_reply`    TEXT DEFAULT NULL,
            `admin_reply_at` TIMESTAMP NULL DEFAULT NULL,
            `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `one_per_user` (`product_id`,`user_id`),
            KEY `idx_product` (`product_id`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Вопросы по товарам
        $db->exec("CREATE TABLE IF NOT EXISTS `product_questions` (
            `id`          INT AUTO_INCREMENT PRIMARY KEY,
            `product_id`  INT NOT NULL,
            `user_id`     INT UNSIGNED NOT NULL,
            `question`    TEXT NOT NULL,
            `answer`      TEXT DEFAULT NULL,
            `answered_at` TIMESTAMP NULL DEFAULT NULL,
            `status`      ENUM('open','answered') NOT NULL DEFAULT 'open',
            `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY `idx_product` (`product_id`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Обращения в поддержку
        $db->exec("CREATE TABLE IF NOT EXISTS `support_messages` (
            `id`         INT AUTO_INCREMENT PRIMARY KEY,
            `user_id`    INT UNSIGNED DEFAULT NULL,
            `name`       VARCHAR(100) NOT NULL DEFAULT '',
            `email`      VARCHAR(150) NOT NULL DEFAULT '',
            `subject`    VARCHAR(255) NOT NULL DEFAULT '',
            `message`    TEXT NOT NULL,
            `status`     ENUM('new','read','replied') NOT NULL DEFAULT 'new',
            `reply`      TEXT DEFAULT NULL,
            `replied_at` TIMESTAMP NULL DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY `idx_user` (`user_id`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Галерея товаров (несколько фото)
        $db->exec("CREATE TABLE IF NOT EXISTS `product_images` (
            `id`         INT AUTO_INCREMENT PRIMARY KEY,
            `product_id` INT NOT NULL,
            `filename`   VARCHAR(255) NOT NULL,
            `sort_order` TINYINT NOT NULL DEFAULT 0,
            `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY `idx_product` (`product_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    } catch (Exception $e) {
        // молча — не ломать страницу если БД недоступна
    }
}

ensureAuthTables();

/* ── вспомогательные функции ─────────────────────────────────────────────── */
function isLoggedIn(): bool {
    return isset($_SESSION['user_id']);
}

function getCurrentUser(): ?array {
    if (!isLoggedIn()) return null;
    return [
        'id'        => $_SESSION['user_id'],
        'firstname' => $_SESSION['user_firstname'],
        'lastname'  => $_SESSION['user_lastname'],
        'email'     => $_SESSION['user_email'],
    ];
}

function loginUser(array $user): void {
    session_regenerate_id(true);

    // Поддержка старой схемы (full_name) и новой (firstname + lastname)
    $firstname = $user['firstname'] ?? '';
    $lastname  = $user['lastname']  ?? '';
    if ($firstname === '' && !empty($user['full_name'])) {
        $parts     = explode(' ', trim($user['full_name']), 2);
        $firstname = $parts[0] ?? '';
        $lastname  = $parts[1] ?? '';
    }

    $_SESSION['user_id']        = $user['id'];
    $_SESSION['user_firstname'] = $firstname;
    $_SESSION['user_lastname']  = $lastname;
    $_SESSION['user_email']     = $user['email'];
    $_SESSION['user_is_admin']  = $user['is_admin'] ?? 0;
}

function logoutUser(): void {
    session_unset();
    session_destroy();
}

function isAdmin(): bool {
    return isLoggedIn() && !empty($_SESSION['user_is_admin']);
}

function requireLogin(string $redirectTo = 'index.php'): void {
    if (!isLoggedIn()) {
        $back = urlencode($_SERVER['REQUEST_URI'] ?? '');
        header("Location: {$redirectTo}?auth=login&redirect={$back}");
        exit;
    }
}
