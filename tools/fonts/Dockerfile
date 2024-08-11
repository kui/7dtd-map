FROM ubuntu:24.04

RUN apt-get update \
 && apt-get install --no-install-recommends -y locales fonttools \
 && rm -rf /var/lib/apt/lists/* \
 && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8
