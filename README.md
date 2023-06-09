# 'Me', a simple demo 

A personal project to provide backend and frontend examples of a microservice based solution hosted in Azure.

## Environment
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure App Gateway](https://learn.microsoft.com/en-us/azure/application-gateway/)
- Docker Container Registry
- GitHub Actions CI/CD

## Notes
These steps were established on my Windows 10 machine

## Steps for using Me
### Local
1. Work in progress
### Azure
**Prereqs**
: Deploying Me to Azure requires a few things
1. An Azure account [(Free is fine)][def]
2. [az CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
3. [az containerapp extension](https://learn.microsoft.com/en-us/azure/container-apps/containerapp-up) - Make sure namespaces are registered

**Fork Me**
: Me uses GitHub Actions for CI/CD so you'll need your own copy

After provisioning Me (below) we'll configure the environment to allow Actions to deploy the Container Apps

**Clone Me**
: So you can run the scripts

**Provision Me**
: Create the Azure infrastructure for Me in an Azure Resource Group of your choosing [^1]
1. az configure --defaults group=*my-resource-group*
2. az deployment group create --template-file bicep/main.bicep
3. az deployment group create --template-file bicep/container.bicep

**GitHub Actions CI/CD**
: Set the following GitHub secrets which are used by GitHub CI/CD Actions to deploy Container Apps
- [DOCKERHUB_TOKEN](https://docs.docker.com/docker-hub/access-tokens/) - Container images will be pushed to Docker
- DOCKERHUB_USERNAME
- AZURE_SUBSCRIPTION_ID - Azure Container App Revisions will pull images from Docker
- AZURE_TENANT_ID
- Verify that .github/*.yml files reference the right Resource Group and other env variables

**That's it so far**
The solution runs on an internal subnet (no public access). The containers have curl installed for quick API checks. I'll wire up the public APIM gateway soon then work on real API's and front ends. Also I'll upload some architecture stuff. Right now the API's talk to each other and to Azure Key Vault. Just setting up the basic foundations.

### Working on 
- Merging/modularizing bicep files so only one run is needed. ARM templates are just reverse engineering sources.
- Verifying and documenting local set up.
- APIM as an interim step before going deeper with Api Gateways
- APIM Self-hosted gateway for local dev

[^1]: The Azure Container Apps Managed Environment creates an additional Resource Group for Kubernetes that it controls

[def]: https://azure.microsoft.com/en-us/free/search/?ef_id=_k_4fffd49be29e1baacc4bb019e2ee66a6_k_&OCID=AIDcmm5edswduu_SEM__k_4fffd49be29e1baacc4bb019e2ee66a6_k_&msclkid=4fffd49be29e1baacc4bb019e2ee66a6