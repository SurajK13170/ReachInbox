require("dotenv").config()
const DB_name = process.env.DataBase_Name
const hostName = process.env.hostName
Username = process.env.Username
Password_sql =process.env.Password_sql

const {Sequelize} = require('sequelize')
const sequelize = new Sequelize('reachIndex', 'root', 'suraj8700', {
    host: 'localhost',
    dialect: "mysql",
})

module.exports = {sequelize}