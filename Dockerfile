# Use a specific version of the Node.js base image
FROM node:14.8-alpine

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose the port your app is listening on (replace 3000 with the actual port)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV MONGO_HOST=mongodb
ENV MONGO_PORT=27017
ENV MONGO_DB=book-rental-app-db

# Start the app
CMD ["node", "app.js"]
