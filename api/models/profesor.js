'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class profesor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        profesor.belongsTo(models.materia// modelo al que pertenece
            ,{
              as : 'Materia-Relacionada',  // nombre de mi relacion
              foreignKey: 'id_materia'     // campo con el que voy a igualar
            })
    }
  };
  profesor.init({
    nombre: DataTypes.STRING,
    id_materia: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'profesor',
  });
  return profesor;
};