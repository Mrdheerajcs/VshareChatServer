const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const User = require('../model/User');
const fetchuser = require('../middleware/fetchuser');
router.use(bodyParser.json())
// const upload = require('../middleware/upload');

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



//Route :1 update profile POST:"/api/profile/updateprofile"
router.put('/updateprofile', fetchuser, upload.single('profilePic'), async function (req, res) {

    let success = false;

    // console.log(req.body);
    // console.log(req.file)

    const { profilePic, fullName, nickName, phoneNumber, location, bio, language, facebook, twitter, youtube, instagram, linkedin } = req.body;

    // console.log(profilePic)

    try {

        let userId = req.user.id;

        let user = await User.findById(userId);

        if (req.file) {
            if (req.file.filename) user.profile.profilePic = req.file.filename;
        }

        if (fullName) user.profile.fullName = fullName;
        if (nickName) user.profile.nickName = nickName;
        if (phoneNumber) user.profile.phoneNumber = phoneNumber;
        if (location) user.profile.location = location;
        if (bio) user.profile.bio = bio;
        if (language) user.profile.language = language;
        if (facebook) user.profile.facebook = facebook;
        if (instagram) user.profile.instagram = instagram;
        if (linkedin) user.profile.linkedin = linkedin;
        if (youtube) user.profile.youtube = youtube;
        if (twitter) user.profile.twitter = twitter;

        await user.save();

        success = true;
        res.status(200).json({ success });
    } catch (err) {
        console.log("Error : " + err.message);
        res.status(500).json({ success, message: "An internal error" });
    }
})

// Route:3 Get user profile
router.get('/getprofile', fetchuser, async (req, res) => {
    try {
        var userid = req.user.id;
        const user = await User.findById(userid).select("-password");
        res.json({ user })
    } catch (e) {
        res.status(500).json({ message: "This is internal Error...." })
    }
})

module.exports = router;