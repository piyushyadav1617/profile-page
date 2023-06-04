import UserModel from '../model/User.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator'
import dotenv from 'dotenv'
dotenv.config();



/** middleware to verify user */
export async function verifyUser(req, res, next) {
    try {

        const { username } = req.method == "GET" ? req.query : req.body;

        // check the user existance
        let exist = await UserModel.findOne({ username });
        if (!exist) return res.status(404).send({ error: "Can't find User!" });
        next();

    } catch (error) {
        return res.status(404).send({ error: "Authentication Error" });
    }
}



/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/




// export async function register(req, res) {

//     try {
//         const { username, password, profile, email } = req.body
//         // check the existing user
//         const existUsername = new Promise((resolve, reject) => {
//             UserModel.findOne({ username },
//                 function (err, user) {
//                     if (err) reject(new Error(err))
//                     if (user) reject({ error: "Please use unique username" });

//                     resolve();
//                 })
//         })

//         // check existing email
//         const existEmail = new Promise((resolve, reject) => {
//             UserModel.findOne({ email },
//                 function (err, email) {
//                     if (err) reject(new Error(err))
//                     if (email) reject({ error: "Please use unique email" });

//                     resolve();
//                 })
//         })

//         Promise.all([existUsername, existEmail])
//             .then(() => {
//                 if (password) {
//                     bcrypt.hash(password, 10)
//                         .then(hashedPassword => {
//                             const user = new UserModel({
//                                 username,
//                                 password: hashedPassword,
//                                 profile: profile || "",
//                                 email
//                             })
//                             user.save()
//                                 .then(result => res.status(201).send({ msg: "user registered successfully" }))
//                                 .catch(error => res.status(500).send({ error }));

//                         }).catch(error => {
//                             res.status(500).send({
//                                 error: "Enable to hashed password"
//                             })
//                         })
//                 }
//             }).catch(error => {
//                 res.status(500).send({ error: "could not resolve the promise" })
//             })



//     } catch (error) {
//         return res.status(500).send({ error });
//     }

// }


export async function register(req, res) {
    try {
        const { username, password, profile, email } = req.body;

        // Check for existing user
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).send({ error: "Please use a unique username" });
        }

        // Check for existing email
        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).send({ error: "Please use a unique email" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new UserModel({
            username,
            password: hashedPassword,
            profile: profile || "",
            email
        });

        try {
            await user.save();
            res.status(201).send({ msg: "User registered successfully" });
        } catch (error) {
            return res.status(500).send({ error });
        }


    } catch (error) {
        return res.status(500).send({ error });
    }
}






/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
// export async function login(req, res) {
//     const { username, password } = req.body

//     try {
//         UserModel.findOne({ username })
//             .then(user => {
//                 bcrypt.compare(password, user.password)
//                     .then(passwordCheck => {
//                         if (!passwordCheck) return res.status(400).send({ error: "Don't have Password" });


//                         // create jwt token
//                         const token = jwt.sign({
//                             userId: user._id,
//                             username: user.username
//                         }, ENV.JWT_SECRET, { expiresIn: "24h" });
//                         console.log("checking password...")
//                         return res.status(200).send({
//                             msg: "Login Successful...!",
//                             username: user.username,
//                             token
//                         });
//                     })
//                     .catch(error => {
//                         return res.status(400).send({ error: "Password does not Match" })
//                     })
//             })
//             .catch(error => {
//                 return res.status(404).send({ error: "Username not Found" });
//             })

//     } catch (error) {
//         return res.status(500).send({ error });
//     }
// }

export async function login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(404).send({ error: "Username not found" });
        }

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            return res.status(400).send({ error: "Password does not match" });
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).send({
            msg: "Login successful!",
            username: user.username,
            token,
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}





/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
    const { username } = req.params;
    try {
        if (!username) { return res.status(501).send({ error: "Invalid Username" }); }


        const user = await UserModel.findOne({ username })
        console.log(user);
        if (!user) return res.status(501).send({ error: "Couldn't Find the User" });

        /** remove password from user */
        // mongoose return unnecessary data with object so convert it into json
        const { password, ...rest } = Object.assign({}, user.toJSON());

        return res.status(201).send(rest);



    } catch (error) {
        return res.status(404).send({ error })
    }
}


/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
    try {

        const { userId } = req.user;
        const body = req.body;
        const existUser = await UserModel.findOne({ _id: userId })
        // console.log(existUser);
        if (existUser) {


            // update the data
            const user = await UserModel.updateOne({ _id: userId }, body);


            return res.status(201).send({ msg: "Record Updated...!" });


        } else {
            return res.status(401).send({ error: "User Not Found...!" });
        }

    } catch (error) {
        return res.status(401).send({ error: error.message });
    }
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
    req.app.locals.OTP = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        console.log(req.app.locals.resetSession)
        return res.status(201).send({ msg: 'Verified Successsfully!' })
    }
    console.log(" reset session expired")
    return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid

/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
    if (req.app.locals.resetSession) {
        console.log(req.app.locals.resetSession)


        return res.status(201).send({ flag: req.app.locals.resetSession });
    }
    return res.status(404).send({ msg: "Session expired" })
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
    try {
        if (!req.app.locals.resetSession) return res.status(404).send({ error: "Session expired" });
        const { username, password } = req.body;

        try {
            UserModel.findOne({ username })
                .then(user => {
                    bcrypt.hash(password, 10)
                        .then(async hashedPassword => {
                            const update = await UserModel.updateOne({ username: user.username }, { password: hashedPassword });
                            req.app.locals.resetSession = false; // allow access to this route only once
                            return res.status(201).send({ msg: "Record Updated...!" });

                        })
                        .catch(e => {
                            return res.status(500).send({ error: "Enable to hashed password" })
                        })

                }

                )
                .catch(error => {
                    return res.status(404).send({ error: "User not found" });
                })

        } catch (error) {
            return res.status(501).send({ error });
        }
    } catch (error) {
        return res.status(401).send({ error });
    }
}
