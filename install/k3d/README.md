# K3d
Websit: https://k3d.io/

## Install K3d

### Macos

Run command
```
brew install k3d
```

### Windows

The easiest way to get k3d running on Windows is with Chocolatey. To install Chocolatey you can run the following from an administrative PowerShell instance:

```shell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```

Now close PowerShell and open a new administrative instance and run the following to install k3d and a couple other useful tools:

```shell
choco install k3d -y
choco install jq -y
choco install yq -y
choco install kubernetes-helm -y
```

## Using k3d

Start a new PowerShell instance (doesn’t need to be administrative this time around). Now that you have the k3d binary on your path, you can create a cluster by running:

```shell
k3d cluster create localk8s
```

try to create cluster for this workshop

```shell
k3d cluster create my-cluster --servers 1 --agents 3
```

Setting taint for prevent pod deploy master node (k3d not set by default)
```
kubectl taint node k3d-my-cluster-server-0 node-role.kubernetes.io/master:NoSchedule
```
