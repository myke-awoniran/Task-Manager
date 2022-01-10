const Mongoose = require("mongoose");
const dotenv = require("dotenv").config({ path: "config.env" });
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DB_PASSWORD);

const dbConnect = async (dataBase) => {
	await Mongoose.connect(dataBase, {
		useNewUrlParser: true,
	});
	console.log("Database connected successfully");
};
dbConnect(DB);
const Task = Mongoose.model("Task", taskSchema);
module.exports = Task;
const importData = () => {
    const await
}
