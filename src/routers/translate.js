const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

 
const translate = require('translate-google');


router.use(bodyParser.json())


//Route 1: 
router.post('/get', async function (req, res) {

    const { msg, target } = req.body;
    // console.log(msg, target)

    try {
        const translation = await translate(msg, { from: 'auto', to: target })
        // console.log(translation)
        return res.status(200).json({translation:translation});

    } catch (err) {
        return res.status(500).json(err.Message);
    }


})

module.exports = router;