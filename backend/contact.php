<?php require_once 'includes/header.php'; ?>

<main class="main-content">
<div class="page-container">

    <div class="breadcrumbs">
        <a href="index.php">Главная</a>
        <span class="breadcrumb-separator">›</span>
        <span class="current">Обратная связь</span>
    </div>

    <h1 class="page-title"><i class="fas fa-envelope"></i> Написать нам</h1>

    <div class="contact-layout">

        <!-- Форма -->
        <div class="cart-card contact-form-card">
            <h2 class="profile-section-title"><i class="fas fa-paper-plane"></i> Отправить сообщение</h2>
            <p class="contact-sub">Мы ответим на ваш вопрос в течение 1 рабочего дня на указанный email.</p>

            <div class="profile-form" style="max-width:100%">
                <div class="profile-form-row">
                    <div class="profile-form-group">
                        <label>Ваше имя <span class="req">*</span></label>
                        <input type="text" id="ct-name" class="profile-input" placeholder="Иван Иванов">
                    </div>
                    <div class="profile-form-group">
                        <label>Email <span class="req">*</span></label>
                        <input type="email" id="ct-email" class="profile-input" placeholder="ivan@example.com">
                    </div>
                </div>
                <div class="profile-form-group">
                    <label>Тема обращения</label>
                    <select id="ct-subject" class="profile-input">
                        <option value="">Выберите тему...</option>
                        <option value="Вопрос по заказу">Вопрос по заказу</option>
                        <option value="Вопрос по товару">Вопрос по товару</option>
                        <option value="Возврат и обмен">Возврат и обмен</option>
                        <option value="Доставка">Доставка</option>
                        <option value="Гарантия">Гарантия</option>
                        <option value="Жалоба">Жалоба</option>
                        <option value="Другое">Другое</option>
                    </select>
                </div>
                <div class="profile-form-group">
                    <label>Сообщение <span class="req">*</span></label>
                    <textarea id="ct-message" class="profile-input" style="min-height:130px;resize:vertical;"
                              placeholder="Опишите ваш вопрос или проблему подробно..."></textarea>
                </div>

                <div id="ct-msg" class="rv-inline-msg" style="display:none;"></div>

                <button class="btn-primary-lg" id="ct-send-btn" onclick="sendContact()">
                    <i class="fas fa-paper-plane"></i> Отправить сообщение
                </button>
            </div>
        </div>

        <!-- Контакты -->
        <div class="contact-info-col">
            <div class="cart-card contact-info-card">
                <h3 class="profile-section-title"><i class="fas fa-phone"></i> Контакты</h3>
                <div class="contact-info-list">
                    <div class="contact-info-item">
                        <div class="ci-icon"><i class="fas fa-phone-alt"></i></div>
                        <div>
                            <div class="ci-label">Телефон</div>
                            <a href="tel:+78007779980" class="ci-val">8 (800) 777-99-80</a>
                            <div class="ci-hint">Бесплатно по России</div>
                        </div>
                    </div>
                    <div class="contact-info-item">
                        <div class="ci-icon"><i class="fas fa-envelope"></i></div>
                        <div>
                            <div class="ci-label">Email</div>
                            <a href="mailto:info@driveway.ru" class="ci-val">info@driveway.ru</a>
                        </div>
                    </div>
                    <div class="contact-info-item">
                        <div class="ci-icon"><i class="fas fa-clock"></i></div>
                        <div>
                            <div class="ci-label">Режим работы</div>
                            <div class="ci-val">Пн–Пт: 9:00–20:00</div>
                            <div class="ci-hint">Сб–Вс: 10:00–18:00</div>
                        </div>
                    </div>
                    <div class="contact-info-item">
                        <div class="ci-icon"><i class="fas fa-map-marker-alt"></i></div>
                        <div>
                            <div class="ci-label">Адрес склада</div>
                            <div class="ci-val">ул. Ленина, д. 1</div>
                            <div class="ci-hint">Самовывоз: Пн–Сб 9:00–20:00</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="cart-card contact-info-card" style="margin-top:16px;">
                <h3 class="profile-section-title"><i class="fas fa-comments"></i> Мессенджеры</h3>
                <div class="contact-messengers">
                    <a href="#" class="messenger-btn messenger-tg"><i class="fab fa-telegram"></i> Telegram</a>
                    <a href="#" class="messenger-btn messenger-wa"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                </div>
            </div>
        </div>

    </div>
</div>
</main>

<?php require_once 'includes/footer.php'; ?>

<script>
<?php if (isLoggedIn()): ?>
// Предзаполняем данные если залогинен
document.addEventListener('DOMContentLoaded', () => {
    fetch('api/auth.php?action=get_profile').then(r => r.json()).then(res => {
        if (!res.success) return;
        const u = res.user;
        const name = [u.firstname, u.lastname].filter(Boolean).join(' ') || u.full_name || '';
        if (name) document.getElementById('ct-name').value  = name;
        if (u.email) document.getElementById('ct-email').value = u.email;
    });
});
<?php endif; ?>

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

function setFieldError(id, hasError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('input-error', hasError);
    el.classList.toggle('input-ok',    !hasError && el.value.trim().length > 0);
}

async function sendContact() {
    const name    = document.getElementById('ct-name').value.trim();
    const email   = document.getElementById('ct-email').value.trim();
    const subject = document.getElementById('ct-subject').value;
    const message = document.getElementById('ct-message').value.trim();
    const msgEl   = document.getElementById('ct-msg');
    const btn     = document.getElementById('ct-send-btn');

    msgEl.style.display = 'none';
    ['ct-name','ct-email','ct-message'].forEach(id => setFieldError(id, false));

    if (!name) { setFieldError('ct-name', true); showMsg('Введите ваше имя', false); return; }
    if (!email || !isValidEmail(email)) { setFieldError('ct-email', true); showMsg('Введите корректный email', false); return; }
    if (message.length < 10) { setFieldError('ct-message', true); showMsg('Сообщение слишком короткое (минимум 10 символов)', false); return; }
    if (message.length > 5000) { setFieldError('ct-message', true); showMsg('Сообщение слишком длинное (максимум 5000 символов)', false); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';

    const fd = new FormData();
    fd.append('action',  'send_support');
    fd.append('name',    name);
    fd.append('email',   email);
    fd.append('subject', subject);
    fd.append('message', message);

    const res = await fetch('api/reviews.php', { method:'POST', body:fd }).then(r => r.json()).catch(() => null);

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить сообщение';

    if (res && res.success) {
        showMsg(res.message, true);
        document.getElementById('ct-message').value = '';
        document.getElementById('ct-subject').value = '';
    } else {
        showMsg(res?.message || 'Ошибка отправки', false);
    }
}

function showMsg(msg, ok) {
    const el = document.getElementById('ct-msg');
    el.innerHTML = `<i class="fas fa-${ok ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}`;
    el.className = 'rv-inline-msg' + (ok ? ' ok' : ' err');
    el.style.display = 'flex';
}

// Сбрасываем ошибку при вводе
document.addEventListener('DOMContentLoaded', () => {
    ['ct-name','ct-email','ct-message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => {
            el.classList.remove('input-error');
            document.getElementById('ct-msg').style.display = 'none';
        });
    });
});
</script>
