FROM node:16-buster as base

###############################

WORKDIR /trigger

COPY trigger/package.json ./
COPY trigger/package-lock.json ./

RUN npm install

###############################

WORKDIR /trigger-dist

COPY trigger/package.json ./
COPY trigger/package-lock.json ./

RUN npm install --production

###############################

WORKDIR /pipeline

COPY pipeline/package.json ./
COPY pipeline/package-lock.json ./

RUN npm install

###############################

WORKDIR /trigger

COPY trigger ./

RUN npm run build

RUN cp -r /trigger/src/* /trigger-dist

###############################

WORKDIR /pipeline

COPY pipeline ./

###############################

FROM base as bootstrap

ENV PIPELINE_ENV=
ENV PIPELINE_GIT_REF=
ENV PIPELINE_GITHUB_TOKEN=
ENV REPOSITORY=
ENV AWS_ACCESS_KEY_ID=
ENV AWS_SECRET_ACCESS_KEY=
ENV AWS_ACCOUNT=
ENV AWS_REGION=

CMD npx cdk bootstrap && npx cdk deploy guitarapp-bootstrap -f --require-approval never

###############################

FROM base as diff

ENV PIPELINE_ENV=
ENV PIPELINE_GIT_REF=
ENV PIPELINE_GITHUB_TOKEN=
ENV REPOSITORY=
ENV AWS_ACCESS_KEY_ID=
ENV AWS_SECRET_ACCESS_KEY=
ENV AWS_ACCOUNT=
ENV AWS_REGION=

CMD npx cdk diff guitarapp-pipeline-$PIPELINE_ENV

###############################

FROM base as deploy

ENV PIPELINE_ENV=
ENV PIPELINE_GIT_REF=
ENV PIPELINE_GITHUB_TOKEN=
ENV REPOSITORY=
ENV AWS_ACCESS_KEY_ID=
ENV AWS_SECRET_ACCESS_KEY=
ENV AWS_ACCOUNT=
ENV AWS_REGION=

RUN mkdir /pipeline-state

CMD npx cdk deploy guitarapp-pipeline-$PIPELINE_ENV -f --require-approval never
#CMD npx cdk destroy guitarapp-pipeline-$PIPELINE_ENV -f
