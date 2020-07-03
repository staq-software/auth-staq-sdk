FROM ubuntu
COPY . .
ENV BUILD_TOKEN=poo
RUN export URL=`echo 'git@gitlab.com:tv-tsb/tooling/js-oauth-client.git' | sed -e "s/https:\/\/gitlab-ci-token:.*@//g"`
RUN echo "https://gitlab-ci-token:${BUILD_TOKEN}@${URL}"
RUN sed -i 's/git+ssh:\/\/git@gitlab.com:/git+https:\/\/gitlab-ci-token:'$BUILD_TOKEN'@gitlab.gitlab.com\//' ./package.json
RUN cat ./package.json
