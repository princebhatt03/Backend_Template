const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database Connected');
  })
  .catch(err => {
    console.log('Not Connected', err);
  });

module.exports = mongoose;
