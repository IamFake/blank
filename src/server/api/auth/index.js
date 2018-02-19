import * as Models from '../../models'
import Sec from '../../utils/sanitize'
import pwd from '../../utils/bcrypt'

async function signIn(params, req) {
	if (req.session.auth) {
		return {
			auth: 1
		}
	} else {
		const ident = Sec.toEmail(req.body.ident);
		if (ident === false) {
			return {
				auth: -3
			}
		}

		const user = await Models.User.findOne({
			where: {
				email: ident
			},
			attributes: ['id', 'pwd', 'acc', 'access', 'active', 'udata']
		});
		if (user && user.id && user.active) {
			// const passwd = await pwd.hash(req.body.pwd || 'empty_password_adawdaw2h3rh239rh2oi3hr2');
			const passwd = req.body.pwd;
			const auth = await pwd.compare(passwd, user.pwd);
			if (auth) {
				Object.assign(req.session, {
					auth: true,
					uid: user.id,
					uaccount: user.acc,
					uaccess: user.access,
					udata: user.udata
				});

				return {
					auth: 1
				}
			} else {
				return {
					auth: -1
				}
			}
		} else {
			return {
				auth: -2
			}
		}
	}
}

async function signUp(params, req) {
	if (req.session.auth) {
		return {
			auth: 1,
			ayo: 'zzz'
		}
	} else {
		const ident = Sec.toEmail(req.body.ident);
		if (ident === false) {
			return {
				auth: -3
			}
		}

		const name = Sec.toAlnum(req.body.name);
		const passwd = await pwd.hash(req.body.pwd || 'empty_password_adawdaw2h3rh239rh2oi3hr2');

		const user = await Models.User.findOne({
			where: {
				email: ident
			},
			attributes: ['id']
		});
		if (!user) {
			const newUser = await Models.User.create({
				email: ident,
				pwd: passwd,
				acc: 1,
				udata: {
					fn: name
				}
			}, {
				returning: true
			});

			if (newUser && newUser.id > 0) {
				Object.assign(req.session, {
					auth: true,
					uid: newUser.id,
					uaccount: newUser.acc,
					uaccess: newUser.access,
					udata: newUser.udata
				});

				return {
					auth: 1
				}
			} else {
				return {
					auth: -4
				}
			}
		} else {
			return {
				auth: -5
			}
		}
	}
}

function quit(params, req) {
	req.session.destroy();

	return {
		ok: 1
	}
}

export function run(params, req) {
	const type = params && params['stack'] && params['stack'][0] || '';

	if (type === 'signup') {
		return signUp(params, req).catch((err) => {
			console.warn(err)
		})
	} else if (type === 'quit') {
		return quit(params, req)
	} else {
		return signIn(params, req).catch((err) => {
			console.warn(err)
		})
	}
}