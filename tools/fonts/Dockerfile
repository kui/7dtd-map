FROM ubuntu:24.04

RUN apt-get update \
 && apt-get install --no-install-recommends -y fonttools=4.46.0-1build2 \
 && rm -rf /var/lib/apt/lists/* \
ENV LANG en_US.utf8

ARG USER_ID
ARG GROUP_ID
RUN id -ng 1000 2>/dev/null || groupadd --gid $GROUP_ID fonttools
run id -nu 1000 2>/dev/null || useradd --home-dir /work --create-home \
        --uid $USER_ID --gid $GROUP_ID \
        --no-log-init \
        fonttools
