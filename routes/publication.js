const express = require('express');
const router = express.Router();
const PublicationController = require('../controllers/publication')

// Definir rutas
router.get("/testPublication", PublicationController.publicationTest);

// Exportar router
module.exports = router;