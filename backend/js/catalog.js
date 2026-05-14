// js/catalog.js
document.addEventListener('DOMContentLoaded', () => {
    const catalogButton = document.getElementById('catalogButton');
    const catalogDropdown = document.getElementById('catalogDropdown');
    const catalogContainer = document.querySelector('.catalog-container');
    
    if (catalogButton && catalogDropdown) {
        // Открытие/закрытие меню по клику на кнопку
        catalogButton.addEventListener('click', (e) => {
            e.stopPropagation();
            catalogContainer.classList.toggle('active');
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!catalogContainer.contains(e.target)) {
                catalogContainer.classList.remove('active');
            }
        });
        
        // Закрытие меню при нажатии Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                catalogContainer.classList.remove('active');
            }
        });
        
        // Закрытие меню при клике на ссылку внутри
        catalogDropdown.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                catalogContainer.classList.remove('active');
            }
        });
        
        // Анимация при наведении на кнопку
        catalogButton.addEventListener('mouseenter', () => {
            if (!catalogContainer.classList.contains('active')) {
                catalogButton.style.transform = 'translateY(-2px)';
            }
        });
        
        catalogButton.addEventListener('mouseleave', () => {
            if (!catalogContainer.classList.contains('active')) {
                catalogButton.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Добавляем обработчики для всех категорий
    const catalogItems = document.querySelectorAll('.catalog-item');
    catalogItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
            }
        });
        
        // При клике делаем активной категорию
        item.addEventListener('click', function(e) {
            // Убираем активность у всех
            catalogItems.forEach(i => i.classList.remove('active'));
            // Добавляем активность текущей
            this.classList.add('active');
        });
    });
});