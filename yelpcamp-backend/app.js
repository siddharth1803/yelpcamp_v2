if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express");
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const morgan = require("morgan")
const ExpressError = require('./utils/ExpressError');
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require('connect-flash');
const passport = require("passport")
const LocalStratergy = require("passport-local")
const User = require("./models/user")
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet")
const cors = require("cors");
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users");
const uri = `mongodb+srv://${process.env.ATLAS_USER}:${process.env.ATLAS_PASS}@cluster0.janse90.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/yelp-camp`;
// const uri = "mongodb://localhost:27017/yelp-camp"

app.set('trust proxy', 1);

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.FE_URL);
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
})

app.use(cors({
    origin: process.env.FE_URL,
    credentials: true
}));

mongoose.connect(uri).then(() => {
    console.log("connected")
}).catch((e) => {
    console.log("error", e)
})

const store = MongoStore.create({
    mongoUrl: uri,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SESSION_SECRET
    }
});

const sessionConfig = {
    store,
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "None",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig))

// app.use(helmet({ contentSecurityPolicy: false }))
app.use(session(sessionConfig));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("tiny"))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStratergy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(mongoSanitize())
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get("/", (req, res) => {
    res.json({ success: true })
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)



app.all("*", (req, res, next) => {
    next(new ExpressError("page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (process.env.NODE_ENV == "production") {
        err.stack = ""
    }

    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    return res.status(statusCode).json({ success: false, error: err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
