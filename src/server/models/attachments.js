import {DataTypes} from 'sequelize'
import db from '../../server/utils/database'

const Attachments = db.define('attachments', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	date: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	uname: {
		type: DataTypes.STRING(255),
		allowNull: false
	},
	active: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	extension: {
		type: DataTypes.STRING(10),
		allowNull: false
	},
	hash: {
		type: DataTypes.STRING(128),
		allowNull: false
	},
	generaltype: {
		type: DataTypes.STRING(25),
		allowNull: false
	},
	store: {
		type: DataTypes.JSONB,
		allowNull: false
	},
	owner: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	}
}, {
	indexes: [
		{fields: ['hash', 'active']}
	]
});

Attachments.sync({force: false});

export {Attachments}