// Чистые функции расчёта корзины.
// Зеркалят логику CartContext.js (total, itemCount) и js/cart.js (total, count, setQty).

function calcTotal(items) {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function calcCount(items) {
    return items.reduce((sum, i) => sum + i.quantity, 0);
}

// Ограничивает qty в пределах [1, available]
function capQty(qty, available) {
    return Math.max(1, Math.min(qty, available));
}

module.exports = { calcTotal, calcCount, capQty };
