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

        stage('Build Successful') {
            steps {
                echo 'React application built successfully!'
            }
        }
    }
}
stage('Test Docker') {
    steps {
        bat 'docker --version'
    }
}