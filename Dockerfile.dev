# Base image for the container
FROM node:20.16.0

# Copy files and install dependencies
WORKDIR /app/
COPY . ./
RUN npm ci && \
  npm run build

# RUN PRISMA GENERATE
RUN npx prisma generate

LABEL maintainer="Kent Caparas<kentcaparas12@gmail.com>"
LABEL description="Docker image to run Task command line backend"
LABEL version="1.0" 

# Run in dev mode, `npm run serve` for production
# CMD ["npm", "run", "serve", "--no-update-notifier", "--max-old-space-size=50"]
CMD ["npm", "run", "serve", "--no-update-notifier", "--max-old-space-size=50"]
