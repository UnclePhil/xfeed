FROM node:lts-alpine
ARG build_arg="-"

ENV DOCKER_CHANNEL stable
ENV DOCKER_VERSION 20.10.9

ENV LOGGER_LEVEL=info
ENV BUILD=$build_arg

#INSTALL DOCKER CLI
RUN apk add --no-cache ca-certificates \
    [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf  \
    set -ex; \
    apk add --no-cache --virtual .fetch-deps \
    curl \
    tar \
    ; \
    \
    apkArch="$(apk --print-arch)"; \
    case "$apkArch" in \
    x86_64) dockerArch='x86_64' ;; \
    armhf) dockerArch='armel' ;; \
    aarch64) dockerArch='aarch64' ;; \
    ppc64le) dockerArch='ppc64le' ;; \
    s390x) dockerArch='s390x' ;; \
    *) echo >&2 "error: unsupported architecture ($apkArch)"; exit 1 ;;\
    esac; \
    \
    if ! curl -fL -o docker.tgz "https://download.docker.com/linux/static/${DOCKER_CHANNEL}/${dockerArch}/docker-${DOCKER_VERSION}.tgz"; then \
    echo >&2 "error: failed to download 'docker-${DOCKER_VERSION}' from '${DOCKER_CHANNEL}' for '${dockerArch}'"; \
    exit 1; \
    fi; \
    \
    tar --extract \
    --file docker.tgz \
    --strip-components 1 \
    --directory /usr/local/bin/ \
    ; \
    rm docker.tgz; \
    \
    apk del .fetch-deps; \
    \
    dockerd -v; \
    docker -v

WORKDIR /app

COPY src/ /app
RUN npm install

VOLUME [ "/var/run/docker.sock" ]

EXPOSE 8000
CMD ["npm", "start"]

