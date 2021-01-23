const mongoose = require('mongoose');
const validator = require('validator');

const articleSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (avatar) => validator.isURL(avatar),
      message: 'Не валидный адресс пользователя',
    },
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: (avatar) => validator.isURL(avatar),
      message: 'Не валидный адресс пользователя',
    },
  },
  owner: {
    type: String,
    required: true,
    select: false,
  },
});

module.exports = mongoose.model('article', articleSchema);
