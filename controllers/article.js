const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const NotRequestError = require('../errors/not-request-err');
const NotRulesError = require('../errors/not-rules-err');

module.exports.getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .then((article) => res.send({ data: article }))
    .catch(next);
};

module.exports.createArticle = (req, res, next) => {
  const {
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
  } = req.body;
  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: req.user._id,
  })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotRequestError('Переданы некорректные данные');
      }

      next(err);
    })
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id)
    .select('owner')
    .then((article) => {
      if (article.owner !== req.user._id) {
        throw new NotRulesError('Нет прав доступа');
      }

      return Article.findByIdAndRemove(req.params.id)
        .orFail(() => {
          throw new NotFoundError('не найдена статья с таким id');
        })
        .then((dataArticle) => res.send({ data: dataArticle }))
        .catch((err) => {
          next(err);
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotRequestError('Не валидный id статья');
      }
      if (err.name === 'TypeError') {
        throw new NotFoundError('Нет статья с таким id');
      }
      next(err);
    })
    .catch(next);
};
