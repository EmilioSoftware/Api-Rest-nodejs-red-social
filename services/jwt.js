// Importar dependencias
const jwt = require('jwt-simple');
const moment = require('moment');
require('dotenv').config()

let secret = process.env.SECRET_KEY;

// Crear funcion para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    }

    // Devolver jwt token codificado
    return jwt.encode(payload, secret)
};

module.exports = {
    secret,
    createToken
}