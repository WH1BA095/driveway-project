const { luhn } = require('./src/luhn');

describe('Алгоритм Луна (валидация карты)', () => {
    test('тестовый номер Visa проходит', () => {
        expect(luhn('4111111111111111')).toBe(true);
    });

    test('тестовый номер Mastercard проходит', () => {
        expect(luhn('5500005555555559')).toBe(true);
    });

    test('номер с пробелами проходит', () => {
        expect(luhn('4111 1111 1111 1111')).toBe(true);
    });

    test('некорректный номер не проходит', () => {
        expect(luhn('1234567890123456')).toBe(false);
    });

    test('пустая строка не проходит', () => {
        expect(luhn('')).toBe(false);
    });

    test('одна цифра не проходит', () => {
        expect(luhn('0')).toBe(false);
    });

    test('эталонный номер 79927398713 проходит', () => {
        expect(luhn('79927398713')).toBe(true);
    });
});
