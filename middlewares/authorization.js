const { Product, User, Category } = require('../models')

// authorization for product-specific routes
// - admin: allowed to proceed
// - staff: allowed only if they own the product (Product.UserId === req.user.userId)
const authorization = async (req, res, next) => {
    try {
        const userIdFromToken = req.user && (req.user.userId || req.user.id)
        if (!userIdFromToken) throw { name: 'Unauthorized' }

        // fetch user from DB to get authoritative role
        const user = await User.findByPk(userIdFromToken)
        if (!user) throw { name: 'Unauthorized' }

        const { id } = req.params
        // First check if this is a product route (product with this id exists)
        const product = await Product.findByPk(id)
        if (product) {
            // admin can modify any product
            if (user.role === 'admin') return next()

            // staff can only modify their own products
            if (user.role === 'staff') {
                if (product.UserId !== user.id) {
                    throw { name: 'Forbidden' }
                }
                return next()
            }

            // other roles -> forbidden
            throw { name: 'Forbidden' }
        }

        // If not a product, maybe it's a category route: check category
        const category = await Category.findByPk(id)
        if (category) {
            // only admin may manage categories
            if (user.role === 'admin') return next()
            throw { name: 'Forbidden' }
        }

        // resource not found
        throw { name: 'NotFound' }
    } catch (err) {
        next(err)
    }
}

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

module.exports = { authorization, isAdmin }