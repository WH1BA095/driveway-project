// Валидация пользовательского ввода.
// Зеркалит логику LoginScreen.js и RegisterScreen.js.

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Минимум 10 цифр (после удаления всего кроме цифр)
function validatePhone(phone) {
    return phone.replace(/\D/g, '').length >= 10;
}

module.exports = { validateEmail, validatePhone };
