var express = require('express');
var router = express.Router();
const mongoose = require('../db/db');
const User = require('../models/user');

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/userRegister', async (req, res) => {
  res.render('userRegister');
});

router.get('/userLogin', async (req, res) => {
  res.render('userLogin');
});

module.exports = router;
