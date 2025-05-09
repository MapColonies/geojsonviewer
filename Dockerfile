# Stage 1: Build the React application
FROM node:23 AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the React application
RUN npm run build

# Stage 2: Serve the built application using a lightweight web server
FROM nginxinc/nginx-unprivileged:1.24.0-alpine3.17 as deploy
USER root

# Copy the built files from the builder stage
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
RUN chmod -R g+r /usr/share/nginx/html/

# Copy the custom Nginx configuration file
# COPY ./default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 8080

# Command to run the application
# CMD ["nginx", "-g", "daemon off;"]
