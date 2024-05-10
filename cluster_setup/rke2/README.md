# Cluster setup by RKE2

Ref
- https://docs.rke2.io/install/quickstart
- https://github.com/mevijays/training-k8s/blob/main/docs/rke2.md

> [!NOTE]  
> All nodes must be same network.

--- 

### Master node setup

Use root user
```
sudo su -
```

Install RKE2 for master node
```
curl -sfL https://get.rke2.io | sh -
```

Enable RKE2 for master node
```
systemctl enable rke2-server.service
```

Modified config
```
mkdir -p /etc/rancher/rke2
```
```
nano /etc/rancher/rke2/config.yaml
```

Update `config.yaml` file
```
write-kubeconfig-mode: "0644"
```

Start RKE2 for master node
```
systemctl start rke2-server.service
```

Set RKE2 path
```
export PATH=$PATH:/var/lib/rancher/rke2/bin/
```

Copy kube config
```
mkdir -p $HOME/.kube
sudo cp -i /etc/rancher/rke2/rke2.yaml $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Generate token for worker node
```
cat /var/lib/rancher/rke2/server/node-token
```

Checking 
```
kubectl get node
```

---

### Worker node setup

Use root user
```
sudo su -
```

Install RKE2 for worker node
```
curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE="agent" sh -
```

Enable RKE2 for worker node
```
systemctl enable rke2-agent.service
```

Modified config
```
mkdir -p /etc/rancher/rke2
```
```
nano /etc/rancher/rke2/config.yaml
```

Update `config.yaml` file

**Replace**
- `<MASTER_NODE_IP>` with master node ip for example `174.138.23.185`
- `<TOKEN>` with generate token from master node setup for example `xxxxx::server:yyyy`
```
server: https://<MASTER_NODE_IP>:9345
token: <TOKEN>
```

Start RKE2 for worker node
```
systemctl start rke2-agent.service
```

Checking on **Master node**
```
kubectl get node
```

> [!NOTE]  
> If node status is not ready maybe memory spec not enough, please up spec

---

### Cluster Clear
Run this command all of nodes (master & worker)
```
/usr/local/bin/rke2-uninstall.sh
``` 
