<?php
// includes/footer.php
?>
<footer class="footer">
    <div class="footer-container">
        
        <!-- Верхняя часть футера с логотипом -->
        <div class="footer-top">
            <div class="footer-logo-area">
                <a href="index.php" class="footer-logo">
                    <img src="img/bigLogo11.png" class="footer-logo-light" alt="Driveway">
                    <img src="img/bigLogo22.png" class="footer-logo-dark" alt="Driveway">
                </a>
                <p class="footer-description">
                    Автозапчасти с доставкой по всей России<br>
                    Больщой выбор запчастей
                </p>
            </div>
            
            <!-- Кнопка подписки (опционально) -->
            <div class="footer-subscribe">
                <span class="subscribe-text">Будьте в курсе новинок и акций</span>
                <div class="subscribe-form">
                    <input type="email" placeholder="Ваш email" class="subscribe-input">
                    <button class="subscribe-btn">Подписаться</button>
                </div>
            </div>
        </div>
        
        <!-- Основное меню футера (4 колонки) -->
        <div class="footer-main">
            
            <!-- Колонка 1: Клиентам -->
            <div class="footer-col">
                <h3 class="footer-title">Клиентам</h3>
                <ul class="footer-links">
                    <li><a href="#">Условия доставки</a></li>
                    <li><a href="#">Способы оплаты</a></li>
                    <li><a href="#">Возврат товара</a></li>
                    <li><a href="#">Возврат средств</a></li>
                    <li><a href="#">Как сделать заказ</a></li>
                    <li><a href="#">Условия работы для клиентов</a></li>
                    <li><a href="#">Политика конфиденциальности</a></li>
                </ul>
            </div>
            
            <!-- Колонка 2: Компания -->
            <div class="footer-col">
                <h3 class="footer-title">Компания</h3>
                <ul class="footer-links">
                    <li><a href="#">Новости</a></li>
                    <li><a href="#">Вакансии</a></li>
                    <li><a href="#">Магазины</a></li>
                    <li><a href="#">Про нас</a></li>
                    <li><a href="#">Франшиза Driveway</a></li>
                    <li><a href="#">Реклама на сайте</a></li>
                    <li><a href="#">Поставщикам</a></li>
                </ul>
            </div>
            
            <!-- Колонка 3: Каталоги -->
            <div class="footer-col">
                <h3 class="footer-title">Каталоги</h3>
                <ul class="footer-links">
                    <li><a href="#">Подбор по автомобилю</a></li>
                    <li><a href="#">Масла и жидкости</a></li>
                    <li><a href="#">Шины и диски</a></li>
                    <li><a href="#">Автохимия</a></li>
                    <li><a href="#">Автопринадлежности</a></li>
                    <li><a href="#">Инструменты и техника</a></li>
                    <li><a href="#">Товары для дома</a></li>
                    <li><a href="#">Сувенирная продукция</a></li>
                </ul>
            </div>
            
            <!-- Колонка 4: Автозапчасти -->
            <div class="footer-col">
                <h3 class="footer-title">Автозапчасти</h3>
                <ul class="footer-links two-columns">
                    <li><a href="#">Фильтры</a></li>
                    <li><a href="#">Тормозная система</a></li>
                    <li><a href="#">Подвеска</a></li>
                    <li><a href="#">Рулевое управление</a></li>
                    <li><a href="#">Двигатель</a></li>
                    <li><a href="#">Электросистемы</a></li>
                    <li><a href="#">Привод ГРМ</a></li>
                    <li><a href="#">Система охлаждения</a></li>
                    <li><a href="#">Кузовные детали</a></li>
                    <li><a href="#">Колесная группа</a></li>
                    <li><a href="#">Оптика</a></li>
                    <li><a href="#">Стеклоочистители</a></li>
                    <li><a href="#">Топливная система</a></li>
                    <li><a href="#">Трансмиссия</a></li>
                    <li><a href="#">Остекление</a></li>
                    <li><a href="#">Выхлопная система</a></li>
                </ul>
            </div>
            
        </div>
        
        <!-- Нижняя часть футера -->
        <div class="footer-bottom">
            <div class="footer-bottom-content">
                <div class="footer-copyright">
                    © <?php echo date('Y'); ?> Driveway. Все права защищены.
                </div>
                <div class="footer-social">
                    <a href="#" class="social-link"><i class="fab fa-telegram"></i></a>
                    <a href="#" class="social-link"><i class="fab fa-vk"></i></a>
                    <a href="#" class="social-link"><i class="fab fa-youtube"></i></a>
                    <a href="#" class="social-link"><i class="fab fa-whatsapp"></i></a>
                </div>
                <div class="footer-payment">
                    <i class="fab fa-cc-visa"></i>
                    <i class="fab fa-cc-mastercard"></i>
                    <i class="fab fa-cc-mir"></i>
                </div>
            </div>
        </div>
        
    </div>
</footer>