const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User.js');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const ipAddress = req.ip;

    try {
      // See if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get user gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
        ipAddress
      });

      // Encrypt password

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        // (err, token) => {
        //   if (err) throw err;
        //   res.json({ token });
        // }
        (err, n3a65f78f4c6436bb668da21e05543a7) => {
          if (err) throw err;
          res.cookie("n3a65f78f4c6436bb668da21e05543a7", n3a65f78f4c6436bb668da21e05543a7, { maxAge: 360000, secure: true, sameSite: 'strict' }); // set token as cookie with expiration time
          res.json({ n3a65f78f4c6436bb668da21e05543a7 });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
