# Grafana

> [!IMPORTANT]  
> **Goal:** Running Grafana with prometheus metric

Ref: https://artifacthub.io/packages/helm/grafana/grafana

![dashboard](dashboard.png)
---

### Setup Cluster

Use result cluster from `10_monitoring/02_prometheus` workshop

---

### Deploying Grafana

Add repository
```
helm repo add grafana https://grafana.github.io/helm-charts
```

Create `Chart.yaml`
```
apiVersion: v2
name: my-grafana-helm
description: A Helm chart for Grafana Demo
type: application
version: 1.0.0

dependencies:
  - name: "grafana"
    alias: grafana
    condition: grafana.enabled
    repository: "https://grafana.github.io/helm-charts"
    version: "7.3.8"
```

Update dependencies
```
helm dependency update
```

View file before run (optional)
```
helm template .
```

Running Grafana
```
helm upgrade -i grafana . -n monitoring --create-namespace
```

---

### Enable ingress
Create `values.yaml`
```
grafana:
  ingress:
    enabled: true
    hosts:
      - grafana.example.com
```

Helm upgrade
```
helm upgrade -i grafana . -n monitoring --create-namespace
```

Go to http://grafana.example.com:8888/

Should be grafana page

---

### Login

Username: admin

Password:
```
kubectl get secret grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 -d ; echo
```

---

### Setup Grafana

Add datasources choose Prometheus and input prometheus server url as prometheus service's ip
> You can input Prometheus url if on network, but this case Grafana don't know `prometheus.example.url` so use prometheus service's ip instead
```
kubectl get service -n monitoring
```

Copy `prometheus-server` ip and fill to prometheus server url input, click save & test button

Add Dashboard 
- import dashboard
- input dashboard id for examples: `6417`, `315`
- click load button
- select prometheus data source
- click import

Should see the dashboard

---

### Clean cluster

> [!WARNING]  
> **Not Clean yet, will be use in next workshop**
