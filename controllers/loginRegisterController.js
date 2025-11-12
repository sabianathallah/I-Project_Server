const {User} = require('../models')
const { compare } = require('../helpers/bcrypt')
const { hash } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')

class LoginRegisterController {
    static async register(req, res, next) {
        try {
            const { email, password, role, fullName } = req.body
            if (!email || !password) throw { name: "BadRequest" }
            // hash password before creating user
            const hashed = hash(password)
            const user = await User.create({ email, password: hashed, role: role || "user", fullName })

            res.status(201).json({
                message: "Success create new user",
                user
            })
        } catch (err) {
            next(err)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body

            if (!email || !password) throw { name: "BadRequest" }

            // proses nyari user bedasarkan email
            const user = await User.findOne({
                where: {
                    email
                }
            })

            if (!user) throw { name: "LoginError" }

            if (!compare(password, user.password)) throw { name: "LoginError" }

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role
            }

            const access_token = signToken(payload)

            res.status(200).json({
                access_token
            })
        } catch (err) {
            next(err)
        }
    }
}

module.exports = LoginRegisterController