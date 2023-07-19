# 'Me', a technology demonstration

A personal project that I started May 2023 to demonstrate backend and frontend aspects of a microservice based solution hosted in Azure.

## Environment
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/) - IaaS, easy orchestration, scalable, pay-as-you-go
- [Azure API Management](https://azure.microsoft.com/en-us/products/api-management/)
- Docker Container Registry
- GitHub Actions CI/CD
- [AAD B2C](https://learn.microsoft.com/en-us/azure/active-directory-b2c/) - Customer identity access management (CIAM). This infrastructure is not part of automated provisioning. It requires manual provision and config.
- Angular SPA with Tailwind CSS

![Me architecture](Images/Me%20Architecture.png)


## Notes
- The steps below were established on my Windows 10 machine 
- For demo purposes the Azure hosting is configured with free or consumption plans so performance will be poor
- The Azure resources can be scaled and set for auto scaling to meet demand
- For global scaling the solution can be configured as a geode or stamped pattern

### Currently working on 
- [Angular UI and API](https://green-wave-08182290f.3.azurestaticapps.net)

## Steps for using Me

### Local
1. docker-compose up
2. cd Frontends/Angular/Me
3. npm install
4. npm run start (for Node server)
5. npm run swa   (for Azure Static Web App emulator)

### Azure
**Prereqs**
: Deploying Me to Azure requires:
1. Azure account [(Free is fine)][def]
2. [az CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) I used v2.50.0

**Fork Me**
: Me uses GitHub Actions for CI/CD so you'll need your own copy

After provisioning the Me infrastructure (below) we'll configure the GitHub environment to enable Actions to deploy the Container Apps and Angular frontends.

**Clone Me**
: So you can run the scripts

**Push initial images to Docker**
: So that Docker has a latest version of the initial API. The provisioning that follows will pull them and import the APIs into APIM.
1. docker build -t *your-docker-login*/catalog-api . -f Services\Catalog\Catalog.API\Dockerfile
2. docker push *your-docker-login*/catalog-api

**Provision Me**
: Create the Azure infrastructure for Me in an Azure Resource Group of your choosing [^1]. Confirm the Azure resources are all available in the location you choose (I used eastus).
1. az configure --defaults group=*my-resource-group*
2. az deployment group create --template-file bicep/main.bicep

**GitHub Actions CI/CD Repository Secrets**
: The following Repository Secrets support CI/CD deployments
- [DOCKERHUB_TOKEN](https://docs.docker.com/docker-hub/access-tokens/) - Container images will be pushed to Docker
- DOCKERHUB_USERNAME
- AZURE_SUBSCRIPTION_ID - Azure Container App Revisions will pull images from Docker (Supports OIDC login)
- AZURE_TENANT_ID - (Supports OIDC login)
- [STATIC_WEB_APP_DEPLOY_TOKEN](https://learn.microsoft.com/en-us/azure/static-web-apps/deployment-token-management)

**GitHub Actions CI/CD Environment Secrets (dev)**
: The following Environment Secrets support the beginning of CI/CD dev/prod isolation
- AZURE_CLIENT_ID - User Assigned Identity "uai-GitHubOIDC" provisioned above -> Settings -> Properties. I have seen the Client Id under "Overview" not match.

**Testing**
- Verify the .github/*.yml env variables match your configuration
- You might want to comment out "on: push: paths:" from GitHub yml files to force CI/CD to run
- Test APIs that were imported into APIM
- Open Container App console in Azure portal and curl the APIs, view the logs. They are configured to scale to 0. You can make an APIM call to wake them.
- Navigate to your static web app.

**That's it so far**
: Container Apps Environment is external. Container Apps restrict access via IP only granting access to APIM. The containers have curl installed for quick API checks but you can toggle Ingress to allow public access. The APIs "talk" to each other and to Azure Key Vault. APIM connects to the Container Apps as Backend Services.

### TO DO
- Implement semantic-release versioning for modules, update CDN cache strategy which is currently turned off for dev
- Better micro-services, front-ends, Event Bus, aggregation, and SignalR
- Script initial Docker image build and push

[^1]: The Azure Container Apps Managed Environment creates an additional Resource Group for Kubernetes that it controls

[def]: https://azure.microsoft.com/en-us/free/search/?ef_id=_k_4fffd49be29e1baacc4bb019e2ee66a6_k_&OCID=AIDcmm5edswduu_SEM__k_4fffd49be29e1baacc4bb019e2ee66a6_k_&msclkid=4fffd49be29e1baacc4bb019e2ee66a6