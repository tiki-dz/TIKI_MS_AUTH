const { DzCity } = require('../models')

function add58wilaya (req, res) {
  try {
    const data = req.body
    data.forEach(async element => {
      const tmp = await DzCity.create({
        name: element.nom
      })
      console.log(tmp)
    })
    return res.status(200).send().json({ success: true, message: 'success' })
  } catch (error) {
    return res.status(500).send({ error: error, success: false, message: 'processing err' })
  }
}

// setters

module.exports = { add58wilaya }
