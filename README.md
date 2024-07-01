# Stress it

A Web GUI for k6

## Installation

```yaml
#npm
npm install

#yarn
yarn install
```

And then initialize `Prisma`

```yaml
#1.
prisma:init
#2.
db:dev
```

```yaml
#npm
npm install

#yarn
yarn install
```

## Install k6 for local dev

following the the instruction in this link:

- https://k6.io/docs/get-started/installation/

## Docker

### Build Image

```yaml
# AMD based cpu
docker build -t stress-it:1.0.0 --build-arg='K6_NAME=k6-v0.48.0-linux-amd64' .
# ARM based cpu
docker build -t stress-it:1.0.0 --build-arg='K6_NAME=k6-v0.48.0-linux-arm64' .
```

## ENV

```yaml
DATABASE_URL = postgres://{user}:{password}@{hostname}:{port}/{database-name}
# use `yarn gen:secret` to get the secret
AUTH_SECRET  =
# Do NOT use same secret from AUTH_SECRET
APP_SECRET =
# GOOGLE OAuth (https://console.cloud.google.com/)
# make sure set redirect url to http://{domain}:{port}/api/auth/callback/google
# for dev, just set it the redirect url to  http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID =
GOOGLE_CLIENT_SECRET =
```

### Update ENV

ENV should be added to three places

1. env var of gitlab ci/cd
2. add the env var to the container env of the app in `deployment.yaml`
3. add to gitlab-ci `variables` in the beginning of the file
