import { signUp, confirmSignUp, signIn, resendSignUpCode } from 'aws-amplify/auth'

export async function registrarEnCognito(email, password, nombre) {
    return signUp({
        username: email,
        password,
        options: {
            userAttributes: {
                email,
                name: nombre,
            },
        },
    })
}

export async function confirmarCodigoCognito(email, codigo) {
    return confirmSignUp({
        username: email,
        confirmationCode: codigo,
    })
}

export async function reenviarCodigoCognito(email) {
    return resendSignUpCode({ username: email })
}

export async function iniciarSesionCognito(email, password) {
    return signIn({ username: email, password })
}