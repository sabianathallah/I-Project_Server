
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

  

}

module.exports = ArticleController