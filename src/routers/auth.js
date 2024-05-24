const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const User = require('../model/User');
const Contact = require('../model/ContactList');
const fetchuser = require('../middleware/fetchuser');

// it's my secret key for encripted and decripted our msg
const JWT_SECRET = "SocialMediaApi";

router.use(bodyParser.json())

//Route:1 sign up user , POST "/api/auth/signup"
router.post('/signup', [
    body('name', 'Enter a valid name').isLength({ min: 2 }),
    body('email', "Enter a valid email").isEmail(),
    body('password', "Enter a password").isLength({ min: 8 })
], async function (req, res) {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        // check the user already exit orr not
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user is already exist." });
        }

        //Use bcrypt fucntion to generate hash not password store in database
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)

        //create new users
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        // JSON WEB TOKEN while user sign in 

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });


    } catch (err) {
        console.log("Error : " + err.message);
        res.status(500).json({ success, message: "Some Error occure" });
    }
})

//Route :2 login user POST:"/api/auth/login"
router.post('/login', [
    body('email', "Enter a valid email").isEmail(),
    body('password', 'Enter a password').isLength({ max: 8 })
], async function (req, res) {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {

        // let user = await User.findOne({email})  it also posible
        let user = await User.findOne({ email: email })
        if (!user) {
            success = false;
            return res.status(400).json({ success, errors: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, errors: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken })

    } catch (err) {
        console.log("Error : " + err.message);
        res.status(500).json({ message: "An internal error" });
    }
})

// Route:3 Get logged in user details user POST "/api/auth/getuser" login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        var userid = req.user.id;
        const user = await User.findById(userid).select("-password");
        res.json({ user })
    } catch (e) {
        res.status(500).json({ message: "This is internal Error...." })
    }
})

//Route :4   followind array by the user.
router.post('/following', fetchuser, async (req, res) => {
    try {
        let success = false;

        const { followId } = req.body;
        const userId = req.user.id;
        // console.log(userId);

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ user, success, message: "User not found" })
        }

        if (user.following.includes(followId)) {
            return res.status(404).json({ success, message: "User already followed" })
        }

        // user = await User.findByIdAndUpdate(req.user.id, {
        //     $push: { following: req.body.followId},
        // }, { new: true })

        user.following.push(followId);
        await user.save();

        success = true;
        res.status(200).json({ success, user, message: '' });

    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: '' });
    }
});


//Route :5   followind array by the user. Add another friend into the your chat list
router.post('/follow', fetchuser, async (req, res) => {
    try {
        let success = false;

        const { email, name, nickname, phoneNumber } = req.body;
        const userId = req.user.id;

        const user = await User.findOne({ email: email });

        const account = await User.findById(userId).select("-password");


        if (!account) {
            return res.status(404).json({ user, success, message: "User not found on Rocket Chat" })
        }

        if (!user) {
            return res.status(404).json({ user, success, message: "User not found on Rocket Chat" })
        }

        const friendId = user._id;
        const userContactList = await Contact.find({ user: userId })

        // console.log(account)

        if (account.contacts.includes(friendId)) {
            return res.status(404).json({ success, message: "User already Exits user" })
        }

        // Add Contact details for each unique person.
        //create new users
        contactList = await Contact.create({
            user: req.user.id,
            contactId: friendId,
            nickname: req.body.nickname,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
        });


        account.contacts.push(friendId);
        await account.save();

        success = true;
        res.status(200).json({ success, account, message: 'Success Fully update and added contact in contact list' });

    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: 'internal server error' });
    }
});

//Route :6   unfollow array by the user. Remove another friend into the your chat list
router.post('/unfollow', fetchuser, async (req, res) => {
    try {
        let success = false;

        const { email } = req.body;
        const userId = req.user.id;

        const user = await User.findOne({ email: email });

        const account = await User.findById(userId).select("-password");

        if (!account) {
            return res.status(404).json({ user, success, message: "User not found on Rocket Chat" })
        }

        if (!user) {
            return res.status(404).json({ user, success, message: "User not found on Rocket Chat" })
        }

        const friendId = user._id;
        // console.log(account)

        if (!account.contacts.includes(friendId)) {
            return res.status(404).json({ success, message: "User Deleted on your contact list" })
        }

        account.contacts.pull(friendId);
        await account.save();

        const removeContact = await Contact.deleteOne({ user: userId })

        const userContactList = await Contact.find({ user: userId })

        if (!userContactList) {
            return res.status(404).json({ user, success, message: "User already Exits in Contact List" })
        }

        success = true;
        res.status(200).json({ success, account, friendId, message: '' });

    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: '' });
    }
});

//Route :7   Show only added contact on chat
router.get('/mycontact', fetchuser, async (req, res) => {
    try {
        let success = false;
        // const user = await User.findById(req.params.id);
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract followed users IDs
        const contactUserIds = user.contacts.map(user => user._id);

        const contactLists = await User.find({ _id: { $in: contactUserIds } }).sort({ createdAt: -1 }).sort({ date: -1 });

        success = true;
        res.json({ success, contactLists, message: 'contact Post only' });
    } catch (err) { console.log(err); }
});

// Route:8 Delete Account logged in user details user POST "/api/auth/getuser" login required
router.delete('/delete-account', fetchuser, async (req, res) => {
    let success = false;
    try {
        var userid = req.user.id;

        const user = await User.findByIdAndDelete(userid).select("-password");
        let success = true;
        res.json({ success, user, message: "Account Deleted successfully" })

    } catch (e) {
        res.status(500).json({ success, message: "This is internal Error...." })
    }
})

// Route:9 UPdate password  s user POST "/api/auth/getuser" login required
router.put('/update-password', fetchuser,[
    body('newPassword', 'Password is too short').isLength({ min: 8 })
], async (req, res) => {
    let success = false;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array(), message:"Password is too short" });
    }

    try {
        const { oldPassword, newPassword } = req.body;

        var userid = req.user.id;

        const user = await User.findById(userid) ;
        // console.log(user);
        const passwordCompare = await bcrypt.compare(oldPassword, user.password)


        if (!passwordCompare) {
            let success = false;
            return res.status(400).json({ success, message: "Incorrect Password !" });
        }

        if (!user) {
            let success = false;
            return res.status(400).json({ success, message: "User Not found !" });
        }

        //Use bcrypt fucntion to generate hash not password store in database
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(newPassword, salt)

        if (newPassword) user.password = secPass;
        await user.save();

        success = true;
        res.json({ success, message: "Password updated Successfully." })

    } catch (e) {
        let success = false;
        res.status(500).json({ success, message: "An Internal Error...."})
    }
})

module.exports = router;