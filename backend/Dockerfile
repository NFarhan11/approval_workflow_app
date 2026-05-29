FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    postgresql-dev \
    git \
    zip \
    unzip \
    libzip-dev

RUN docker-php-ext-install pdo pdo_pgsql zip pcntl bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --optimize-autoloader --no-dev --no-interaction

EXPOSE 8000

CMD php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
