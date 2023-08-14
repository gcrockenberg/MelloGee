# Upload Docker images to Docker Hub
# Make sure Docker Desktop is running
param (
    [string]$dockerUserName = $(throw "-dockerUserName is required")
)

docker build -t $dockerUserName/cart-data . -f Services\Redis\Dockerfile
docker push $dockerUserName/cart-data
docker build -t $dockerUserName/rabbitmq . -f Services\RabbitMQ\Dockerfile
docker push $dockerUserName/rabbitmq
docker build -t $dockerUserName/mariadb . -f Services\MariaDb\Dockerfile
docker push $dockerUserName/mariadb
docker build -t $dockerUserName/signalr . -f Services\SignalRHub\Dockerfile
docker push $dockerUserName/signalr
#docker build -t $dockerUserName/sqlserver . -f Services\SQLServer\Dockerfile
#docker push $dockerUserName/sqlserver
docker build -t $dockerUserName/catalog-api . -f Services\Catalog\Catalog.API\Dockerfile
docker push $dockerUserName/catalog-api
docker build -t $dockerUserName/cart-api . -f Services\Cart\Cart.API\Dockerfile
docker push $dockerUserName/cart-api
docker build -t $dockerUserName/order-api . -f Services\Purchase\Purchase.API\Dockerfile
docker push $dockerUserName/order-api