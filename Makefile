#!make

include .env

export $(shell sed 's/=.*//' .env)
export GIT_LOCAL_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
export DEPLOY_DATE?=$(shell date '+%Y%m%d%H%M')

define deployTag
"${PROJECT}-${DEPLOY_DATE}"
endef

# local                 - build and run the development image locally
# production            - build and run the production image locally
# audit                 - installs node modules and runs the security scan
# jenkins-deploy        - push image to ECR, generate Dockerrun.aws.json, then deploy to Elasticbeanstalk
# jenkins-re-tag-deploy - re-tag staging image in ECR repo, generate Dockerrun.aws.json, then deploy to Elasticbeanstalk
local:                 | build-local run-local
production:            | build-production run-production
jenkins:               | print-status jenkins-build
jenkins-audit:         | jenkins-build-audit jenkins-report-audit
jenkins-deploy:        | jenkins-push jenkins-deploy-prep jenkins-deploy-version
jenkins-re-tag-deploy: | jenkins-re-tag jenkins-deploy-prep jenkins-deploy-version

#################
# Status Output #
#################

print-status:
	@echo " +---------------------------------------------------------+ "
	@echo " | Current Settings                                        | "
	@echo " +---------------------------------------------------------+ "
	@echo " | BRANCH : $(GIT_LOCAL_BRANCH) "
	@echo " | PROFILE: $(PROFILE) "
	@echo " | ACNT ID: $(ACCOUNT_ID) "
	@echo " | REGION: $(REGION) "
	@echo " | APPLICATION: $(PROJECT) "
	@echo " +---------------------------------------------------------+ "

# Generates ECR (Elastic Container Registry) repos, given the proper credentials
create-ecr-repos:
	@echo "+\n++ Creating EC2 Container repositories...\n+"
	@$(shell aws ecr get-login --no-include-email --profile $(PROFILE) --region $(REGION))
	@aws ecr create-repository --profile $(PROFILE) --region $(REGION) --repository-name $(PROJECT) || :
	@aws iam attach-role-policy --role-name aws-elasticbeanstalk-ec2-role --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly --profile $(PROFILE) --region $(REGION)

########################
# Development commands #
########################

build-local:
	@echo "+\n++ Building local Docker image...\n+"
	@docker build -t $(PROJECT):development -f ./app/Dockerfile.dev ./app/

build-production:
	@echo "+\n++ Building local production Docker image...\n+"
	@docker build -t $(PROJECT):production-test -f ./app/Dockerfile.production ./app/

run-local:
	@echo "+\n++ Running locally\n+"
	@docker run -d -it --name $(PROJECT)-development -p 3000:3000 -v $(CURDIR)/app:/app -v /app/node_modules $(PROJECT):development

close-local:
	@echo "+\n++ Closing local container\n+"
	@docker rm -f $$(docker ps -q --filter name=$(PROJECT)-development)

run-production:
	@docker run -d -it --name $(PROJECT)-production-test -p 3001:3000 $(PROJECT):production-test

close-production:
	@docker rm -f $$(docker ps -q --filter name=$(PROJECT)-production-test)

workspace:
	@docker exec -it $(PROJECT)-development bash

#########################################
# Jenkins build and deployment commands #
#########################################

jenkins-build:
	@echo "+\n++ Performing build of Docker images...\n+"
	@echo "Tagging images with: $(GIT_LOCAL_BRANCH)"
	@docker-compose build

jenkins-push:
	@echo "+\n++ Pushing image to Dockerhub...\n+"
	@$(shell aws ecr get-login --no-include-email --region $(REGION))
	@docker tag $(PROJECT):$(GIT_LOCAL_BRANCH) $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(MERGE_BRANCH)
	@docker push $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(PROJECT):$(MERGE_BRANCH)

jenkins-deploy-prep:
	@echo "+\n++ Creating Dockerrun.aws.json file...\n+"
	@.build/build_dockerrun.sh > Dockerrun.aws.json

jenkins-deploy-version:
	@echo "+\n++ Deploying to Elasticbeanstalk...\n++"
	@zip -r $(call deployTag).zip Dockerrun.aws.json
	@aws configure set region $(REGION)
	@aws s3 cp $(call deployTag).zip s3://$(BUCKET_NAME)/$(PROJECT)/$(call deployTag).zip
	@aws elasticbeanstalk create-application-version --application-name $(PROJECT) --version-label $(call deployTag) --source-bundle S3Bucket="$(BUCKET_NAME)",S3Key="$(PROJECT)/$(call deployTag).zip"
	@aws elasticbeanstalk update-environment --application-name $(PROJECT) --environment-name $(DEPLOY_ENV) --version-label $(call deployTag)

jenkins-re-tag:
	@echo "+\n++ Re-tagging staging ECR repo to $(MERGE_BRANCH)...\n+"
	@$(shell aws ecr get-login --no-include-email --region $(REGION))
	@$(eval MANIFEST=`aws ecr batch-get-image --repository-name $(PROJECT) --region $(REGION) --image-ids imageTag=staging --query images[].imageManifest --output text`)
	@aws ecr put-image --repository-name $(PROJECT) --region $(REGION) --image-tag $(MERGE_BRANCH) --image-manifest "$(MANIFEST)"

healthcheck:
	@aws elasticbeanstalk describe-environments --application-name $(PROJECT) --environment-name $(DEPLOY_ENV) --query 'Environments[*].{Status: Status, Health: Health}'

##########################################
# Jenkins lint, test, and audit commands #
##########################################

jenkins-lint:
	@echo "+\n++ Linting project...\n+"
	@docker-compose run --entrypoint "npm run lint" --name $(PROJECT)-lint test
	exit $(echo $?)

jenkins-tests:
	@echo "+\n++ Running tests...\n+"
	@docker-compose up --exit-code-from test
	exit $(echo $?)

jenkins-report:
	@echo "+\n++ Retrieving tests report...\n+"
	@docker cp $(PROJECT)-test:/app/coverage/tests-report.xml $(PWD)/tests-report.xml
	@docker cp $(PROJECT)-test:/app/coverage/clover.xml $(PWD)/clover.xml

jenkins-build-audit:
	@echo "+\n++ Security Audit (Building)...\n+"
	@docker rm -f $(PROJECT)-audit || true
	@docker build -t $(PROJECT):audit -f ./app/Dockerfile.audit ./app/

jenkins-report-audit:
	@echo "+\n++ Security Audit (Running)...\n+"
	@docker run --name $(PROJECT)-audit -e SNYK_TOKEN=$(SNYK_TOKEN) $(PROJECT):audit
	@docker cp $(PROJECT)-audit:/app/audit-report.json $(PWD)/audit-report.json
	@docker cp $(PROJECT)-audit:/app/audit-report.html $(PWD)/audit-report.html

#############################
# Jenkins clean up commands #
#############################

clean-up:
	@echo "+\n++ Cleaning up...\n+"
	@docker-compose down
