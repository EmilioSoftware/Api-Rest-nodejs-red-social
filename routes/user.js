const express = require('express');
const router = express.Router();
const UserController = require('../controllers/User')
const check = require('../middlewares/auth')

// Definir rutas
router.post("/register", UserController.register)
router.post("/login", UserController.login)

router.get('/profile/:id', [check.auth], UserController.profile)
router.get('/list', [check.auth], UserController.list)
router.put("/updateProfile", [check.auth], UserController.updateProfile)

// Exportar router
module.exports = router;