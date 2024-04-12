# LoadBalancer

> [!IMPORTANT]  
> **Goal:** Create service with **LoadBalancer** type and connecting from external

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

### Create NodePort service type

Create `service.yml`
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-nginx # has to match .spec.template.metadata.labels.app
  template:
    metadata:
      labels:
        app: my-nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.24.0
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: LoadBalancer
  selector:
    app: my-nginx # has to match .spec.template.metadata.labels.app on kind: Deployment
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      # nodePort: 30080 # range (30000-32767)
```

Apply
```
kubectl apply -f service.yml 
```

Get all
```
kubectl get all
```
or
```
kubectl get service
```

:computer: output:
```
NAME                    TYPE           CLUSTER-IP     EXTERNAL-IP                                               PORT(S)        AGE
service/kubernetes      ClusterIP      10.43.0.1      <none>                                                    443/TCP        53s
service/nginx-service   LoadBalancer   10.43.146.28   192.168.172.2,192.168.172.3,192.168.172.4,192.168.172.5   80:31281/TCP   22s
```
Checking `TYPE` and `EXTERNAL-IP`

Go to: http://localhost:8888

Should see nginx page

---

### Clean cluster

Delete cluster
```
k3d cluster delete my-cluster
```
