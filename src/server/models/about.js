import {DataTypes} from 'sequelize'
import db from '../../server/utils/database'

const About = db.define('about', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	hash: {
		type: DataTypes.STRING(128),
		allowNull: false
	},
	title: {
		type: DataTypes.STRING(255),
		allowNull: false
	},
	date: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	desc: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	text: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	draft: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	active: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	parent: {
		type: 'int2',
		defaultValue: 0
	},
	path: {
		type: DataTypes.STRING(255),
		defaultValue: true
	}
});

About.sync({force: false});

export {About}