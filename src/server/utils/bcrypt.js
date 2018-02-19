import bcrypt from 'bcrypt'

const ROUNDS = 12;

export async function hash(pwd) {
	if (pwd === '') return false;

	const salt = await bcrypt.genSalt(ROUNDS).catch((err) => console.error('bcrypt utils salt', err));
	return await bcrypt.hash(pwd, salt).catch((err) => console.error('bcrypt utils hash', err))
}

export async function compare(pwd, hash) {
	if (pwd === '' || hash === '') return false;

	return await bcrypt.compare(pwd, hash).catch((err) => console.error('bcrypt utils compare', err))
}

export default {
	hash,
	compare
}