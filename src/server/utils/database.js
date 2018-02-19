import Seq from 'sequelize'
import config from '../config'

const Database = new Proxy({
	___instance: null,
	init() {
		this.___instance = new Seq(
			config.db.database,
			config.db.user,
			config.db.paswd,
			{
				host: config.db.host,
				port: config.db.port,
				dialect: 'postgres',
				pool: {
					min: 0,
					max: 4,
					idle: 10000
				},
				define: {
					timestamps: true,
					paranoid: false,
					underscored: true,
					freezeTableName: true
				}
			}
		);
	},

	async check() {
		try {
			await this.___instance.authenticate();
			return true;
		} catch (e) {
			console.info('database check fail', e);
			return false;
		}
	}
}, {
	get: function (target, name) {
		if (target.hasOwnProperty(name)) {
			return target[name];
		} else {
			if (!target['___instance']) {
				target.init();
			}
			return target['___instance'][name];
		}
	}
});

export default Database