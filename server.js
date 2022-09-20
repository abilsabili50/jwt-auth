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

				// res.header("x-access-token", token).json({
				// 	status: "success",
				// 	message: "token has been created",
				// });
			}
		}
	});
});

router.get("/", (req, res) => {
	res.send("ini route home!");
});

// ======== Proteksi route dengan token ~ posisi route penting
router.use((req, res, next) => {
	// mengambil token dari header
	const token = req.headers["x-access-token"];

	if (!token)
		return res.status(403).send({ status: "fail", message: "Forbidden" });

	// verifikasi token
	jwt.verify(token, SECRET_KEY, (err, decoded) => {
		if (err)
			return res.status(401).send({ status: "fail", message: "unauthorized" });

		req.decoded = decoded;

		if (decoded.exp <= Date.now() / 1000) {
			return res.status(400).send({
				status: "fail",
				message: "token has expired",
				date: Date.now() / 1000,
				exp: decoded.exp,
			});
		}

		next();
	});
});

router.get("/users", (req, res) => {
	User.find({}, (err, result) => {
		res.json(result);
	});
});

router.get("/profile", (req, res) => {
	res.json(req.decoded._doc);
});

// ======== prefix route
app.use("/api", router);

app.listen(port, () => {
	console.log("server running at http://localhost:3000");
});
