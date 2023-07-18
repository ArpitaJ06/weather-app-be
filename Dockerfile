FROM node:14

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json /app/

# Install the dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY . /app

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["node", "app.js"]