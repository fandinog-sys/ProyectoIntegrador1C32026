const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

//GET
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//POST

router.post('/', async (req, res) => {
    try {
        const usuario = new Usuario(req.body);

        const usuarioGuardado = await usuario.save();

        res.status(201).json({
            mensaje: "Usuario creado",
            datos: usuarioGuardado
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
