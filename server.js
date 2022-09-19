// ======== set up
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const router = express.Router();
const cors = require("cors");

// ======== set up local
const User = require("./app/models/user");
const SECRET_KEY = process.env.SECRET_KEY;
const MONGO_URI = process.env.MONGO_URI;
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(MONGO_URI);

app.use(cors());

// ======== Router Api
router.post("/login", (req, res) => {
	User.findOne({ email: req.body.email }, (err, user) => {
		if (err) res.json({ status: "fail", message: err.message });

		if (!user) {
			res.json({ status: "fail", message: "User not found" });
		} else {
			// password harusnya di hash
			if (user.password !== req.body.password) {
				res.json({ status: "fail", message: "Wrong password!" });
			} else {
				// membuat token
				const token = jwt.sign({ ...user }, SECRET_KEY, {
					expiresIn: "24h",
				});

				// send response
				res.json({
					status: "success",
					message: "token has been created",
					token,
				});
			}
		}
	});
});

router.get("/", (req, res) => {
	res.send("ini route home!");
});

router.get("/users", (req, res) => {
	User.find({}, (err, result) => {
		res.json(result);
	});
});

// ======== prefix route
app.use("/api", router);

app.listen(port, () => {
	console.log("server running at http://localhost:3000");
});
