const express = require('express');
const router = express.Router();
const FollowController = require('../controllers/follow')

// Definir rutas
router.get("/testFollow", FollowController.followTest);

// Exportar router
module.exports = router;