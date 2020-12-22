const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { login, createUser } = require('./controllers/user');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');
const { limiter } = require('./middlewares/reteLimit');

const app = express();
app.use(cors());

app.use(requestLogger);

app.use(cookieParser());
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(limiter);

mongoose.connect('mongodb://localhost:27017/newsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(/([\w-]\.?)+@([\w-]\.?)+\.\w{2,}/),
    password: Joi.string().required().min(8).max(30),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().pattern(/([\w-]\.?)+@([\w-]\.?)+\.\w{2,}/),
    password: Joi.string().required().min(8).max(30),
  }),
}), createUser);

app.use('/users', require('./routes/user'));
app.use('/articles', require('./routes/article'));

app.use(errorLogger);

app.use(errors());

app.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(err.statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT);
