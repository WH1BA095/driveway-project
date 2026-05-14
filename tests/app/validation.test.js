const { validateEmail, validatePhone } = require('./src/validation');

describe('validateEmail', () => {
    test('корректный простой email', () => {
        expect(validateEmail('user@example.com')).toBe(true);
    });

    test('email с поддоменом корректен', () => {
        expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    test('email без @ → false', () => {
        expect(validateEmail('userexample.com')).toBe(false);
    });

    test('email без домена → false', () => {
        expect(validateEmail('user@')).toBe(false);
    });

    test('пустая строка → false', () => {
        expect(validateEmail('')).toBe(false);
    });
});

describe('validatePhone', () => {
    test('10 цифр подряд → true', () => {
        expect(validatePhone('9991234567')).toBe(true);
    });

    test('российский формат +7 (999) 123-45-67 → true', () => {
        expect(validatePhone('+7 (999) 123-45-67')).toBe(true);
    });

    test('менее 10 цифр → false', () => {
        expect(validatePhone('12345')).toBe(false);
    });

    test('пустая строка → false', () => {
        expect(validatePhone('')).toBe(false);
    });
});
