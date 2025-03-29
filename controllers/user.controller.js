const md5 = require('md5');
const User = require('../models/user.model');
const ForgotPassword = require('../models/forgot-password.model');
const generateHelper = require('../helpers/generate');
const sendMailHelper = require('../helpers/sendMail');

// [POST] api/users/register
module.exports.register = async (req, res) => {
  req.body.password = md5(req.body.password);
  
  const existEmail = await User.findOne({ 
    email: req.body.email,
    deleted: false 
  }); 

  if(existEmail) {
    return res.json({
      code: 400,
      message: 'Email already exists'
    });
  } else {

    const user = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    });
    await user.save();

    const token = user.token;
    res.cookie("token", token);

    res.json({
      code: 200,
      message: 'Register successfully',
      token: token
    })
  }
}

// [POST] api/users/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ 
    email: email,
    deleted: false, 
  });

  if(!user) {
    return res.json({
      code: 400,
      message: 'Invalid email'
    });
  }

  if(md5(password) !== user.password) {
    return res.json({
      code: 400,
      message: 'Invalid password'
    });
  }

  const token = user.token;
  res.cookie("token", token);

  res.json({
    code: 200,
    message: 'Login successfully',
    token: token
  })
}

// [POST] api/users/password/forgotPassword
module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({ 
    email: email,
    deleted: false
   });

  if(!user) {
    return res.json({
      code: 400,
      message: 'Email not found'
    });
  }

  const otp = generateHelper.generateRandomNumber(8);
  const timeExpire = 5;

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: new Date(Date.now() + timeExpire * 60 * 1000)
  }
  
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  // Send OTP to user
  const subject = 'OTP verification reset password';
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>OTP Verification Code</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 500px;
              margin: 20px auto;
              background: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          }
          .otp {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              background: #f8f8f8;
              padding: 10px;
              border-radius: 5px;
              display: inline-block;
          }
          .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #777;
              text-align: center;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h2>Verify Your Account</h2>
          <p>Hello,</p>
          <p>Your OTP code for account verification is:</p>
          <p class="otp">${otp}</p>
          <p>This code will expire in ${timeExpire} minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <div class="footer">
              <p>Thank you for using our service!</p>
          </div>
      </div>
  </body>
  </html>
`;

  sendMailHelper.sendMail(email, subject, html);

  res.json({
    code: 200,
    message: 'OTP sent via email successfully'
  })
}


// [POST] api/users/password/forgotPassword
module.exports.otpPassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if(!result) {
    return res.json({
      code: 400,
      message: 'Invalid OTP or expired'
    });
  }

  const user = await User.findOne({
    email: email,
    deleted: false
  });

  const token = user.token;
  res.cookie("token", token);

  res.json({
    code: 200,
    message: 'Verify successfully',
    token: token
  })
}

// [POST] api/users/password/forgotPassword
module.exports.resetPassword = async (req, res) => {
  const token = req.cookies.token;
  const password = req.body.password;

  const user = await User.findOne({
    token: token
  });

  if(md5(password) === user.password) {
    return res.json({
      code: 400,
      message: 'Password cannot be the same as current password'
    });
  }
   
  await User.updateOne({
    token: token
  }, {
    password: md5(password)
  });

  res.json({
    code: 200,
    message: 'Reset password successfully',
    token: token
  })
}

// [GET] api/users/detail
module.exports.detail = async (req, res) => {
  try {
    const token = req.cookies.token;
    const user = await User.findOne({ 
      token: token,
      deleted: false 
    }).select('-password -token');

    res.json({
      code: 200,
      message: 'Detail user successfully',
      info: user
    });

  } catch (err) { 
    res.json({
      code: 400,
      message: err
    });
  }
}