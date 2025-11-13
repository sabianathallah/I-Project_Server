const imageKit = require("../utility/imageKit");
const { Article } = require('../models')

class UploadimageController {

    static async uploadimage(req, res, next) {
        try {
            // ensure a file was attached by multer
            if (!req.file) {
                throw { name: 'SequelizeValidationError', errors: [{ message: 'File is required' }] }
            }

            const { buffer, originalname, mimetype } = req.file

            // imageKit expects either a base64 data URI or a readable stream/path
            const base64 = buffer.toString('base64')
            const file = `data:${mimetype};base64,${base64}`

            const result = await imageKit.upload({
                file,
                fileName: originalname,
            });

            // if route contains article id, update article.imageUrl
            const { id } = req.params
            if (id) {
                const article = await Article.findByPk(id)
                if (article) {
                    await article.update({ imageUrl: result.url })
                }
            }

            res.status(200).json({ message: "Image uploaded successfully", url: result.url })
        } catch (error) {
            next(error);
        }
    }


}

module.exports = UploadimageController;