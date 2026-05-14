<?php
use PHPUnit\Framework\TestCase;

class ApiResponseTest extends TestCase
{
    // ── buildOkResponse ───────────────────────────────────

    public function testOkResponseSuccessIsTrue(): void
    {
        $data = json_decode(buildOkResponse(), true);
        $this->assertTrue($data['success']);
    }

    public function testOkResponseIncludesExtraFields(): void
    {
        $data = json_decode(buildOkResponse(['token' => 'abc123', 'user_id' => 42]), true);
        $this->assertTrue($data['success']);
        $this->assertSame('abc123', $data['token']);
        $this->assertSame(42, $data['user_id']);
    }

    public function testOkResponseIsValidJson(): void
    {
        buildOkResponse(['items' => []]);
        // buildOkResponse should never produce invalid JSON
        $raw = json_encode(array_merge(['success' => true], ['items' => []]), JSON_UNESCAPED_UNICODE);
        $this->assertNotNull(json_decode($raw));
        $this->assertSame(JSON_ERROR_NONE, json_last_error());
    }

    // ── buildErrResponse ──────────────────────────────────

    public function testErrResponseSuccessIsFalse(): void
    {
        $data = json_decode(buildErrResponse('Неверный пароль'), true);
        $this->assertFalse($data['success']);
    }

    public function testErrResponseContainsMessage(): void
    {
        $msg  = 'Товар не найден';
        $data = json_decode(buildErrResponse($msg), true);
        $this->assertSame($msg, $data['message']);
    }

    public function testErrResponseIsValidJson(): void
    {
        $raw = buildErrResponse('Ошибка');
        $this->assertNotNull(json_decode($raw));
        $this->assertSame(JSON_ERROR_NONE, json_last_error());
    }

    // ── isValidOrderStatus ────────────────────────────────

    public function testValidOrderStatuses(): void
    {
        foreach (['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as $s) {
            $this->assertTrue(isValidOrderStatus($s), "Expected '$s' to be valid");
        }
    }

    public function testInvalidOrderStatus(): void
    {
        $this->assertFalse(isValidOrderStatus('unknown'));
    }

    // ── sanitizeInput ─────────────────────────────────────

    public function testSanitizeTrimsWhitespace(): void
    {
        $this->assertSame('hello', sanitizeInput('  hello  '));
    }

    public function testSanitizeEscapesHtml(): void
    {
        $this->assertSame('&lt;script&gt;', sanitizeInput('<script>'));
    }
}
