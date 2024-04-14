# HELM

> [!IMPORTANT]  
> **Goal:** Create Wordpress with HELM

Ref: https://artifacthub.io/packages/helm/bitnami/wordpress#wordpress-configuration-parameters

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

### Install HELM
https://helm.sh/docs/intro/install/


### Install Wordpress with HELM
Install wordpress with HELM
```
helm install my-wordpress oci://registry-1.docker.io/bitnamicharts/wordpress
```

Check helm
```
helm ls
```

Checking pod running 
```
kubectl get pod -w
```

Checking all resources
```
kubectl get all
```
or
```
kubectl get all -l 'app.kubernetes.io/instance in (my-wordpress)'
```

:computer: output:
```
NAME                               READY   STATUS    RESTARTS   AGE
pod/my-wordpress-mariadb-0         1/1     Running   0          2m10s
pod/my-wordpress-b954cc6c4-m9twk   1/1     Running   0          2m10s

NAME                           TYPE           CLUSTER-IP     EXTERNAL-IP                                               PORT(S)                      AGE
service/kubernetes             ClusterIP      10.43.0.1      <none>                                                    443/TCP                      3m4s
service/my-wordpress-mariadb   ClusterIP      10.43.112.37   <none>                                                    3306/TCP                     2m11s
service/my-wordpress           LoadBalancer   10.43.60.134   192.168.165.2,192.168.165.3,192.168.165.4,192.168.165.5   80:30577/TCP,443:30499/TCP   2m11s

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-wordpress   1/1     1            1           2m11s

NAME                                     DESIRED   CURRENT   READY   AGE
replicaset.apps/my-wordpress-b954cc6c4   1         1         1       2m11s

NAME                                    READY   AGE
statefulset.apps/my-wordpress-mariadb   1/1     2m11s
```

Get Secret
```
kubectl get secret
```

Get ConfigMap
```
kubectl get configmap
```

Get Persistent Volume
```
kubectl get pv
```

Get Persistent Volume Claim
```
kubectl get pvc
```

Go to http://localhost:8888/ for landing page

Go to http://localhost:8888/wp-admin/ for admin page

> if LoadBalancer EXTERNAL-IP is pending for long time, try this `kubectl port-forward service/my-wordpress 8881:80` and go to http://localhost:8881 instead

Username: user

Password:
```
echo Password: $(kubectl get secret --namespace default my-wordpress -o jsonpath="{.data.wordpress-password}" | base64 -d)
```

View all manifest
```
helm get manifest my-wordpress
```

---

### Uninstall Wordpress

Helm uninstall
```
helm uninstall my-wordpress
```

Check Wordpress was deleted
```
helm ls
```

Get all
```
kubectl get all
```
Resoures about wordpress were deleted

---

### Clean cluster

Delete cluster
```
k3d cluster delete my-cluster
```
