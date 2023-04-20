FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# install yarn
RUN npm install -g yarn --force

RUN yarn install
# If you are building your code for production
# RUN npm ci --omit=dev

# environment
ENV NODE_ENV=production

# Bundle app source
COPY . .

# build
RUN yarn build