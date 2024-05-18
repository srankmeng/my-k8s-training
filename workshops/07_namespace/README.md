# Namespace

> [!IMPORTANT]  
> **Goal:** Create application on 2 namespaces separate by domain name

![diagram](diagram.png)

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

### Create namespaces

List
```
kubectl get namespace
```
or
```
kubectl get ns
```

:computer: output:
```
NAME              STATUS   AGE
default           Active   3h57m
kube-system       Active   3h57m
kube-public       Active   3h57m
kube-node-lease   Active   3h57m
```

Create `namespace.yml`
```
apiVersion: v1
kind: Namespace
metadata:
  name: dev-environment
  labels:
    name: dev-environment
---
apiVersion: v1
kind: Namespace
metadata:
  name: uat-environment
  labels:
    name: uat-environment
```

Apply namespace
```
kubectl apply -f namespace.yml
```
---

### Create nginx on namespace dev-environment

Create `service_nginx.yml`
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
  labels:
    app: my-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-web # has to match .spec.template.metadata.labels.app
  template:
    metadata:
      labels:
        app: my-web
    spec:
      containers:
      - name: web
        image: nginx:1.24.0
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP
  selector:
    app: my-web # has to match .spec.template.metadata.labels.app on kind: Deployment
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

Apply nginx with dev-environment namespace 
```
kubectl apply -f service_nginx.yml --namespace dev-environment
```

Get all with dev-environment namespace
```
kubectl get all --namespace dev-environment
```

Check resource in uat-environment
```
kubectl get all --namespace uat-environment
```
Should be have not any resources

---

### Create nginx on namespace uat-environment
Apply nginx with uat-environment namespace 
```
kubectl apply -f service_nginx.yml --namespace uat-environment
```

Check resource on uat-environment
```
kubectl get all --namespace uat-environment
```

---

### Create ingress on both namespace

Create `ingress.yml`
```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  namespace: dev-environment
spec:
  rules:
  - host: dev.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  namespace: uat-environment
spec:
  rules:
  - host: uat.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80
```

Apply ingress with both namespaces
```
kubectl apply -f ingress.yml
```

Check ingress
```
kubectl get ingress -n dev-environment
```
```
kubectl get ingress -n uat-environment
```

---

### Config host file for each domain

#### macos
```
sudo nano /etc/hosts
```

```
### add here
127.0.0.1    dev.example.com
127.0.0.1    uat.example.com
```

#### windows
locate to: `C:\Windows\System32\drivers\etc`

```
### add here
127.0.0.1    dev.example.com
127.0.0.1    uat.example.com
```

Try to open browser

http://dev.example.com:8888 and http://uat.example.com:8888

---

### Change my-web pod nginx to apache on namespace uat-environment
Create `service_apache.yml`
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
  labels:
    app: my-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-web # has to match .spec.template.metadata.labels.app
  template:
    metadata:
      labels:
        app: my-web
    spec:
      containers:
      - name: web
        image: httpd:2.4.59      <============= change nginx to httpd
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP
  selector:
    app: my-web # has to match .spec.template.metadata.labels.app on kind: Deployment
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

Apply apache on uat-environment namespace 
```
kubectl apply -f service_apache.yml --namespace uat-environment
```

Try to open browser

- http://dev.example.com:8888 open nginx
- http://uat.example.com:8888 open apache

---

### Helping command

View resources all namespace
```
kubectl get pod --all-namespaces
```
or
```
kubectl get pod -A
```

Setting default namespace
```
kubectl config set-context --current --namespace=dev-environment
```

View current namespace
```
kubectl config get-contexts
```

---

### Clean cluster

> [!WARNING]  
> **Not Clean yet, will be use in next workshop**
