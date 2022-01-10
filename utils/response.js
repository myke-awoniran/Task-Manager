exports.response = (statCode, data, res, token) => {
	res.status(statCode).json({
		status: "success",
		result: data.length,
		token,
		data,
	});
};
