# Use official Node.js LTS version
FROM node:18.14.0

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Install PM2 globally
RUN npm install pm2 -g

# Build the Nest.js app
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the app with PM2
CMD ["pm2-runtime", "start", "dist/main.js", "--", "-i", "max"]
