# RBAC

> [!IMPORTANT]  
> **Goal:** 
> - Create Viewer account
> - Viewer account can list all namespaces
> - Viewer account can view all resources on nginx-domain namespaces only

---

### Setup Cluster

Use result cluster from `07_namespace` workshop

---

## Setup User, Role and Binding

### Create Viewer Service Account

Create `viewer_sa.yml`
```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: viewer
  namespace: default
---
apiVersion: v1
kind: Secret
metadata:
  name: viewer-secret
  namespace: default
  annotations:
    kubernetes.io/service-account.name: viewer
type: kubernetes.io/service-account-token
```

Apply viewer service account
```
kubectl apply -f viewer_sa.yml
```

Get service account
```
kubectl get serviceaccount
```
or
```
kubectl get sa
```

---

### Create ClusterRole for list all namespaces

Custom resources and apiGroups that you want, view all [resource type list](https://kubernetes.io/docs/reference/kubectl/#resource-types), view all [verbs](https://kubernetes.io/docs/reference/access-authn-authz/authorization/#determine-the-request-verb)

Create `list_ns_cluster_role.yml`
```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: list-all-namespaces
rules:
- apiGroups:
  - ""
  resources:
  - namespaces
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: list-all-namespaces-clusterrolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: list-all-namespaces
subjects:
- kind: ServiceAccount
  name: viewer
  namespace: default
```

Apply Cluster Role for list all namespaces
```
kubectl apply -f list_ns_cluster_role.yml
```

Get Cluster Role & Clsuer Role binding
```
kubectl get clusterrole
```
and
```
kubectl get clusterrolebinding
```

---

### Create Role for view all resources on nginx-domain namespaces only

Create `view_only_nginx_role.yml`
```
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: view-only-role
  namespace: nginx-domain
rules:
- apiGroups:
  - ""
  - apps
  resources:
  - "*"
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: view-only-rolebinding
  namespace: nginx-domain
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: view-only-role
subjects:
- kind: ServiceAccount
  name: viewer
  namespace: default
```

Apply Cluster Role for list all namespaces
```
kubectl apply -f view_only_nginx_role.yml
```

Get Role & Role binding
```
kubectl get role -n nginx-domain
```
and
```
kubectl get rolebinding -n nginx-domain
```

Now you setup user, role, and binding already done, go to next step

---
![context](context.png)
---

## Update Context with KubeConfig

Context include 3 things are cluster, user and namespace.

Let's setup context with new `kubeConfig` file

Checking current context
```
kubectl config get-contexts
```

### Create Cluster on Context

Create `ca.crt`
```
kubectl get secret viewer-secret -n default -o "jsonpath={.data['ca\.crt']}" | base64 -D > ca.crt 
```

Get server host
```
kubectl cluster-info
```
Copy host address, for example: `https://0.0.0.0:65395`

Setting Cluster on Context
> kubectl config --kubeconfig=<FILE_NAME> set-cluster <CLUSTER_NAME> --server=<IP_HOST> --certificate-authority=<PATH_CERT_FILE> --embed-certs=true
```
kubectl config --kubeconfig=demo-config set-cluster k3d-my-cluster --server=https://0.0.0.0:65395 --certificate-authority=ca.crt --embed-certs=true
```

File `demo-config` was created, in file cluster part have informations
```
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tL ...
    server: https://0.0.0.0:65395
  name: k3d-my-cluster
contexts: null
current-context: ""
kind: Config
preferences: {}
users: null
```

---

### Create User on Context

Get user token
```
kubectl get secret viewer_secret -n default -o "jsonpath={.data.token}" | base64 -d
```
Copy result (not include % sign)

Setting User on Context
> kubectl config --kubeconfig=<FILE_NAME> set-credentials <USER_NAME> --token=<USER_TOKEN>
```
kubectl config --kubeconfig=demo-config set-credentials viewer --token=eyJhbGciOiJSUzI1NiIsImtpZCI6InBfOEFYaEFYWFBHNXhseXZjZGFPeTdIdkhjZmxPQXRvQ1ZoZ2piZkFjMFEifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6InZpZXdlci1zZWNyZXQiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoidmlld2VyIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiYzg2YTAwNjEtN2ExYy00YmQ2LThjM2UtNDkzZDczZjRhZjM1Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6dmlld2VyIn0.snF-4C6uyHOVBigBYHFd2SwInyNWwrSREA7bcOgl-xRARjIQWO_RA2zV1ADUCTy0lVMK-eRu1oLMsSYt9cqVw7z7WolQafbLAOhtS8mAM0-HhkHxBB061xrMS-RMPEJYG9SJGzyATD4glC00loDU2xNtJXFXSOtDjSZ2zqDTZUeKaZ23FDM5tBHE_oqUft7dYx4HQAUGuhC1DOzR3HmKMIHKgHGLkACQSeabqnMeMaahklsmHQBRJNAhN1NxUSb4AKL-tfrJjxKoYBCVGoBIDJyftmFJf8K2cnbHgFAfXN6NseX-2Sr_WdX43AnFZW0cYVuSv6bRPvt1n01s51KrVw
```

Back to `demo-config`, user part have informations
```
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tL ...
    server: https://0.0.0.0:65395
  name: k3d-my-cluster
contexts: null
current-context: ""
kind: Config
preferences: {}
users:
- name: viewer
  user:
    token: eyJhbGc ...
```

---

### Set Viewer Context
Set Context
> kubectl config --kubeconfig=<FILE_NAME> set-context <CONTEXT_NAME> --cluster <CLUSTER_NAME> --user <USER_NAME>
```
kubectl config --kubeconfig=demo-config set-context viewer-context --cluster k3d-my-cluster --user viewer
```

Back to `demo-config`
```
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tL ...
    server: https://0.0.0.0:65395
  name: k3d-my-cluster
- context:
    cluster: k3d-my-cluster
    user: viewer
  name: viewer-context
current-context: ""
kind: Config
preferences: {}
users:
- name: viewer
  user:
    token: eyJhbGc ...
```

Check contexts
```
kubectl config --kubeconfig=demo-config get-contexts
```

Use contexts
```
kubectl config --kubeconfig=demo-config use-context viewer-context
```

Check contexts again
```
kubectl config --kubeconfig=demo-config get-contexts
```

View config
```
kubectl config --kubeconfig=demo-config view
```

View raw config
```
kubectl config --kubeconfig=demo-config view --raw
```

View current context only
```
kubectl config --kubeconfig=demo-config view --minify
```

---

### Checking list namespaces and view resources on nginx-domain namespace

View all namespaces
```
kubectl --kubeconfig=demo-config get namespace
```

:computer: output:
```
NAME              STATUS   AGE
default           Active   23h
kube-system       Active   23h
kube-public       Active   23h
kube-node-lease   Active   23h
nginx-domain   Active   23h
apache-domain   Active   23h
```

View resources on nginx-domain namespace
```
kubectl --kubeconfig=demo-config get pod -n nginx-domain
```

:computer: output:
```
NAME                                READY   STATUS    RESTARTS   AGE
my-deployment-6db86d5f4b-jnqlb      1/1     Running   0          22h
my-deployment-6db86d5f4b-bvkps      1/1     Running   0          22h
my-deployment-6db86d5f4b-pv5cj      1/1     Running   0          22h
```

View resources on apache-domain namespace
```
kubectl --kubeconfig=demo-config get pod -n apache-domain
```

:computer: output:
```
Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:default:viewer" cannot list resource "pods" in API group "" in the namespace "apache-domain"
```

Modified resources on nginx-domain namespace
```
kubectl --kubeconfig=demo-config edit deployment my-deployment -n nginx-domain
```
```
...

spec:
  progressDeadlineSeconds: 600
  replicas: 3       <=============== Change here to 4
  revisionHistoryLimit: 10
  selector:

...
```

:computer: output:
```
error: deployments.apps "my-deployment" could not be patched: deployments.apps "my-deployment" is forbidden: User "system:serviceaccount:default:viewer" cannot patch resource "deployments" in API group "apps" in the namespace "nginx-domain"
```
Cannot update deployment

---

### Clean cluster

Delete cluster
```
k3d cluster delete my-cluster
```