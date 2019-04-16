#!/usr/bin/env groovy

/**
* notify slack and set message based on build status
*/
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import hudson.tasks.test.AbstractTestResultAction;
import hudson.model.Actionable;

def call(String buildStatus, String emoji, String color) {

  // buildStatus checks
  def successful = buildStatus == 'SUCCESSFUL'
  def mergeFailure = params.MERGE && buildStatus == 'MERGE FAILURE'
  def deployFailure = params.DEPLOY && (buildStatus == 'DEPLOYMENT FAILURE' || buildStatus == 'ENVIRONMENT FAILURE')

  // Default values
  def subject = "${emoji} ${buildStatus}: Job \"${env.JOB_NAME} [${env.BUILD_NUMBER}]\" (<${env.RUN_DISPLAY_URL}|Open>) (<${env.RUN_CHANGES_DISPLAY_URL}|Changes>)"
  def title = "${env.JOB_NAME} Build: ${env.BUILD_NUMBER}"
  def title_link = "${env.RUN_DISPLAY_URL}"
  def branchName = "${env.GIT_LOCAL_BRANCH}"
  def isMerged = params.MERGE && (successful || deployFailure) ? ':white_check_mark: Merged' : (mergeFailure ? ':x: Merged' : ':heavy_minus_sign: Merged')
  def isDeployed = params.DEPLOY && successful ? ':white_check_mark: Deployed' : (deployFailure ? ':x: Deployed' : ':heavy_minus_sign: Deployed')

  def commit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
  def author = sh(returnStdout: true, script: "git --no-pager show -s --format='%an'").trim()
  def message = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()

  // get test results for slack message
  @NonCPS
  def getTestSummary = { ->
    def testResultAction = currentBuild.rawBuild.getAction(AbstractTestResultAction.class)
    def summary = ""

    if (testResultAction != null) {
      def total = testResultAction.getTotalCount()
      def failed = testResultAction.getFailCount()
      def skipped = testResultAction.getSkipCount()

      summary = summary + ("Passed: " + (total - failed - skipped))
      summary = summary + (", Failed: " + failed + " ${testResultAction.failureDiffString}")
      summary = summary + (", Skipped: " + skipped)
    } else {
      summary = "No tests found"
    }
    return summary
  }
  def testSummaryRaw = getTestSummary()
  // format test summary as a code block
  def testSummary = "```${testSummaryRaw}```\n"
  println testSummary.toString()

  // get coverage results for slack message
  @NonCPS
  def getCoverageSummary = { ->
    def summary = ""
    try {
      def coverageFile = readFile("${pwd()}/clover.xml")
      def metrics = new XmlSlurper().parseText(coverageFile)['project']['metrics']

      def total = Math.round(metrics['@coveredelements'].toInteger() / metrics['@elements'].toInteger() * 100 * 10d) / 10d + '%'
      def methods =  Math.round(metrics['@coveredmethods'].toInteger() / metrics['@methods'].toInteger() * 100 * 10d) / 10d + '%'
      def conditionals = Math.round(metrics['@coveredconditionals'].toInteger() / metrics['@conditionals'].toInteger() * 100 * 10d) / 10d + '%'
      def statements = Math.round(metrics['@coveredstatements'].toInteger() / metrics['@statements'].toInteger() * 100 * 10d) / 10d + '%'

      summary = "Total: ${total}, Methods: ${methods}, Conditionals: ${conditionals}, Statements: ${statements}"
    } catch (e) {
      summary = "No coverage report found"
    }
    return summary
  }
  def coverageSummaryRaw = getCoverageSummary()
  def coverageSummary = "```${coverageSummaryRaw}```\n"
  println coverageSummary.toString()

  JSONObject attachment = new JSONObject()
  attachment.put('author',"jenkins")
  attachment.put('title', title.toString())
  attachment.put('title_link',title_link.toString())
  attachment.put('text', subject.toString())
  attachment.put('fallback', "fallback message")
  attachment.put('color', color)
  attachment.put('mrkdwn_in', ["fields"])
  // JSONObject for branch
  JSONObject branch = new JSONObject()
  branch.put('title', 'Branch')
  branch.put('value', branchName.toString())
  branch.put('short', true)
  // JSONObject for author
  JSONObject commitAuthor = new JSONObject()
  commitAuthor.put('title', 'Author')
  commitAuthor.put('value', author.toString())
  commitAuthor.put('short', true)
  // JSONObject for commit message
  JSONObject commitMessage = new JSONObject()
  commitMessage.put('title', 'Commit Message')
  commitMessage.put('value', message.toString())
  commitMessage.put('short', false)
  // JSONObject for job duration
  JSONObject duration = new JSONObject()
  duration.put('title', 'Duration')
  duration.put('value', currentBuild.durationString.replaceAll('and counting', ''))
  duration.put('short', false)
  // JSONObject for test results
  JSONObject testResults = new JSONObject()
  testResults.put('title', 'Test Summary')
  testResults.put('value', testSummary.toString())
  testResults.put('short', false)
  // JSONObject for coverage report
  JSONObject coverageResults = new JSONObject()
  coverageResults.put('title', 'Coverage Summary')
  coverageResults.put('value', coverageSummary.toString())
  coverageResults.put('short', false)
  // JSONObject for checking if merged
  JSONObject merged = new JSONObject()
  merged.put('value', isMerged)
  merged.put('short', true)
  // JSONObject for checking if deployed
  JSONObject deployed = new JSONObject()
  deployed.put('value', isDeployed)
  deployed.put('short', true)

  attachment.put('fields', [branch, commitAuthor, commitMessage, duration, testResults, coverageResults, merged, deployed])
  JSONArray attachments = new JSONArray()
  attachments.add(attachment)
  println attachments.toString()

  // Send notifications
  slackSend (color: color, message: subject, attachments: attachments.toString())
}

return this
