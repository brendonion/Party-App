/**
 * Jenkinsfile
 *
 * This is the front-end pipeline script
 * It orchestrates the CI/CD process and is run in sequence
 *
 * Written by Brendan Walker 2018 <brendan@freshworks.io>
 */

// Global definitions
def GREEN = 'good'
def RED = 'danger'
def status = 'N/A'
def slackResults
def auditResults

@NonCPS
def jsonParse(def json) {
  new groovy.json.JsonSlurper().parseText(json)
}

// Uses the declarative pipeline syntax
pipeline {

  // Specifies the agent with `params.AGENT`
  agent {
    label params.AGENT
  }

  // All stages for the pipeline
  stages {

    /**
     * Build stage
     *
     * Times out after 10 minutes
     * Loads `slackResults` script, runs `bitbucketStatusNotify`, and runs `make jenkins`
     * Prints the project status and builds the images
     */
    stage('Build') {
      options {
        timeout (time: 60, unit: 'MINUTES')
      }
      steps {
        script {
          try {
            slackResults = load ("${pwd()}/slackResults.groovy")
            bitbucketStatusNotify (buildState: 'INPROGRESS')
            sh 'make jenkins'
          } catch (e) {
            status = 'BUILD FAILURE'
            error ("Build failed: ${e}")
          }
        }
      }
    }

    /**
     * Lint stage
     *
     * Runs `make jenkins-lint`
     */
    stage('Lint') {
      steps {
        script {
          try {
            sh 'make jenkins-lint'
          } catch (e) {
            status = 'LINT FAILURE'
            error ("Linting failed: ${e}")
          }
        }
      }
    }

    /**
     * Test stage
     *
     * Runs `make jenkins-tests` and `make jenkins-report`
     * Uses `junit` for retrieving data from `tests-report.xml`
     */
    stage('Test') {
      steps {
        script {
          def statusCode
          try {
            statusCode = sh (returnStatus: true, script: 'make jenkins-tests')
            sh 'make jenkins-report'
          } finally {
            junit (allowEmptyResults: true, testResults: 'tests-report.xml')
            if (statusCode != 0) {
              status = 'TEST FAILURE'
              error ("Tests failed")
            }
          }
        }
      }
    }

    /**
     * Coverage stage
     *
     * Uses `CloverPublisher` to record the coverage report
     * The `healthyTarget` and `failingTarget` parameters are opinionated
     * Adjust the parameters if need be
     */
    stage('Coverage') {
      steps {
        script {
          try {
            step([
              $class: 'CloverPublisher',
              cloverReportDir: '',
              cloverReportFileName: 'clover.xml',
              healthyTarget: [methodCoverage: 70, conditionalCoverage: 80, statementCoverage: 80],
              failingTarget: [methodCoverage: 30, conditionalCoverage: 30, statementCoverage: 30],
            ])
          } finally {
            if (currentBuild.result == 'UNSTABLE') {
              status = 'COVERAGE FAILURE'
              error ("Coverage failed")
            }
          }
        }
      }
    }

    /**
     * Merge stage
     *
     * This will run if `params.MERGE` is true
     * Uses `sshagent` with the `JENKINS_SSH` credentials profile for running git commands
     */
    stage('Merge') {
      when {
        expression { params.MERGE }
      }
      steps {
        script {
          try {
            sshagent(['JENKINS_SSH']) {
              sh "git push origin HEAD:${env.MERGE_BRANCH}"
            }
          } catch (e) {
            status = 'MERGE FAILURE'
            error ("Merge failed: ${e}")
          }
        }
      }
    }

    /**
     * Audit stage
     *
     * Runs `make jenkins-audit` to perform security auditing on dependencies
     * Uses SNYK to scan package.json/composer.json files and matched against their vulnerability database
     */
    stage('Audit') {
      when {
        expression { params.AUDIT }
      }
      environment {
        SNYK_TOKEN = credentials ('SNYK_TOKEN')
      }
      steps {
        script {
          try {
            sh 'make jenkins-audit'
          } catch (e) {
            status = 'AUDIT FAILURE'
            error ("Audit report generation failed: ${e}")
          }

          def auditJSON = jsonParse ( sh (returnStdout: true, script: 'cat audit-report.json') )
          def vulnerabilities = auditJSON.vulnerabilities
          def vulMap = [
            low: [count: 0, packages: ""],
            medium: [count: 0, packages: ""],
            high: [count: 0, packages: ""]
          ]

          if (vulnerabilities) {
            vulnerabilities.collect { item ->
              vulMap[item.severity].count += 1
              vulMap[item.severity].packages += "---> ${item.packageName} - ${item.title}\n"
              vulMap[item.severity].packages += "  Versions vulnerable:\n"
              if (item.semver.vulnerable instanceof String) {
                vulMap[item.severity].packages += "    ${item.semver.vulnerable}\n"
              } else {
                item.semver.vulnerable.each { version -> vulMap[item.severity].packages += "    ${version}\n" }
              }
              vulMap[item.severity].packages += "  Is upgradable?: ${item.isUpgradable}\n"
              vulMap[item.severity].packages += "  Is patchable?: ${item.isPatchable}\n"
            }
          }

          def (lowCount, medCount, highCount) = [vulMap['low'].count, vulMap['medium'].count, vulMap['high'].count]
          println ("Repository contains ${lowCount} low, ${medCount} medium, and ${highCount} high severity vulnerabilities")
          println ("Low severity vulnerabilities:\n${vulMap['low'].count > 0 ? vulMap['low'].packages : "---> None\n"}")
          println ("Medium severity vulnerabilities:\n${vulMap['medium'].count > 0 ? vulMap['medium'].packages : "---> None\n"}")
          println ("High severity vulnerabilities:\n${vulMap['high'].count > 0 ? vulMap['high'].packages : "---> None\n"}")

          if (highCount > 0) {
            status = 'AUDIT FAILURE'
            auditResults = "Audit failed: `${medCount} medium and ${highCount} high vulnerabilities found`"
            error (auditResults)
          }
        }
      }
    }

    /**
     * Deploy stage
     *
     * This will run if `params.DEPLOY` is true
     * Uses `withCredentials` to bind the `AWS_CLI_CREDS` credentials profile
     * Runs `make jenkins-deploy` and `make healthcheck`
     * Loops for up to 5 minutes until the `deployStatus` is `Ready` and the `deployColor` changes to `Green` or `Red`
     */
    stage('Deploy') {
      when {
        expression { params.DEPLOY }
      }
      steps {
        withCredentials([[
          $class: 'AmazonWebServicesCredentialsBinding',
          credentialsId: 'AWS_CLI_CREDS'
        ]]) {
          script {
            try {
              sh 'make jenkins-deploy'
              long t = System.currentTimeMillis()
              long end = t + 300000

              while (System.currentTimeMillis() < end) {
                def statusJson = sh (returnStdout: true, script: 'make healthcheck')
                def data = jsonParse (statusJson)
                def deployStatus = data.Status[0].toString()
                def deployColor = data.Health[0].toString()

                if (deployStatus == 'Ready' && deployColor == 'Green') {
                  break
                } else if (deployStatus != 'Updating' && deployColor == 'Red') {
                  status = 'DEPLOY FAILURE'
                  error ("Deploy failed")
                }
              }
            } catch (e) {
              status = 'DEPLOYMENT FAILURE'
              error ("Deploy failed: ${e}")
            }
          }
        }
      }
    }
  }

  /**
   * Post declaration
   *
   * Runs after the pipeline
   * Runs `make clean-up` no matter the outcome of the pipeline
   * If the pipeline is a success, will run `bitbucketStatusNotify` and `slackResults` with a successful status
   * If the pipeline is a failure, will run `bitbucketStatusNotify` and `slackResults` with a failure status
   */
  post {
    always {
      sh 'make clean-up'
    }
    success {
      script {
        status = 'SUCCESSFUL'
        bitbucketStatusNotify (buildState: 'SUCCESSFUL')
        slackResults (status, ':always_sunny_in_adamville:', GREEN)
      }
    }
    failure {
      script {
        bitbucketStatusNotify (buildState: 'FAILED')
        slackResults (status, ':disgruntled_adam:', RED)
        if (auditResults) {
          slackSend (color: RED, message: auditResults)
        }
      }
    }
  }
}
