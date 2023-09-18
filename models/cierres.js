import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Cierres extends Model {}

Cierres.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    locacion: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    ultimo: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Cierres',
    tableName: 'cierres',
    timestamps: false,
  }
)

export default Cierres
