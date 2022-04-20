FROM node:16-buster as base

RUN apt-get update && apt-get install awscli unzip -y

RUN npm i -g zx

# these shouldn't really be needed, not sure why they are...
RUN npm i -g aws-cdk
RUN npm i -g ts-node
RUN npm i -g typescript

WORKDIR /work

COPY Shared.mjs Shared.mjs
COPY Deploy.mjs Deploy.mjs

FROM base as run

ENV AWS_ACCESS_KEY_ID=
ENV AWS_SECRET_ACCESS_KEY=
ENV AWS_ACCOUNT=
ENV AWS_REGION=
ENV APP_ENV=
ENV COLOUR=
ENV MANIFEST_S3_PATH=
ENV DEPLOYED_CONFIG_S3_PATH=

CMD zx Deploy.mjs
