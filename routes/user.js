const router = require('express').Router();
const auth = require('../middlewares/auth');

const { getUserMe } = require('../controllers/user');

router.get('/me', auth, getUserMe);

module.exports = router;
