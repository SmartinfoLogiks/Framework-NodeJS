//ENV Configuration

module.exports = function(server, restify) {

	global.clearEnvConfig = function() {
		global._ENV = {};
	},

	global.getEnvConfig = function(configKey, defaultValue) {
		if(configKey==null) return null;
		configKey = configKey.toLowerCase();
		
		if(_ENV[configKey] != null) return _ENV[configKey];
		else return defaultValue;
	},

	global.setEnvConfig = function(configKey, value) {
		_ENV[configKey] = value;
		
		return value;
	}
}