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
                bat '"C:\\Users\\Lenovo\\AppData\\Local\\Programs\\Docker\\DockerDesktop\\resources\\bin\\docker.exe" --version'
            }
        }

        stage('Build Successful') {
            steps {
                echo 'React application and Docker are ready!'
            }
        }
    }
}