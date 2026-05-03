FROM nginx:alpine

# Nginx varsayılan ayarlarını temizle ve bizim güvenli ayarımızı kopyala
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tüm html, js, css dosyalarını Nginx'in root dizinine kopyala
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
