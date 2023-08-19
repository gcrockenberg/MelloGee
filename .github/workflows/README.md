# Github CI/CD Actions
Whereas Bicep scripts handle the initial Azure Container App ('ACA') provisioning, the Github CI/CD scripts create Docker
image updates and trigger the ACA containers to pull latest. It is important to know that image updates will not update
ACA container environment variables defined when Bicep provisions them. Container envrionment variable will need to be
updated directly in the Azure portal or by re-running the Bicep scripts.

## on-hold folder
Move Actions scripts into the on-hold folder to prevent them from running on push. I usually do this to prevent unneeded resource costs when I push updates via Bicep and don't need CI/CD to push them again.
