# K8s Lab — React + Node + Postgres + Redis

## Build images (with Minikube Docker daemon)
```bash
eval $(minikube docker-env)        # mac/linux
# Windows PowerShell:
# & minikube -p minikube docker-env | Invoke-Expression

# backend
cd backend && docker build -t k8s-demo/api:1.0.0 . && cd ..

# frontend
cd frontend && npm install && npm run build && docker build -t k8s-demo/web:1.0.0 . && cd ..
```

## Deploy to Kubernetes
```bash
minikube start
minikube addons enable ingress

kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-postgres-secret.yaml
kubectl apply -f k8s/02-configmap.yaml
kubectl apply -f k8s/10-postgres.yaml
kubectl apply -f k8s/11-redis.yaml
kubectl apply -f k8s/20-backend.yaml
kubectl apply -f k8s/30-frontend.yaml
kubectl apply -f k8s/40-ingress.yaml

kubectl -n app get pods,svc,ingress
```

## Access
```bash
minikube tunnel
# Frontend:
#   http://localhost/
# API:
#   http://localhost/api/ping
```
