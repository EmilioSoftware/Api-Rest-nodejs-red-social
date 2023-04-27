// Acciones de prueba
const publicationTest = (req, res) => {
    return res.status(200).json({
        message: "Mensaje enviado desde: controllers/publication.js"
    });
}

module.exports = {
    publicationTest
}