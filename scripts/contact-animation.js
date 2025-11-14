/**
 * Класс для управления анимацией движения круга по SVG-пути
 */
class PathAnimation {
    constructor(config) {
        // Получаем элементы DOM
        this.path = document.getElementById(config.pathId);
        this.animatedPath = document.getElementById(config.animatedPathId);
        this.circle = document.getElementById(config.circleId);
        this.gradient = document.getElementById(config.gradientId);
        this.endCircle = document.getElementById(config.endCircleId);

        // Проверяем, что все элементы найдены
        if (!this.path || !this.animatedPath || !this.circle || !this.gradient || !this.endCircle) {
            console.error('PathAnimation: Не все элементы найдены. Проверка элементов:');
            console.error('  path (#' + config.pathId + '):', this.path ? '✓ найден' : '✗ НЕ НАЙДЕН');
            console.error('  animatedPath (#' + config.animatedPathId + '):', this.animatedPath ? '✓ найден' : '✗ НЕ НАЙДЕН');
            console.error('  circle (#' + config.circleId + '):', this.circle ? '✓ найден' : '✗ НЕ НАЙДЕН');
            console.error('  gradient (#' + config.gradientId + '):', this.gradient ? '✓ найден' : '✗ НЕ НАЙДЕН');
            console.error('  endCircle (#' + config.endCircleId + '):', this.endCircle ? '✓ найден' : '✗ НЕ НАЙДЕН');
            console.error('Конфигурация:', config);

            // Помечаем объект как невалидный
            this.isValid = false;
            return;
        }

        // Объект валиден
        this.isValid = true;

        // Уникальный идентификатор для логов
        this.name = config.name || config.circleId;

        // Параметры анимации
        this.pathLength = this.path.getTotalLength();
        this.duration = config.duration || 4000;
        this.trailLength = config.trailLength || 60;
        this.pauseDuration = config.pauseDuration || 5000;
        this.reverse = config.reverse !== undefined ? config.reverse : true;

        // Цвета
        this.colors = {
            active: config.activeColor || '#5BA3F5',
            inactive: config.inactiveColor || '#D0D0D0'
        };

        // Состояние анимации
        this.startTime = null;
        this.isPaused = false;
        this.pauseStartTime = null;
        this.hasReachedEnd = false;
        this.animationId = null;
        this.isRunning = false;

        // Настройки логирования
        this.debug = config.debug !== undefined ? config.debug : true;

        this.log('Инициализирована', {
            pathLength: this.pathLength,
            duration: this.duration,
            trailLength: this.trailLength,
            pauseDuration: this.pauseDuration,
            reverse: this.reverse ? 'от конца к началу' : 'от начала к концу'
        });
    }

    /**
     * Логирование (если включен debug)
     */
    log(...args) {
        if (this.debug) {
            console.log(`[PathAnimation ${this.name}]`, ...args);
        }
    }

    /**
     * Запуск анимации
     */
    start() {
        if (!this.isValid) {
            console.error('PathAnimation: Невозможно запустить анимацию - объект не валиден');
            return;
        }

        if (this.isRunning) {
            this.log('Анимация уже запущена');
            return;
        }

        this.isRunning = true;
        this.log('Запуск анимации');
        this.animationId = requestAnimationFrame(this.animate);
    }

    /**
     * Остановка анимации
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isRunning = false;
        this.log('Анимация остановлена');
    }

    /**
     * Сброс анимации в начальное состояние
     */
    reset() {
        this.stop();
        this.startTime = null;
        this.isPaused = false;
        this.pauseStartTime = null;
        this.hasReachedEnd = false;

        // Возвращаем элементы в начальное состояние
        this.circle.style.opacity = '1';
        this.animatedPath.style.opacity = '1';
        this.endCircle.setAttribute('stroke', this.colors.inactive);

        this.log('Анимация сброшена');
    }

    /**
     * Обработка паузы
     */
    handlePause(timestamp) {
        const pauseElapsed = timestamp - this.pauseStartTime;

        if (pauseElapsed >= this.pauseDuration) {
            // Пауза закончилась
            this.log('Пауза закончилась');

            // Если есть колбэк - вызываем его и НЕ возобновляем анимацию
            // (последовательность запустит следующую анимацию)
            if (this.onCycleComplete && typeof this.onCycleComplete === 'function') {
                this.log('Вызываем onCycleComplete - передаём управление последовательности');
                this.onCycleComplete();
                return true; // Остаёмся в паузе, последовательность сама остановит и запустит следующую
            }

            // Если колбэка нет - возобновляем анимацию (режим бесконечного цикла)
            this.log('Нет колбэка - возобновляем анимацию в бесконечном цикле');
            this.isPaused = false;
            this.hasReachedEnd = false;
            this.startTime = timestamp;
            this.endCircle.setAttribute('stroke', this.colors.inactive);

            // Возвращаем видимость круга и следа
            this.circle.style.opacity = '1';
            this.animatedPath.style.opacity = '1';

            return false; // Продолжаем анимацию
        }

        return true; // Продолжаем паузу
    }

    /**
     * Установка колбэка на завершение цикла анимации
     */
    setOnCycleComplete(callback) {
        this.onCycleComplete = callback;
    }

    /**
     * Обновление позиции круга и следа
     */
    updatePosition(currentLength) {
        // Проверяем на валидность значения
        if (!isFinite(currentLength) || currentLength < 0) {
            this.log('Некорректное значение currentLength:', currentLength);
            currentLength = 0;
        }

        // Ограничиваем значение длиной пути
        currentLength = Math.max(0, Math.min(this.pathLength, currentLength));

        const point = this.path.getPointAtLength(currentLength);

        // Обновляем позицию круга
        this.circle.setAttribute('cx', point.x);
        this.circle.setAttribute('cy', point.y);

        // Обновляем синий след (позади круга)
        let startOffset, endOffset, trailVisibleLength;

        if (this.reverse) {
            // Для reverse: след идёт ПОСЛЕ круга (в сторону увеличения length)
            startOffset = currentLength;
            endOffset = Math.min(this.pathLength, currentLength + this.trailLength);
            trailVisibleLength = endOffset - startOffset;
            this.animatedPath.style.strokeDasharray = `${trailVisibleLength} ${this.pathLength}`;
            this.animatedPath.style.strokeDashoffset = -currentLength;
        } else {
            // Для прямого: след идёт ПЕРЕД кругом (в сторону уменьшения length)
            startOffset = Math.max(0, currentLength - this.trailLength);
            endOffset = currentLength;
            trailVisibleLength = endOffset - startOffset;
            this.animatedPath.style.strokeDasharray = `${trailVisibleLength} ${this.pathLength}`;
            this.animatedPath.style.strokeDashoffset = -startOffset;
        }

        return { point, endOffset: this.reverse ? endOffset : startOffset };
    }

    /**
     * Обновление градиента
     */
    updateGradient(point, currentLength) {
        let trailStart, trailEnd;

        if (this.reverse) {
            // Для reverse: градиент от круга (начало) к концу следа
            trailStart = point; // Начало следа у круга
            const endOffset = Math.min(this.pathLength, currentLength + this.trailLength);
            trailEnd = this.path.getPointAtLength(endOffset); // Конец следа позади
        } else {
            // Для прямого: градиент от начала следа к кругу (конец)
            const startOffset = Math.max(0, currentLength - this.trailLength);
            trailStart = this.path.getPointAtLength(startOffset); // Начало следа позади
            trailEnd = point; // Конец следа у круга
        }

        this.gradient.setAttribute('x1', `${trailStart.x}`);
        this.gradient.setAttribute('y1', `${trailStart.y}`);
        this.gradient.setAttribute('x2', `${trailEnd.x}`);
        this.gradient.setAttribute('y2', `${trailEnd.y}`);
        this.gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
    }

    /**
     * Проверка достижения конца пути
     */
    checkEndReached(currentLength, timestamp) {
        // Определяем условие достижения конца в зависимости от направления
        const isAtEnd = this.reverse
            ? currentLength < 1  // Для reverse: конец при currentLength близок к 0
            : currentLength > (this.pathLength - 1);  // Для прямого: конец при currentLength близок к pathLength

        const isNearEnd = this.reverse
            ? currentLength < 20
            : currentLength > (this.pathLength - 20);

        if (isAtEnd && !this.hasReachedEnd && !this.isPaused) {
            // Достигли конца - включаем паузу
            this.log('Достигли конца! Пауза на', this.pauseDuration / 1000, 'секунд');
            this.isPaused = true;
            this.pauseStartTime = timestamp;
            this.hasReachedEnd = true;
            this.endCircle.setAttribute('stroke', this.colors.active);

            // Плавно скрываем через изменение opacity
            this.circle.style.opacity = '0';
            this.animatedPath.style.opacity = '0';
        } else if (isNearEnd && !this.hasReachedEnd) {
            // Близко к концу - круг активный
            this.endCircle.setAttribute('stroke', this.colors.active);
        } else if (!this.isPaused && !this.hasReachedEnd) {
            // Обычное состояние - круг неактивный
            this.endCircle.setAttribute('stroke', this.colors.inactive);
        }
    }

    /**
     * Основная функция анимации
     */
    animate = (timestamp) => {
        if (!this.isRunning) return;

        // Проверяем валидность timestamp
        if (!timestamp || !isFinite(timestamp)) {
            this.log('Некорректный timestamp:', timestamp);
            this.animationId = requestAnimationFrame(this.animate);
            return;
        }

        if (!this.startTime) {
            this.startTime = timestamp;
            this.log('Анимация запущена, timestamp:', timestamp);
        }

        // Обработка паузы
        if (this.isPaused) {
            if (this.handlePause(timestamp)) {
                this.animationId = requestAnimationFrame(this.animate);
                return;
            }
        }

        // Вычисляем прогресс
        const elapsed = timestamp - this.startTime;
        const progress = (elapsed % this.duration) / this.duration;
        const reversedProgress = this.reverse ? (1 - progress) : progress;

        // Позиция на пути
        const currentLength = this.pathLength * reversedProgress;

        // Обновляем позицию круга и следа
        const { point } = this.updatePosition(currentLength);

        // Обновляем градиент
        this.updateGradient(point, currentLength);

        // Проверяем достижение конца
        this.checkEndReached(currentLength, timestamp);

        // Продолжаем анимацию
        this.animationId = requestAnimationFrame(this.animate);
    }
}

/**
 * Класс для управления последовательностью анимаций
 */
class AnimationSequence {
    constructor(animations) {
        this.animations = animations;
        this.currentIndex = 0;
        this.isRunning = false;

        console.log('[AnimationSequence] Создана последовательность с', animations.length, 'анимациями');
    }

    /**
     * Запуск последовательности анимаций
     */
    start() {
        if (this.isRunning) {
            console.log('[AnimationSequence] Последовательность уже запущена');
            return;
        }

        this.isRunning = true;
        this.currentIndex = 0;
        console.log('[AnimationSequence] Запуск последовательности');
        this.startCurrentAnimation();
    }

    /**
     * Запуск текущей анимации
     */
    startCurrentAnimation() {
        if (this.currentIndex >= this.animations.length) {
            // Все анимации завершены, начинаем с начала
            console.log('[AnimationSequence] Все анимации завершены, начинаем заново');
            this.currentIndex = 0;
        }

        const currentAnimation = this.animations[this.currentIndex];
        console.log('[AnimationSequence] Запуск анимации', this.currentIndex + 1, 'из', this.animations.length);

        // Устанавливаем колбэк на завершение цикла
        currentAnimation.setOnCycleComplete(() => {
            console.log('[AnimationSequence] Анимация', this.currentIndex + 1, 'завершила цикл');

            // Останавливаем текущую анимацию
            currentAnimation.stop();
            currentAnimation.reset();

            // Переходим к следующей анимации
            this.currentIndex++;
            this.startCurrentAnimation();
        });

        // Запускаем текущую анимацию
        currentAnimation.start();
    }

    /**
     * Остановка последовательности
     */
    stop() {
        this.isRunning = false;
        this.animations.forEach(anim => {
            anim.stop();
            anim.reset();
        });
        console.log('[AnimationSequence] Последовательность остановлена');
    }
}

// ============================================
// Инициализация анимаций
// ============================================

// Первая анимация
const animation1 = new PathAnimation({
    name: 'Animation1',
    pathId: 'fullPathFromListToPerformer',
    animatedPathId: 'animatedPathFromListToPerformer',
    circleId: 'movingCircleFromListToPerformer',
    gradientId: 'paint0_linear_2004_1241',
    endCircleId: 'endCirclePerformer',
    duration: 4000,
    trailLength: 60,
    pauseDuration: 5000,
    activeColor: '#5BA3F5',
    inactiveColor: '#D0D0D0',
    debug: true
});

// Вторая анимация
const animation2 = new PathAnimation({
    name: 'Animation2',
    pathId: 'fullPathFromSearchASpecialistToList',
    animatedPathId: 'animatedPathFromSearchASpecialistToList',
    circleId: 'movingCircleFromSearchASpecialistToList',
    gradientId: 'linear-2',
    endCircleId: 'endCircleList',
    duration: 3000,
    trailLength: 60,
    pauseDuration: 3000,
    reverse: false,  // Движение от начала к концу (прямое направление)
    activeColor: '#5BA3F5',
    inactiveColor: '#D0D0D0',
    debug: true
});

const animation3 = new PathAnimation({
    name: 'Animation3',
    pathId: 'fullPathFromCheckConditionToSearchDocument',
    animatedPathId: 'animatedPathFromCheckConditionToSearchDocument',
    circleId: 'movingCircleFromCheckConditionToSearchDocument',
    gradientId: 'left-linear-1',
    endCircleId: 'endCircleSearchDocument',
    duration: 3000,
    trailLength: 60,
    pauseDuration: 3000,
    reverse: false,  // Движение от начала к концу (прямое направление)
    activeColor: '#5BA3F5',
    inactiveColor: '#D0D0D0',
    debug: true
});

const animation4 = new PathAnimation({
    name: 'Animation4',
    pathId: 'fullPathFromSearchDocumentToFound',
    animatedPathId: 'animatedPathFromSearchDocumentToFound',
    circleId: 'movingCircleFromSearchDocumentToFound',
    gradientId: 'left-linear-2',
    endCircleId: 'endCircleDocumentFound',
    duration: 4000,
    trailLength: 60,
    pauseDuration: 5000,
    reverse: true,  // Движение от начала к концу (прямое направление)
    activeColor: '#5BA3F5',
    inactiveColor: '#D0D0D0',
    debug: true
});

animation1.start();
animation2.start();
animation3.start();
animation4.start();