# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app's dependencies
RUN npm install

# Bundle the app source
COPY . .

# Expose the app's port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:dev"]
