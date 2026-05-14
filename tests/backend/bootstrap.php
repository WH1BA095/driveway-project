<?php
// Чистые вспомогательные функции, извлечённые из логики системы.
// Не требуют базы данных — пригодны для изолированного unit-тестирования.

/**
 * Валидация email (mirrors RegisterScreen и api/app.php)
 */
function validateEmail(string $email): bool
{
    return filter_var(trim($email), FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Валидация телефона: минимум 10 цифр (mirrors RegisterScreen)
 */
function validatePhone(string $phone): bool
{
    $digits = preg_replace('/\D/', '', $phone);
    return strlen($digits) >= 10;
}

/**
 * Форматирование цены (mirrors Number.toLocaleString в ProductCard)
 */
function formatPrice(float $price): string
{
    return number_format($price, 2, '.', '');
}

/**
 * Формирует тело успешного JSON-ответа (mirrors ok() в api/app.php)
 */
function buildOkResponse(array $data = []): string
{
    return json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_UNICODE);
}

/**
 * Формирует тело ошибочного JSON-ответа (mirrors err() в api/app.php)
 */
function buildErrResponse(string $msg): string
{
    return json_encode(['success' => false, 'message' => $msg], JSON_UNESCAPED_UNICODE);
}

/**
 * Считает сумму корзины (mirrors Cart.total() в js/cart.js и CartContext.total)
 */
function calcCartTotal(array $items): float
{
    return (float) array_reduce($items, fn($sum, $i) => $sum + $i['price'] * $i['qty'], 0.0);
}

/**
 * Считает количество единиц товара (mirrors Cart.count() в js/cart.js)
 */
function calcCartCount(array $items): int
{
    return (int) array_reduce($items, fn($sum, $i) => $sum + $i['qty'], 0);
}

/**
 * Ограничивает количество в пределах [1, available] (mirrors Cart.setQty)
 */
function capQty(int $qty, int $available): int
{
    return max(1, min($qty, $available));
}

/**
 * Проверяет допустимость статуса заказа (mirrors ENUM в orders таблице)
 */
function isValidOrderStatus(string $status): bool
{
    return in_array($status, ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], true);
}

/**
 * Санитизация строки пользовательского ввода
 */
function sanitizeInput(string $s): string
{
    return trim(htmlspecialchars($s, ENT_QUOTES, 'UTF-8'));
}
