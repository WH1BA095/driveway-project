const { calcTotal, calcCount, capQty } = require('./src/cartLogic');

describe('calcTotal — сумма корзины', () => {
    test('пустая корзина → 0', () => {
        expect(calcTotal([])).toBe(0);
    });

    test('один товар × количество', () => {
        expect(calcTotal([{ price: 1500, quantity: 2 }])).toBe(3000);
    });

    test('несколько товаров суммируются корректно', () => {
        const items = [
            { price: 1000, quantity: 1 },
            { price:  500, quantity: 3 },
        ];
        expect(calcTotal(items)).toBe(2500);
    });

    test('дробные цены считаются верно', () => {
        expect(calcTotal([{ price: 99.99, quantity: 2 }])).toBeCloseTo(199.98);
    });
});

describe('calcCount — количество единиц', () => {
    test('пустая корзина → 0', () => {
        expect(calcCount([])).toBe(0);
    });

    test('один товар возвращает его количество', () => {
        expect(calcCount([{ price: 100, quantity: 3 }])).toBe(3);
    });

    test('суммирует количество по всем позициям', () => {
        const items = [
            { price: 100, quantity: 2 },
            { price: 200, quantity: 4 },
        ];
        expect(calcCount(items)).toBe(6);
    });
});

describe('capQty — ограничение количества', () => {
    test('не изменяет qty если оно ниже available', () => {
        expect(capQty(3, 10)).toBe(3);
    });

    test('обрезает qty до available если превышает', () => {
        expect(capQty(15, 7)).toBe(7);
    });

    test('qty = 0 становится 1 (минимум)', () => {
        expect(capQty(0, 5)).toBe(1);
    });
});
