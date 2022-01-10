const app = require('./app');
const Mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: 'config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

const dbConnect = async (dataBase) => {
  await Mongoose.connect(dataBase, {
    useNewUrlParser: true,
  });
  console.log('Database connected successfully');
};
dbConnect(DB);

const port = process.env.PORT;
const name = process.env.PORT_NAME;
app.listen(port, (req, res, next) => {
  console.log(`App running at http://${name}:${port}`);
});
