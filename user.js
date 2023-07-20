const { Router } = require('express');
const createConnection = require('../db');
const cors = require('cors');
const router = Router();
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const auth = require('../Middlewares/auth');

router.use(cors());

router.get('/getUsers', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.query(`SELECT * FROM register`);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/getCurrUser', auth, (req, res) => {
  res.status(200).send(req.user);
});

router.post('/getUserByAuth', async (req, res) => {
  try {
    const data = req.body;
    const connection = await createConnection();
    const [rows] = await connection.query(`SELECT * FROM register WHERE email='${data.email}' AND password='${data.password}'`);
    if (rows.length) {
      const token = jwt.sign(
        {
          name: rows[0].name,
          username: rows[0].username,
          email: rows[0].email,
          designation: rows[0].designation,
          profile_image: rows[0].profile_image,
          phone_no: rows[0].phone_no
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10d' }
      );
      res.status(200).send({ designation: rows[0].designation, token: token });
    } else {
      res.status(200).send({ token: null, designation: null });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/addUser', async (req, res) => {
  try {
    const data = req.body;
    const connection = await createConnection();
    const login_id = crypto.randomUUID();
    await connection.query(
      `INSERT into register(idregister,name,emp_id,password,email,phone_no) values('${login_id}','${data.name}','${data.username}','${data.password}','${data.email}','${data.phone_no}')`
    );
    res.status(200).send('User added successfully');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
