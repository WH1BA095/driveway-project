<?php
use PHPUnit\Framework\TestCase;

class ValidationTest extends TestCase
{
    // ── Email ──────────────────────────────────────────────

    public function testValidEmailSimple(): void
    {
        $this->assertTrue(validateEmail('user@example.com'));
    }

    public function testValidEmailWithSubdomain(): void
    {
        $this->assertTrue(validateEmail('user@mail.example.com'));
    }

    public function testInvalidEmailMissingAt(): void
    {
        $this->assertFalse(validateEmail('userexample.com'));
    }

    public function testInvalidEmailMissingDomain(): void
    {
        $this->assertFalse(validateEmail('user@'));
    }

    public function testInvalidEmailEmpty(): void
    {
        $this->assertFalse(validateEmail(''));
    }

    // ── Phone ─────────────────────────────────────────────

    public function testValidPhoneRussianFormatted(): void
    {
        $this->assertTrue(validatePhone('+7 (999) 123-45-67'));
    }

    public function testValidPhoneTenDigits(): void
    {
        $this->assertTrue(validatePhone('9991234567'));
    }

    public function testInvalidPhoneTooShort(): void
    {
        $this->assertFalse(validatePhone('12345'));
    }

    public function testInvalidPhoneEmpty(): void
    {
        $this->assertFalse(validatePhone(''));
    }
}
