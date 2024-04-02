const pool=require("../../database/conexion");
const bcrypt=require("bcryptjs");

const vistalogin = async (req, res) => {
    res.render("login" ,{message:""}); 
  };

  module.exports = { vistalogin};