FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    nginx \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN rm -rf /var/www/html/*

COPY . /var/www/html

RUN cd /var/www/html && composer install --no-dev --optimize-autoloader

RUN cp /var/www/html/.env.example /var/www/html/.env || true
RUN php /var/www/html/artisan key:generate || true

COPY nginx.conf /etc/nginx/sites-available/default

RUN chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

CMD ["sh", "-c", "php artisan migrate --force && php-fpm && nginx -g 'daemon off;'"]