node {
    stage('Install Dependencies') {
        bat 'npm ci'
    }

    stage('Build Frontend') {
        bat 'npm run build'
    }

    stage('Test Docker') {
        bat '"C:\\DockerCLI\\docker.exe" --version'
    }

    stage('Build Successful') {
        echo 'Build completed successfully!'
    }
}