# Pipeline

> [!IMPORTANT]  
> **Goal:** Create CI/CD pipeline with Jenkins

---

### Setup Cluster

Delete existing cluster
> $ k3d cluster delete <CLUSTER_NAME>
```
k3d cluster delete my-cluster
```

Create new cluster with expose loadbalancer port
```
k3d cluster create my-cluster --servers 1 --agents 3 --port "8888:80@loadbalancer" --port "8889:443@loadbalancer"
```

---

### Deploy Jenkins in machine

Create `Dockerfile`
```
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
```

Create `docker-compose.yml`
```
version: '3.7'
services:
  jenkins:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - 5555:8080
      - 50000:50000
    volumes:
      - ./jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
```

Start Jenkins
```
docker compose up
```

Go to http://localhost:5555

Copy your container id by `docker ps | grep jenkins`

Get your password by replace `<CONTAINER_ID>` with output form `docker ps | grep jenkins`

```
docker exec <CONTAINER_ID> cat /var/jenkins_home/secrets/initialAdminPassword
```

Choosing install suggested plugin and waiting 5 minutes

Filling username, password, full name and email 

Setting Jenkins URL: `http://localhost:5555/` (by default)

---

### Add docker hub credential

Go to http://localhost:5555/manage/credentials/store/system/domain/_/

Click `Add credential` button

- Kind: Username with password
- Scope: Global
- Username: `YOUR_DOCKER_HUB_USER`
- Password: `YOUR_DOCKER_HUB_PASSWORD`
- ID: docker_hub
- Description: docker hub

---

### Setup CI pipeline

On first page click `+ New Item` menu

Enter pipeline name

Click Pipeline option and submit 

then input code to pipeline script
```
pipeline {
    agent any

    stages {
        stage('Checkout code') {
            steps {
              git branch: 'main', url: 'https://github.com/srankmeng/my-k8s-traning.git'
            }
        }
        stage('Code analysis') {
            steps {
                echo 'Code analysis'
            }
        }
        stage('Unit test') {
            steps {
                echo 'Unit test'
            }
        }
        stage('Code coverage') {
            steps {
                echo 'Code coverage'
            }
        }
        stage('Build images') {
            steps {
                sh 'docker compose -f ./workshops/12_pipeline/json-server/docker-compose.yml build'
            }
        }
        stage('Setup & Provisioning') {
            steps {
                sh 'docker compose -f ./workshops/12_pipeline/json-server/docker-compose.yml up -d'
            }
        }
        stage('Run api automate test') {
            steps {
                sh 'docker compose -f ./workshops/12_pipeline/newman/docker-compose.yml up --build'
            }
        }
        stage('Push Docker Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker_hub'
                , passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                    sh '''docker image tag my_json_server:1.0 $DOCKER_USER/my_json_server:$BUILD_NUMBER
                          docker image push $DOCKER_USER/my_json_server:$BUILD_NUMBER'''
                }        
            }
        }
    }
    post {
        always {
            sh 'docker compose -f ./workshops/12_pipeline/json-server/docker-compose.yml down'
        }
    }
}
```

---

### Clean cluster

Delete cluster
```
k3d cluster delete my-cluster
```
