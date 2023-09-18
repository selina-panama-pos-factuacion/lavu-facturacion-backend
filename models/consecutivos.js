import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Consecutivos extends Model {}

Consecutivos.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    locacion: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    consecutivo: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Consecutivos',
    tableName: 'consecutivos',
    timestamps: false,
  }
)

export default Consecutivos
