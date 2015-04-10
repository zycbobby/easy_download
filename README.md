# Make it work in one machine

## Build within production environment

```bash
grunt build
```

## Build elasticsearch-ik
```bash
cd elasticsearch
docker build -t es:ik .
```

## Use Docker-compose
```bash
docker-compose up
```

# Make it work in multiple machines


