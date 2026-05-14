// Алгоритм Луна — проверяет корректность номера банковской карты.
// Точная копия реализации в CartScreen.js.
function luhn(num) {
    const digits = num.replace(/\s/g, '');
    if (digits.length < 2) return false;
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], 10);
        if (isNaN(n)) return false;
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        alt = !alt;
    }
    return sum % 10 === 0;
}

module.exports = { luhn };
