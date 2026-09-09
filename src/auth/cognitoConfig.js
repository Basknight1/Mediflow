import { Amplify } from 'aws-amplify'

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: 'us-east-1_Z0wZNNSFW',
            userPoolClientId: 'f7vqgbpkksk9hhhrqn02lqool',
            loginWith: {
                email: true,
            },
        },
    },
})