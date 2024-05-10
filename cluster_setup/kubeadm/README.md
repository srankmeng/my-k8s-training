# Cluster setup by Kubeadm

> [!NOTE]  
> All nodes must be same network.

Steps
1. Setup OS (master & worker nodes)
2. Install Docker (master & worker nodes)
3. Install Kubernetes (master & worker nodes)
4. Setup master node
5. Join worker node to cluster

---

### 1. Setup OS (master & worker nodes)
Disable swap
```
sudo swapoff -a
sudo sed -i 's/^.*swap/#&/' /etc/fstab
```

Add Kernel Parameters
```
sudo tee /etc/modules-load.d/containerd.conf <<EOF
overlay
br_netfilter
EOF
sudo modprobe overlay
sudo modprobe br_netfilter
```

Configure kernel parameters
```
sudo tee /etc/sysctl.d/kubernetes.conf <<EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

sudo sysctl --system
```

---

### 2. Install Docker (master & worker nodes)
Set up Docker's apt repository
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

Install the Docker packages
```
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

### 3. Install Kubernetes (master & worker nodes)

Enter the following to add a signing key in you on Ubuntu
```
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```

Add Software Repositories: Kubernetes is not included in the default repositories. To add them, enter the following
```
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

Configure containerd
```
containerd config default | sudo tee /etc/containerd/config.toml >/dev/null 2>&1
sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml
```

Install Kubeadm
```
sudo apt update   
sudo apt install -y kubeadm=1.28.1-1.1 kubelet=1.28.1-1.1 kubectl=1.28.1-1.1
```

Update kubelet with ip

**Replace** `<NODE_IP>` with current node ip
```
echo "KUBELET_EXTRA_ARGS=--node-ip=<NODE_IP>" | sudo tee /etc/default/kubelet
sudo systemctl daemon-reload
sudo systemctl restart kubelet
sudo systemctl restart containerd
```

---

### 4. Setup master node
Initialize Kubernetes on **Master Node** (master node only)

**Replace** `<MASTER_NODE_IP>` with your master node ip
```
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=<MASTER_NODE_IP>
```

Copy kube config
```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Deploy Network plugin to Cluster
```
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.25.0/manifests/calico.yaml
```

Verify that everything is running
```
kubectl get node
```

---

### 5. Join worker node to cluster
Use command after create master node like this
```
kubeadm join 192.168.1.36:6443 --token 2rmgf8.jvwpidbmo1j2zf9e \
	--discovery-token-ca-cert-hash sha256:2559dfd530c5ed63e6f43334dbe5d1261932112f133ab47be1abdb4218a90076
```
Run on **worker node**
