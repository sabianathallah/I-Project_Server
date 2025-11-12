const { verifyToken } = require('../helpers/jwt')

const authentication = async (req, res, next) => {
    try {
        const { authorization } = req.headers

        if (!authorization) throw { name: "Unauthorized" }

        const token = authorization.split(' ')[1]

        const decoded = verifyToken(token)

        // normalize token payload: accept either `id` or `userId`
        const tokenUserId = decoded.id || decoded.userId

        req.user = {
            userId: decoded.id || decoded.userId,
            email: decoded.email,
            role: decoded.role
        }
        next()
    } catch (err) {
        next(err)
    }
} 

module.exports = authentication