class PeriodController {

    static async read(req, res, next) {
        try {
            const { Period } = require('../models');
            const periods = await Period.findAll();
            res.status(200).json(periods);
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { Period } = require('../models');
            const { name_ofPeriod } = req.body;

            const newPeriod = await Period.create({
                name_ofPeriod
            });

            res.status(201).json(newPeriod);
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const { Period } = require('../models');
            const { id } = req.params;
            const { name_ofPeriod } = req.body;

            const period = await Period.findByPk(id);
            if (!period) throw { name: 'NotFound' };

            period.name_ofPeriod = name_ofPeriod;

            await period.save();

            res.status(200).json(period);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PeriodController;