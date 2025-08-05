/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";


passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL,
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value;

                if (!email) {
                    return done(null, false, { message: "No email Found" })
                }

                let user = await User.findOne({ email })

                if (!user) {
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVarified: true,
                        auths: [
                            {
                                provider: "google",
                                providerId: profile.id,
                            }
                        ]
                    })
                }

                return done(null, user)

            } catch (error) {
                console.log("Google strategy error", error);
                done(error);
            };
        }
    )
);


// Google Authentication Flow
// Frontend localhost:5173 -> Backend localhost:5000/api/v1/auth/google -> passport > google oAuth consent -> google login -> login successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token -> api access


// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void)=>{
    done(null, user._id)
});

passport.deserializeUser( async (id: string, done: any)=>{
    try {
        const user = await User.findById(id)
        done(null, user);
    } catch (error) {
        console.log(error);
        done(error);
        
    }
})