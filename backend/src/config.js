exports.NODE_ENV    = process.env.NODE_ENV || 'development';
exports.PORT        = process.env.PORT || 3000;
exports.IP          = process.env.IP || "127.0.0.0";
exports.MONGO_URL   = process.env.MONGO_URL;
exports.CLOUDAMQP_URL   = process.env.MQ_URL;
exports.QUEUE_PESSOA_UPDATE = process.env.QUEUE_PESSOA_UPDATE;
exports.MAILGUN_API = process.env.MAILGUN_API;