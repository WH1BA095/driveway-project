<?php
use PHPUnit\Framework\TestCase;

class CartCalculationTest extends TestCase
{
    // ── calcCartTotal ─────────────────────────────────────

    public function testCalcTotalEmptyCart(): void
    {
        $this->assertSame(0.0, calcCartTotal([]));
    }

    public function testCalcTotalSingleItem(): void
    {
        $items = [['price' => 1500.0, 'qty' => 2]];
        $this->assertSame(3000.0, calcCartTotal($items));
    }

    public function testCalcTotalMultipleItems(): void
    {
        $items = [
            ['price' => 1000.0, 'qty' => 1],
            ['price' =>  500.0, 'qty' => 3],
        ];
        $this->assertSame(2500.0, calcCartTotal($items));
    }

    public function testCalcTotalDecimalPrice(): void
    {
        $items = [['price' => 99.99, 'qty' => 3]];
        $this->assertEqualsWithDelta(299.97, calcCartTotal($items), 0.001);
    }

    // ── calcCartCount ─────────────────────────────────────

    public function testCalcCountEmptyCart(): void
    {
        $this->assertSame(0, calcCartCount([]));
    }

    public function testCalcCountSingleItem(): void
    {
        $items = [['price' => 100.0, 'qty' => 5]];
        $this->assertSame(5, calcCartCount($items));
    }

    public function testCalcCountMultipleItems(): void
    {
        $items = [
            ['price' => 100.0, 'qty' => 2],
            ['price' => 200.0, 'qty' => 4],
        ];
        $this->assertSame(6, calcCartCount($items));
    }

    // ── capQty ────────────────────────────────────────────

    public function testCapQtyBelowAvailableUnchanged(): void
    {
        $this->assertSame(3, capQty(3, 10));
    }

    public function testCapQtyCapsAtAvailable(): void
    {
        $this->assertSame(7, capQty(15, 7));
    }

    public function testCapQtyZeroBecomesOne(): void
    {
        $this->assertSame(1, capQty(0, 5));
    }
}
