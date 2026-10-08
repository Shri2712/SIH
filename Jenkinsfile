node {

    stage('Checkout') {
        checkout scm
    }

    stage('Install Dependencies') {
        bat 'npm ci'
    }

    stage('Build Frontend') {
        bat 'npm run build'
    }

    stage('Docker Build') {
        bat '"C:\\DockerCLI\\docker.exe" build -t sih-app .'
    }

    stage('Docker Deploy') {
        bat '"C:\\DockerCLI\\docker.exe" stop sih-container || exit /b 0'
        bat '"C:\\DockerCLI\\docker.exe" rm sih-container || exit /b 0'
        bat '"C:\\DockerCLI\\docker.exe" run -d -p 8081:80 --name sih-container sih-app'
    }

    stage('Build Successful') {
        echo 'CI/CD pipeline completed successfully!'
    }
}