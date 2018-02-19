import {DataTypes} from 'sequelize'
import db from '../../server/utils/database'

const User = db.define('users', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	email: {
		type: DataTypes.STRING(255),
		allowNull: false
	},
	pwd: {
		type: DataTypes.STRING(80),
		allowNull: false
	},
	regdate: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW
	},
	acc: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	},
	access: {
		type: DataTypes.ARRAY(DataTypes.STRING(30))
	},
	active: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	udata: {
		type: DataTypes.JSONB
	}
});

User.sync({force: false});

export {User}