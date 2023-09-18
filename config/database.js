import Sequelize from 'sequelize'

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  define: {
    timestamps: false,
  },
})

export default sequelize
