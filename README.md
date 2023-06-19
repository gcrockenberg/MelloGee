# 'Me', a technology demonstration

A personal project to provide backend and frontend examples of a microservice based solution hosted in Azure.

## Environment
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/) - IaaS, easy orchestration, globally scalable, pay-as-you-go
- [Azure API Management](https://azure.microsoft.com/en-us/products/api-management/)
- Docker Container Registry
- GitHub Actions CI/CD

![Me architecture](images/Me%20Architecture.png)

## Notes
These steps were established on my Windows 10 machine

## Steps for using Me
### Azure
**Prereqs**
: Deploying Me to Azure requires a few things
1. An Azure account [(Free is fine)][def]
2. [az CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
3. [az containerapp extension](https://learn.microsoft.com/en-us/azure/container-apps/containerapp-up) - Make sure namespaces are registered

**Fork Me**
: Me uses GitHub Actions for CI/CD so you'll need your own copy

After provisioning Me (below) we'll configure the environment to enable GitHub Actions to deploy the Container Apps

**Clone Me**
: So you can run the scripts

**Push initial images to Docker**
: So that Docker has a latest version of them. The following provisioning will pull them and import the APIs into APIM.
1. docker build -t *your-docker-login*/catalogapi . -f Services\CatalogService\Dockerfile
2. docker push *your-docker-login*/catalogapi
3. docker build -t *your-docker-login*/coffeeapi . -f Services\Coffee\Coffee.API\Dockerfile
4. docker push *your-docker-login*/coffeeapi

**Provision Me**
: Create the Azure infrastructure for Me in an Azure Resource Group of your choosing [^1]
1. az configure --defaults group=*my-resource-group*
2. az deployment group create --template-file bicep/main.bicep

**GitHub Actions CI/CD**
: Set the following GitHub secrets which are used by GitHub CI/CD Actions to deploy Container Apps
- [DOCKERHUB_TOKEN](https://docs.docker.com/docker-hub/access-tokens/) - Container images will be pushed to Docker
- DOCKERHUB_USERNAME
- AZURE_CLIENT_ID - From the User Assigned Identity provisioned above (Supports OIDC login)
- AZURE_SUBSCRIPTION_ID - Azure Container App Revisions will pull images from Docker (Supports OIDC login)
- AZURE_TENANT_ID - (Supports OIDC login)
- Verify that .github/*.yml files reference the right Resource Group and other env variables

**Testing**
- Open Container App console in Azure portal and curl the APIs, view the logs
- Test APIs defined in APIM

**That's it so far**
: Container Apps Environment is external. Container Apps restrict access via IP only granting access to APIM. The containers have curl installed for quick API checks but you can toggle Ingress to allow public access. The APIs "talk" to each other and to Azure Key Vault. APIM connects to the Container Apps as Backend Services.

### Working on 
- Better micro-services, front-ends, Event Bus, aggregation, and SignalR

### TO DO
- Script initial Docker image build and push

[^1]: The Azure Container Apps Managed Environment creates an additional Resource Group for Kubernetes that it controls

[def]: https://azure.microsoft.com/en-us/free/search/?ef_id=_k_4fffd49be29e1baacc4bb019e2ee66a6_k_&OCID=AIDcmm5edswduu_SEM__k_4fffd49be29e1baacc4bb019e2ee66a6_k_&msclkid=4fffd49be29e1baacc4bb019e2ee66a6