const {User} = require('../models')
const { compare } = require('../helpers/bcrypt')
const { hash } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

class LoginRegisterController {
    static async register(req, res, next) {
        try {
            const { email, password, role, fullName } = req.body
            if (!email || !password) throw { name: "BadRequest" }
            // No need to hash here, model hook will handle it
            const user = await User.create({ email, password, role: role || "user", fullName })

            res.status(201).json({
                message: "Success create new user",
                email: user.email
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

    static async googleLogin(req, res, next) {
        try {
            const { googleToken } = req.body;

            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { email, name } = payload;

            let user = await User.findOne({ where: { email } });

            if (!user) {
                user = await User.create({
                    fullName: name,
                    email,
                    password: Math.random().toString(36).slice(-8), // Random password for Google users
                });
            }

            const access_token = signToken({ id: user.id, email: user.email });
            res.status(200).json({
                access_token,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    isMembership: user.isMembership
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LoginRegisterController