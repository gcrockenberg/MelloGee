# eShopOnContainers references v1.21.0
FROM envoyproxy/envoy:v1.26-latest
COPY ["Gateways/Envoy/envoy.yaml", "etc/envoy/envoy.yaml"]
COPY [".local/https.crt", "etc/ssl/certs/https.crt"]
COPY [".local/key.pem", "etc/ssl/certs/key.pem"]