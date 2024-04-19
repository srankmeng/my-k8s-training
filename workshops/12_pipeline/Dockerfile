FROM jenkins/jenkins:lts

USER root

# Reference :: https://docs.docker.com/engine/install/debian/
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update
RUN apt-get update -qq && apt-get install -qqy docker-ce docker-ce-cli containerd.io

# Install kubectl
RUN curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl && \
    chmod +x ./kubectl && \
    mv ./kubectl /usr/local/bin/kubectl | bash

RUN jenkins-plugin-cli \
    --plugins \
    build-timeout \
    credentials-binding \
    timestamper \
    ws-cleanup \
    workflow-aggregator \
    github-branch-source \
    pipeline-stage-view \
    git \
    ssh-slaves \
    matrix-auth
