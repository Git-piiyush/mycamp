const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}


module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to myCamp')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }

}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}


module.exports.login = (req, res) => {

    req.flash('success', 'Welcome back!!')
    const redirectUrl = req.session.returnTo || '/campgrounds'; //after log-in user return the url which he in on before login
    res.redirect(redirectUrl)

}


module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "GoodBye!!");
    res.redirect('/campgrounds');
}
