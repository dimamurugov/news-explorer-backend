const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotLoginError = require('../errors/not-login-err');
const NotRequestError = require('../errors/not-request-err');
const ConflictError = require('../errors/conflict-err');
const NotFoundError = require('../errors/not-found-err');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      });
      res.status(200).send({
        name: user.name,
        email: user.email,
        id: user._id,
        message: 'Авторизация прошла успешно!',
      })
        .end();
    })
    .catch(() => {
      throw new NotLoginError('Неправильные почта или пароль');
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password || '', 10)
    .then((hash) => {
      const regex = /\w.{7,}/i;
      if (!regex.test(password) || password === undefined) {
        throw new NotRequestError('Пароль должен быть миниму 8 символов');
      }
      return hash;
    })
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotRequestError('Пароль должен быть миниму 8 символов');
      }
      if (err.name === 'MongoError') {
        throw new ConflictError('Такой пользователь уже существует');
      }
      next(err);
    })
    .catch(next);
};

module.exports.getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('не найден пользователь с таким id');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotRequestError('Не валидный id');
      }

      next(err);
    })
    .catch(next);
};
