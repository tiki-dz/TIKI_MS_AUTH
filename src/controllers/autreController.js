const { DzCity } = require('../models')

async function getCities (req, res) {
  try {
    const city = await DzCity.findAll()
    res.status(200).send({
      data: city,
      success: true,
      message: 'success'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'error',
      errors: [error]
    })
  }
}
module.exports = { getCities }
