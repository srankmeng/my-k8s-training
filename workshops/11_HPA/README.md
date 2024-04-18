# HPA (Horizontal Pod Autoscaler)

> [!IMPORTANT]  
> **Goal:** Scaling apache pods with HPA

---

### Setup Cluster

Use result cluster from `10_monitoring` workshop

---

### Deploy Apache app
Create `apache.yml`
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  selector:
    matchLabels:
      run: php-apache
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        image: registry.k8s.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m
---
apiVersion: v1
kind: Service
metadata:
  name: php-apache
  labels:
    run: php-apache
spec:
  ports:
  - port: 80
  selector:
    run: php-apache
```

Apply
```
kubectl apply -f apache.yml
```

Get pods
```
kubectl get pods
```

:computer: output:
```
NAME                                    READY   STATUS    RESTARTS      AGE
php-apache-5bdbb8dbf8-msb6f             1/1     Running   0             21s
```
There is **1 pod** for php-apache

---

### Create HPA
Create `hpa.yml`
```
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 50
```

Apply HPA
```
kubectl apply -f hpa.yml
```

Get HPA
```
kubectl get hpa
```

:computer: output:
```
NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%    2         10        2          75s
```
> if TARGETS is \<unknown\>/50%  wait for a moment and run again


Get pods
```
kubectl get pods
```

:computer: output:
```
NAME                                    READY   STATUS    RESTARTS      AGE
php-apache-5bdbb8dbf8-msb6f             1/1     Running   0             3m42s
php-apache-5bdbb8dbf8-9x44n             1/1     Running   0             20s
```
There are **2 pods** for php-apache

---

### Increase the load

Run this in a separate terminal
```
kubectl run -it load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://php-apache; done"
```
Hit enter for the command prompt, The word “OK! OK! OK! OK!…”

Watch HPA
```
kubectl get hpa php-apache --watch
```

:computer: output:
```
NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%    2         10        2          84m
php-apache   Deployment/php-apache   26%/50%   2         10        2          84m
php-apache   Deployment/php-apache   135%/50%   2         10        2          84m
php-apache   Deployment/php-apache   138%/50%   2         10        4          85m
php-apache   Deployment/php-apache   101%/50%   2         10        6          85m
php-apache   Deployment/php-apache   59%/50%    2         10        6          85m
php-apache   Deployment/php-apache   50%/50%    2         10        6          85m
```

Watch Deployment for check numbers of pods
```
kubectl get deployment php-apache -w
```

:computer: output:
```
NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
php-apache             6/6     6            6           11m
```

Stopping load and wait for minutes check hpa and deployments again

---

### Go to Grafana for view dashboard (optional)

Create new panel with query
```
sum (rate(container_cpu_usage_seconds_total{pod!=""}[1m])) by (pod, kubernetes_io_hostname) 
```

---

### Clean cluster

Delete cluster
```
k3d cluster delete my-cluster
```
