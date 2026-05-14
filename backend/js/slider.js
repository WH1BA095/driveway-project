// js/slider.js
document.addEventListener('DOMContentLoaded', () => {
    const slider = {
        slides: document.querySelectorAll('.slider-slide'),
        dots: document.querySelectorAll('.slider-dot'),
        track: document.querySelector('.slider-track'),
        prevBtn: document.querySelector('.slider-arrow.prev'),
        nextBtn: document.querySelector('.slider-arrow.next'),
        currentIndex: 0,
        intervalTime: 10000, // 10 секунд
        intervalId: null,
        
        init() {
            // Проверяем наличие элементов
            if (!this.slides.length) return;
            
            // Добавляем обработчики
            this.addEventListeners();
            
            // Запускаем автоматическую смену
            this.startAutoPlay();
            
            // Останавливаем при наведении
            this.pauseOnHover();
        },
        
        addEventListeners() {
            // Точки навигации
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.goToSlide(index);
                    this.resetAutoPlay();
                });
            });
            
            // Стрелки
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.prevSlide();
                    this.resetAutoPlay();
                });
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                    this.resetAutoPlay();
                });
            }
            
            // Клавиатура
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.prevSlide();
                    this.resetAutoPlay();
                } else if (e.key === 'ArrowRight') {
                    this.nextSlide();
                    this.resetAutoPlay();
                }
            });
        },
        
        goToSlide(index) {
            // Проверка границ
            if (index < 0) index = this.slides.length - 1;
            if (index >= this.slides.length) index = 0;
            
            // Двигаем слайдер
            if (this.track) {
                this.track.style.transform = `translateX(-${index * 100}%)`;
            }
            
            // Обновляем активные классы
            this.slides.forEach(slide => slide.classList.remove('active'));
            this.slides[index].classList.add('active');
            
            this.dots.forEach(dot => dot.classList.remove('active'));
            this.dots[index].classList.add('active');
            
            this.currentIndex = index;
        },
        
        nextSlide() {
            this.goToSlide(this.currentIndex + 1);
        },
        
        prevSlide() {
            this.goToSlide(this.currentIndex - 1);
        },
        
        startAutoPlay() {
            this.intervalId = setInterval(() => {
                this.nextSlide();
            }, this.intervalTime);
        },
        
        stopAutoPlay() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },
        
        resetAutoPlay() {
            this.stopAutoPlay();
            this.startAutoPlay();
        },
        
        pauseOnHover() {
            const sliderEl = document.querySelector('.slider');
            if (sliderEl) {
                sliderEl.addEventListener('mouseenter', () => {
                    this.stopAutoPlay();
                });
                
                sliderEl.addEventListener('mouseleave', () => {
                    this.startAutoPlay();
                });
            }
        }
    };
    
    // Инициализация слайдера
    slider.init();
});