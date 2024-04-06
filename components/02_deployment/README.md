# Deployment

### Apply Deployment

Create `deployment.yml`
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-nginx
  template:
    metadata:
      labels:
        app: my-nginx
    spec:
      containers:
      - name: my-nginx
        image: nginx:1.24.0
        ports:
        - containerPort: 80
```

Apply deployment
```
kubectl apply -f deployment.yml
```

View deployment
```
kubectl get deployment 
```
or
```
kubectl get all 
```

:computer: output:
```
NAME                                    READY   STATUS    RESTARTS   AGE
pod/nginx-deployment-7696657957-5xmp5   1/1     Running   0          11s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.43.0.1    <none>        443/TCP   145m

NAME                               READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/nginx-deployment   1/1     1            1           11s

NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/nginx-deployment-7696657957   1         1         1       11s
```

View pod and check **Controlld By**
```
kubectl describe pod nginx-deployment-7696657957-5xmp5
```

Get replicaSet and describe for check **Controlld By**
```
kubectl get replicaSets
```
```
kubectl describe replicaSets nginx-deployment-7696657957 
```
---
### Change image tag
Edit `deployment.yml` from `image: nginx:1.24.0` to `image: nginx:1.25.4`

Apply
```
kubectl apply -f deployment.yml
```

Get all
```
kubectl get all
```

:computer: output:
```
NAME                                    READY   STATUS    RESTARTS   AGE
pod/nginx-deployment-7f75c55cbd-5gg8z   1/1     Running   0          22s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.43.0.1    <none>        443/TCP   163m

NAME                               READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/nginx-deployment   1/1     1            1           18m

NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/nginx-deployment-7f75c55cbd   1         1         1       22s
replicaset.apps/nginx-deployment-7696657957   0         0         0       18m
```
Notice pod and replicaset, it created new **replicaset** and **pod**


Describe deployment
```
kubectl describe deployment nginx-deployment
```

:computer: output:
```
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  21m    deployment-controller  Scaled up replica set nginx-deployment-7696657957 to 1
  Normal  ScalingReplicaSet  3m9s   deployment-controller  Scaled up replica set nginx-deployment-7f75c55cbd to 1
  Normal  ScalingReplicaSet  2m54s  deployment-controller  Scaled down replica set nginx-deployment-7696657957 to 0 from 1
```
---

### Update Replica 

Edit `deployment.yml` from `replicas: 1` to `replicas: 3`

Apply
```
kubectl apply -f deployment.yml
```

Get all
```
kubectl get all
```

:computer: output:
```
NAME                                    READY   STATUS    RESTARTS   AGE
pod/nginx-deployment-7f75c55cbd-5gg8z   1/1     Running   0          6m14s
pod/nginx-deployment-7f75c55cbd-hnlvf   1/1     Running   0          26s
pod/nginx-deployment-7f75c55cbd-vmthl   1/1     Running   0          26s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.43.0.1    <none>        443/TCP   169m

NAME                               READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/nginx-deployment   3/3     3            3           24m

NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/nginx-deployment-7696657957   0         0         0       24m
replicaset.apps/nginx-deployment-7f75c55cbd   3         3         3       6m14s
```

Describe deployment
```
kubectl describe deployment nginx-deployment
```

:computer: output:
```
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  26m    deployment-controller  Scaled up replica set nginx-deployment-7696657957 to 1
  Normal  ScalingReplicaSet  8m22s  deployment-controller  Scaled up replica set nginx-deployment-7f75c55cbd to 1
  Normal  ScalingReplicaSet  8m7s   deployment-controller  Scaled down replica set nginx-deployment-7696657957 to 0 from 1
  Normal  ScalingReplicaSet  2m34s  deployment-controller  Scaled up replica set nginx-deployment-7f75c55cbd to 3 from 1
```
---
### Diagram

![diagram](/images/components/02_deployment/diagram.png)
