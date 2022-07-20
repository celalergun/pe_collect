FROM node:lts-alpine
ENV NODE_ENV=production
ENV MBVAR=MalwareBytes
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3003
RUN chown -R node /usr/src/app
USER node
CMD ["node", "app"]
