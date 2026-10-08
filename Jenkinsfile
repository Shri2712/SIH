pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Build React App') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Test Docker') {
            steps {
                bat 'docker --version'
            }
        }

        stage('Build Successful') {
            steps {
                echo 'React application and Docker are ready!'
            }
        }
    }
}