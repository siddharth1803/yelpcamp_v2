const passport = require("passport");
const User = require("../models/user");

module.exports.userData = (req, res) => {
    {
        const email = req.user.email;
        const username = req.user.username;
        const userId = req.user._id
        return res.json({ success: true, email, username, userId })
    }
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err)
                res.status(400).json({ message: err })
            // return next(err);
            res.json({ success: true });
        })
    } catch (e) {
        // req.flash('error', e.message);
        res.status(500).json({ message: e.message })
    }
}



module.exports.login = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            res.status(400)
            // return res.redirect(`${process.env.FE_URL}/login`);
            return res.status(400).json({ success: false, message: "incorrect credentials" })
        }
        req.login(user, err => {
            if (err) {
                return res.status(400).json({ success: false, message: "incorrect credentials" })
                // next(err);
                // return res.redirect(`${process.env.FE_URL}/login`);

            }
            return res.status(200).json({ success: true })
            // return res.redirect(`${process.env.FE_URL}`);
        });
    })(req, res, next);
}




module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.json({ success: true })
    });
}