node {

    stage('Install Dependencies') {
        bat 'npm ci'
    }

    stage('Build Frontend') {
        bat 'npm run build'
    }

    stage('Docker Build') {
        bat '"C:\\DockerCLI\\docker.exe" build -t sih-app .'
    }

    stage('Build Successful') {
        echo 'Jenkins CI + Docker build completed successfully!'
    }
}