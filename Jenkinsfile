@Library('conservify') _

properties([
    disableConcurrentBuilds(),
    buildDiscarder(logRotator(numToKeepStr: '5'))
])

timestamps {
    node ("jenkins-aws-ubuntu") {
        try {
            def scm

            stage ('git') {
                scm = checkout scm
            }

            stage ('tests') {
				def (remote, branch) = scm.GIT_BRANCH.tokenize('/')

				withEnv(["GIT_LOCAL_BRANCH=${branch}"]) {
                    sh "PATH=$PATH:node_modules/.bin:/usr/local/node/bin npm run test"
				}
            }

            notifySuccess()
        }
        catch (Exception e) {
            notifyFailure()
            throw e;
        }
    }
}
