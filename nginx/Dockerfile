FROM nginx:1.28.2-alpine AS runner
RUN rm -rf /usr/share/nginx/html/*

RUN addgroup -S nginx-group && adduser -S nginx-user -G nginx-group

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-group /var/run/nginx.pid

USER nginx-user
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
