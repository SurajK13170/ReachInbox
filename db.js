require("dotenv").config()
const DB_name = process.env.DataBase_Name
const host = process.env.host
const User_Name = process.env.User_Name
const Password_sql =process.env.Password_sql

const {Sequelize} = require('sequelize')
const sequelize = new Sequelize('reachInbox', User_Name, Password_sql, {
    host: host,
    dialect: "mysql",
    port:16712
})

module.exports = {sequelize}
