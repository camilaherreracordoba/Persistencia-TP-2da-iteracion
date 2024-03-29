var express = require("express");
var router = express.Router();
var models = require("../models");


router.get("/", (req, res,next) => {
  const cantidadAVer = parseInt(req.query.cantidadAVer);
  const paginaActual = parseInt(req.query.paginaActual);

models.alumno.findAll({
    attributes: ["id","nombre","id_carrera"],
  
    /////////se agrega la asociacion 
    include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["id","nombre"]}],
    ////////////////////////////////
    offset:(paginaActual -1) * cantidadAVer,
    limit: cantidadAVer

  }).then(alumnos => res.send(alumnos)).catch(error => { return next(error)});
});

router.post("/", (req, res) => {
  models.alumno
    .create({ nombre: req.body.nombre,id_carrera:req.body.id_carrera })
    .then(alumno => res.status(201).send({ id: alumno.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otro alumno con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
}); 

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "nombre", "id_carrera"],
      include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["id","nombre"]}],
      where: { id }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findAlumno(req.params.id, {
    onSuccess: alumno => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

const filtarPorCarrera = (id_carrera, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findAll({
      attributes: ["id", "nombre", "id_carrera"],
      where: { id_carrera }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/carrera/:id_carrera", (req, res) => {
  filtarPorCarrera(req.params.id_carrera, {
    onSuccess: alumno => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});
router.put("/:id", (req, res) => {
  const onSuccess = alumno =>
    alumno
      .update({ nombre: req.body.nombre, id_carrera: req.body.id_carrera }, { fields: ["nombre", "id_carrera"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra alumno con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = alumno =>
    alumno
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
