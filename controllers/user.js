// Importar dependencias y modulos
const bcrypt = require('bcrypt');
const mongoosePagination = require('mongoose-pagination')

const User = require('../models/UserModel')
const jwt = require('../services/jwt')

const register = async (req, res) => {
    // Recoger datos de la petición
    let body = req.body;

    // Comprobar que me llegan bien los datos (+ validación)
    if (!userToUpdate.name || !userToUpdate.email || !userToUpdate.password || !userToUpdate.nickname) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        })
    }

    // Control de usuario duplicado
    UserExist = await User.find({
        "$or": [
            { email: userToUpdate.email },
            { nickname: userToUpdate.nickname }
        ]
    })

    if (UserExist && UserExist.length >= 1) {
        return res.status(200).json({
            status: "Success",
            message: "Ya existe un usuario con ese email o nickname"
        });
    }

    // Cifrar contraseña
    let pwd = await bcrypt.hash(userToUpdate.password, 10)
    userToUpdate.password = pwd;

    // Crear objeto de Usuario
    let user_to_save = User(body)

    // Guardar usuario
    userSaved = await user_to_save.save()

    if (userSaved) {
        return res.status(201).json({
            status: "Success",
            message: "Usuario creado exitosamente",
            userSaved
        })
    }

    return res.status(500).json({
        status: "Error",
        message: "Error al registrar el usuario",
    })

}

const login = async (req, res) => {
    // Recoger los datos del body
    let body = req.body;

    if (!body.email || !body.password) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar"
        })
    }

    // Buscar en la bd si existe
    let userExist = await User.findOne({ email: body.email })/*.select({"password":0})*/.exec()
    if (!userExist) {
        return res.status(400).json({
            status: "Error",
            message: "No existe el usuario"
        })
    }

    // comprobar contraseña
    const pass = bcrypt.compareSync(body.password, userExist.password)
    if (!pass) {
        return res.status(400).json({
            status: "Error",
            message: "La contraseña incorrecta"
        })
    }

    // Conseguir el token
    const token = jwt.createToken(userExist);


    // Devolver datos del usuario
    return res.status(200).json({
        status: "Success",
        message: "Te has identificado correctamente",
        user: {
            id: userExist._id,
            name: userExist.name,
            nickname: userExist.nickname
        },
        token
    })
}

const profile = async (req, res) => {
    // Recibir el parametro  del id del usuario por la url
    const id = req.params.id;

    // Consulta para sacar los datos del usuario
    try {
        let userProfile = await User.findById(id).select({ password: 0, role: 0 }).exec()
        if (!userProfile) {
            return res.status(404).send({
                status: "Error",
                message: "El usuario no existe"
            })
        }

        // Devolver la información
        //TODO: Posteriormente: devolver información de follows
        return res.status(200).send({
            status: "Success",
            userProfile
        })
    } catch (error) {
        return res.status(400).send({
            status: "Error",
            message: "Hay un error"
        })
    }


}

const list = async (req, res) => {
    // Obtenemos el query param llamado page que viene en la url
    let paramPage = req.query.page;

    // Verificamos que venga el parametro
    if (!paramPage) {
        return res.status(400).send({
            status: "Error",
            message: "El parametro page no fue proveido"
        });
    }

    // Controlar en que pagina estamos
    let page = 1;
    if (paramPage) {
        page = paramPage
    }
    page = parseInt(page);

    // Consulta con mongoose pagination
    let itemsPerPage = 5;
    let users = await User.find().sort('_id').paginate(page, itemsPerPage);
    let totalUsers = await User.countDocuments();
    let numPages = Math.ceil(totalUsers / itemsPerPage)

    if (paramPage > numPages) {
        return res.status(404).send({
            status: "Error",
            message: "Pagina no encontrada",
        });
    }

    return res.status(200).send({
        status: "Success",
        info: {
            next: (page >= 1 && page < numPages) ? `http://localhost:3900/api/user/list?page=${page + 1}` : "",
            previous: (page == 1) ? "" : `http://localhost:3900/api/user/list?page=${page - 1}`,
            page,
            itemsPerPage,
            totalUsers,
            pages: numPages
        },
        users,
    })
}

const updateProfile = async (req, res) => {
    // Recoger info del usuario a actualizar
    const userIdentity = req.user;
    const userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userIdentity.iat
    delete userIdentity.exp
    delete userIdentity.role
    delete userIdentity.image

    // Comprobar si el usuario ya existe
    try {
        let UserExist = await User.find({
            "$or": [
                { email: userToUpdate.email },
                { nickname: userToUpdate.nickname }
            ]
        })

        let userIsset = false;
        UserExist.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).json({
                status: "Success",
                message: "Ya existe un usuario con ese email o nickname"
            });
        }

        // Cifrar contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10)
            userToUpdate.password = pwd;
        }

        // Buscar y actualizar
        const userUpdate = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });

        if (!userUpdate) {
            return res.status(500).json({
                status: "Error",
                message: "Error al actualizar usuario",
            })
        }

        // Devolver respuesta
        res.status(200).send({
            status: "Success",
            message: "Metodo para actualizar usuario",
            user: userUpdate
        })

    } catch (error) {
        return res.status(400).send({
            status: "Error",
            message: "Hubo un error al actualizar el perfil",
            error
        });
    }
}

module.exports = {
    register,
    login,
    profile,
    list,
    updateProfile
}