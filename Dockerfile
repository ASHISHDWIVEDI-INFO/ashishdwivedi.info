# FROM nginx:alpine

# # Copy website files into nginx folder
# COPY . /usr/share/nginx/html

# # Expose port 80
# EXPOSE 80

# # Start nginx (default)
# CMD ["nginx", "-g", "daemon off;"]

FROM nginx:alpine

COPY src/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
