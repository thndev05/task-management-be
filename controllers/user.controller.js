const md5 = require('md5');
const User = require('../models/user.model');

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
