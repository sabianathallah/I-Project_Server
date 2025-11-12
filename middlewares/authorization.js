const { Product, User, Category } = require('../models')

// isAdmin middleware: ensure the requester (from token) is admin
const isAdmin = async (req, res, next) => {
    try {
        const userIdFromToken = req.user && (req.user.userId || req.user.id)
        if (!userIdFromToken) throw { name: 'Unauthorized' }

        const user = await User.findByPk(userIdFromToken)
        if (!user) throw { name: 'Unauthorized' }

        if (user.role !== 'admin') throw { name: 'Forbidden' }

        next()
    } catch (err) {
        next(err)
    }
}

module.exports = isAdmin