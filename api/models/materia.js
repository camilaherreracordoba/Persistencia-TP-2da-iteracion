'use strict';
module.exports = (sequelize, DataTypes) => {
  const materia = sequelize.define('materia', {
    nombre: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER,
    id_aula:DataTypes.INTEGER
  }, {});
  materia.associate = function(models) {
    

  	//asociacion a carrera (pertenece a:)
  	materia.belongsTo(models.carrera// modelo al que pertenece
    ,{
      as : 'Carrera-Relacionada',  // nombre de mi relacion
      foreignKey: 'id_carrera'     // campo con el que voy a igualar
    })
    materia.belongsTo(models.aula
    ,{
      as: 'Aula-Relacionada',
      foreignKey: 'id_aula'
    })
  };
  return materia;
};