const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const Message = require('../model/Message');
const Conversation = require('../model/Conversation');
 

// multer ......................
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // path of public folder in client side
        cb(null, '../client/public/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // console.log(file)
    }
});

const upload = multer({ storage: storage });
// multer ................................

router.use(bodyParser.json())


//Route 1: 
router.post('/add', [
    body('senderId', "Sender Id is not found").isLength({ min: 5 }),
    body('receiverId', 'Riciever not Exits').isLength({ min: 5 }),
    body('conversationId', 'Riciever not Exits').isLength({ min: 5 }),
], async function (req, res) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();

        await Conversation.findByIdAndUpdate(req.body.conversationId, { message: req.body.text })
        return res.status(200).json("message save");

    } catch (err) {
        return res.status(500).json(err.Message);
    }


})

// Route:2 Get
router.get('/get/:id', async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id });
        return res.status(200).json(messages);

    } catch (error) {
        res.status(500).json(error);
    }
})


router.post('/upload/image', upload.single('uploadFile'), async (req, res) => {

    let success = false;

    console.log(req.body)

    try {

        if (!req.file) {
            // if (req.file.filename) user.profile.profilePic = req.file.filename;
            res.status(500).json({ success, message: "File not uploaded" });
        }

        // if (fullName) user.profile.fullName = fullName;
       
        // await user.save();
        success = true;
        res.status(200).json({ success });
    } catch (err) {
        console.log("Error : " + err.message);
        res.status(500).json({ success, message: "An internal error" });
    }
})

module.exports = router;