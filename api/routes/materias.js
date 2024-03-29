var express = require("express");
var router = express.Router();
var models = require("../models");


router.get("/", (req, res,next) => {
  const cantidadAVer = parseInt(req.query.cantidadAVer);
  const paginaActual = parseInt(req.query.paginaActual);

models.materia.findAll({
    attributes: ["id","nombre","id_carrera", "id_aula"],
  
    /////////se agrega la asociacion 
    include:[
      {as:'Carrera-Relacionada', model:models.carrera, attributes:["id","nombre"]},
      {as:'Aula-Relacionada', model:models.aula, attributes: ["nombre"]}
    ],
    offset:(paginaActual -1) * cantidadAVer,
    limit: cantidadAVer

  }).then(materias => res.send(materias)).catch(error => { return next(error)});
});

router.post("/", (req, res) => {
  models.materia
    .create({ nombre: req.body.nombre,id_carrera:req.body.id_carrera,id_aula:req.body.id_aula })
    .then(materia => res.status(201).send({ id: materia.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra materia con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findmateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre", "id_carrera", "id_aula"],
    include:[
      {as:'Carrera-Relacionada', model:models.carrera, attributes:["id","nombre"]},
      {as:'Aula-Relacionada', model:models.aula, attributes: ["id","nombre"]}
    ],
      where: { id }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

const filtarPorCarrera = (id_carrera, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findAll({
      attributes: ["id", "nombre", "id_carrera", "id_aula"],
    include:[
      {as:'Carrera-Relacionada', model:models.carrera, attributes:["id","nombre"]},
      {as:'Aula-Relacionada', model:models.aula, attributes: ["id","nombre"]}
    ],
      where: { id_carrera }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

router.get("/carrera/:id_carrera", (req, res) => {
  filtarPorCarrera(req.params.id_carrera, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});
router.get("/:id", (req, res) => {
  findmateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .update({ nombre: req.body.nombre, id_carrera: req.body.id_carrera, id_aula: req.body.id_aula }, { 
        fields: ["nombre", "id_carrera", "id_aula"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
