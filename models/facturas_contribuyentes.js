import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class FacturasContribuyentes extends Model {}

FacturasContribuyentes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    order: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    locacion: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'FacturasContribuyentes',
    tableName: 'facturas_contribuyentes',
    timestamps: false,
  }
)

export default FacturasContribuyentes
