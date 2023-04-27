// Acciones de prueba
const followTest = (req, res) => {
    return res.status(200).json({
        message: "Mensaje enviado desde: controllers/follow.js"
    });
}

module.exports = {
    followTest
}