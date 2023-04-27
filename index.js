// Importar dependencias
const express = require('express');
const cors = require('cors');
require('dotenv').config()

const connection = require('./database/connection');
const userRoutes = require('./routes/user');
const publicationRoutes = require('./routes/publication');
const followRoutes = require('./routes/follow');

// Mensaje bienvenida
console.log("API NODE para RED SOCIAL arrancada")

// Conexion a bd
connection();

// Crear servidor node
const app = express();
const port = process.env.PORT;

// Configurar cors
app.use(cors({origin: '*'}))

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar conf rutas
app.use("/api/user", userRoutes);
app.use("/api/publication", publicationRoutes)
app.use("/api/follow", followRoutes)

// Poner servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("Servidor de node corriendo en el puerto: ", port)
})