
const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');
const autoIncrement = require('mongoose-plugin-autoinc');

const mysql = require('mysql');

fs.readdirSync('./api/controllers/').forEach(function(file) {
    if ((file.indexOf(".js") > 0 && (file.indexOf(".js") + 3 == file.length))) {
        filePath = path.resolve('./api/controllers/' + file);

        clsName = file.replace('.js','').toUpperCase();
        global[clsName] = require(filePath);//(server, restify);
        CLSINDEX.CONTROLLERS.push(clsName);
    }
});



fs.readdirSync('./api/routes/').forEach(function(file) {
    if ((file.indexOf(".js") > 0 && (file.indexOf(".js") + 3 == file.length))) {
        filePath = path.resolve('./api/routes/' + file);
        require(filePath)(server, restify);
    }
    //   console.log("Loading routes : " + filePath);
});






/**
 * Start Server, Checks for availale PORTs
 * Then Connect to Mongo, MySQL, Redis, RabbitMQ
 */
server.listen(config.port, () => {

    //Setup MySQL
    if(config.dbmysql.enable) {
        server.mysql = mysql.createConnection(config.dbmysql);
        server.mysql.connect();
        console.log("MYSQL Initialized");
    }

    server.initValidator();

    //Setup Mongoose->MongoDB
    if(config.dbmongo.enable) {
        mongoose.Promise = global.Promise;
        mongoose.connect(config.dbmongo.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            autoIndex: false
        });

        server.mongodb = mongoose.connection;

        server.mongodb.on('error', (err) => {
            console.error(err);
            process.exit(1);
        });

        server.mongodb.once('open', () => {

            server.loadMongoModels();
            console.log("MONGODB Initialized");

            console.log("\x1b[31m%s\x1b[0m","API Engine Initialization Completed");
            console.log(`\nServer Started @ `+moment().format()+` and can be accessed on ${config.host}:${config.port}/`);

            if(CONFIG.remoteDebug===true) {
                startRemoteDebugger();
            }
        });
    } else {
        console.log("\x1b[31m%s\x1b[0m","API Engine Initialization Completed");
        console.log(`\nServer Started @ `+moment().format()+` and can be accessed on ${config.host}:${config.port}/`);

        if(CONFIG.remoteDebug===true) {
            startRemoteDebugger();
        }
    }
    
    //console.log(`${server.config.name} is listening on port http://${config.host}:${config.port}/`);
});