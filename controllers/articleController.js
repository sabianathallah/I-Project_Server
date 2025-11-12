
class ArticleController {
  static async read(req, res, next) {
    try {
      const { Article, User, Period } = require('../models');
      const articles = await Article.findAll({
        include: [User, Period]
      });
      res.status(200).json(articles);
    } catch (error) {
      next(error);
    }
  } 

  static async detailById(req, res, next) { 
    try {
      const { Article, User, Period } = require('../models');
      const { id } = req.params;
      const article = await Article.findByPk(id, {
        include: [User, Period]
      });
      if (!article) throw { name: 'NotFound' };
      res.status(200).json(article);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { Article } = require('../models');
      const { title, content, PeriodId } = req.body;
      const UserId = req.user.id;

      const newArticle = await Article.create({
        title,
        content,
        PeriodId,
        UserId
      });

      res.status(201).json(newArticle);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { Article } = require('../models');
      const { id } = req.params;
      const { title, content, PeriodId } = req.body;

      const article = await Article.findByPk(id);
      if (!article) throw { name: 'NotFound' };

      article.title = title;
      article.content = content;
      article.PeriodId = PeriodId;

      await article.save();

      res.status(200).json(article);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { Article } = require('../models');
      const { id } = req.params;

      const article = await Article.findByPk(id);
      if (!article) throw { name: 'NotFound' };

      await article.destroy();

      res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
  

}

module.exports = ArticleController