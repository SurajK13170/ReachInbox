const passport = require("passport");
const { User } = require("./models/Google.User.Model");
const { outlookUser } = require("./models/Outlook.User.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const OutlookStrategy = require('passport-outlook').Strategy;



passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.ClientID,
      clientSecret: process.env.ClientSecret,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Google Profile:", profile);
      profile.tokens = { accessToken, refreshToken };
      try{
        const user = User.create({
          googleId:profile.id,
          displayName:profile.displayName,
          email:profile.emails.value,
          refreshToken:refreshToken,
          accessToken:accessToken
        })
        console.log(user)
      }catch(err){
        throw err
      }
      return done(null, profile);
    }
  )
);

passport.use(new OutlookStrategy({
  clientID: outlookClientId,
  clientSecret: outlookSecret,
  callbackURL: "http://localhost:3000/auth/outlook/callback",
  passReqToCallback: true
},
(accessToken, refreshToken, profile, done) => {
  console.log("Google Profile:", profile);
  profile.tokens = { accessToken, refreshToken };
 
  return done(null, profile);
}
)
);

module.exports = passport;
