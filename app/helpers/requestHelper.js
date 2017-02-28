const requestHelper = {
	sendAnswer(res, body, statusCode) {
		res.status(statusCode);
		res.send(body);
	}
};

module.exports = requestHelper;