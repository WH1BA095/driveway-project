FROM php:8.2-fpm-alpine3.19

RUN apk add --no-cache mysql-client && \
    docker-php-ext-install pdo pdo_mysql

RUN mkdir -p /var/run/php /var/www/html && \
    chown -R www-data /var/run/php /var/www/html && \
    chmod -R 755 /var/www/html

COPY php-fpm.conf /usr/local/etc/php-fpm.d/zzz-docker.conf


USER www-data
WORKDIR /var/www/html
EXPOSE 9000
CMD ["php-fpm"]