import validator from 'validator'
// based on npm/validator
'use strict';

const alpha = {
	'en-US': 'A-Z',
	'cs-CZ': 'A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ',
	'da-DK': 'A-ZÆØÅ',
	'de-DE': 'A-ZÄÖÜß',
	'es-ES': 'A-ZÁÉÍÑÓÚÜ',
	'fr-FR': 'A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ',
	'it-IT': 'A-ZÀÉÈÌÎÓÒÙ',
	'nb-NO': 'A-ZÆØÅ',
	'nl-NL': 'A-ZÁÉËÏÓÖÜÚ',
	'nn-NO': 'A-ZÆØÅ',
	'hu-HU': 'A-ZÁÉÍÓÖŐÚÜŰ',
	'pl-PL': 'A-ZĄĆĘŚŁŃÓŻŹ',
	'pt-PT': 'A-ZÃÁÀÂÇÉÊÍÕÓÔÚÜ',
	'ru-RU': 'А-ЯЁ',
	'sr-RS@latin': 'A-ZČĆŽŠĐ',
	'sr-RS': 'А-ЯЂЈЉЊЋЏ',
	'sv-SE': 'A-ZÅÄÖ',
	'tr-TR': 'A-ZÇĞİıÖŞÜ',
	'uk-UA': 'А-ЩЬЮЯЄIЇҐі',
	ar: 'ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ'
};

const alphanumeric = {
	'en-US': '0-9A-Z',
	'cs-CZ': '0-9A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ',
	'da-DK': '0-9A-ZÆØÅ',
	'de-DE': '0-9A-ZÄÖÜß',
	'es-ES': '0-9A-ZÁÉÍÑÓÚÜ',
	'fr-FR': '0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ',
	'it-IT': '0-9A-ZÀÉÈÌÎÓÒÙ',
	'hu-HU': '0-9A-ZÁÉÍÓÖŐÚÜŰ',
	'nb-NO': '0-9A-ZÆØÅ',
	'nl-NL': '0-9A-ZÁÉËÏÓÖÜÚ',
	'nn-NO': '0-9A-ZÆØÅ',
	'pl-PL': '0-9A-ZĄĆĘŚŁŃÓŻŹ',
	'pt-PT': '0-9A-ZÃÁÀÂÇÉÊÍÕÓÔÚÜ',
	'ru-RU': '0-9А-ЯЁ',
	'sr-RS@latin': '0-9A-ZČĆŽŠĐ',
	'sr-RS': '0-9А-ЯЂЈЉЊЋЏ',
	'sv-SE': '0-9A-ZÅÄÖ',
	'tr-TR': '0-9A-ZÇĞİıÖŞÜ',
	'uk-UA': '0-9А-ЩЬЮЯЄIЇҐі',
	ar: '٠١٢٣٤٥٦٧٨٩0-9ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ'
};

const decimal = {
	'en-US': '.',
	ar: '٫'
};

const englishLocales = ['AU', 'GB', 'HK', 'IN', 'NZ', 'ZA', 'ZM'];

for (let locale, i = 0; i < englishLocales.length; i++) {
	locale = 'en-' + englishLocales[i];
	alpha[locale] = alpha['en-US'];
	alphanumeric[locale] = alphanumeric['en-US'];
	decimal[locale] = decimal['en-US'];
}

// Source: http://www.localeplanet.com/java/
const arabicLocales = ['AE', 'BH', 'DZ', 'EG', 'IQ', 'JO', 'KW', 'LB', 'LY', 'MA', 'QM', 'QA', 'SA', 'SD', 'SY', 'TN', 'YE'];

for (let _locale, _i = 0; _i < arabicLocales.length; _i++) {
	_locale = 'ar-' + arabicLocales[_i];
	alpha[_locale] = alpha.ar;
	alphanumeric[_locale] = alphanumeric.ar;
	decimal[_locale] = decimal.ar;
}

// Source: https://en.wikipedia.org/wiki/Decimal_mark
const dotDecimal = [];
const commaDecimal = ['cs-CZ', 'da-DK', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'hu-HU', 'nb-NO', 'nn-NO', 'nl-NL', 'pl-Pl', 'pt-PT', 'ru-RU', 'sr-RS@latin', 'sr-RS', 'sv-SE', 'tr-TR', 'uk-UA'];

for (let _i2 = 0; _i2 < dotDecimal.length; _i2++) {
	decimal[dotDecimal[_i2]] = decimal['en-US'];
}

for (let _i3 = 0; _i3 < commaDecimal.length; _i3++) {
	decimal[commaDecimal[_i3]] = ',';
}

alpha['pt-BR'] = alpha['pt-PT'];
alphanumeric['pt-BR'] = alphanumeric['pt-PT'];
decimal['pt-BR'] = decimal['pt-PT'];

const defautLocale = 'en-US';
let currentLocale = defautLocale;

validator.setLocale = function (locale) {
	if (!locale) locale = defautLocale;
	currentLocale = locale;
};

export const STRCL_NL = 1;
export const STRCL_DOT = 2;
export const STRCL_PUNC = 4;
export const STRCL_QOUT = 8;
export const STRCL_SPACE = 16;
export const STRCL_STRICT_ALNUM = 32;
export const STRCL_NLBR = 64;
export const STRCL_SLASH = 128;
export const STRCL_ANCHOR_B64 = 256;
export const STRCL_FOCUS_TAGS = 512;
export const STRCL_DECODE_URL = 1024;

validator.flags = {
	STRCL_NL,
	STRCL_DOT,
	STRCL_PUNC,
	STRCL_QOUT,
	STRCL_SPACE,
	STRCL_STRICT_ALNUM,
	STRCL_NLBR,
	STRCL_SLASH,
	STRCL_ANCHOR_B64,
	STRCL_FOCUS_TAGS,
	STRCL_DECODE_URL
};
validator.toAlpha = function (str) {
	if (!alpha[currentLocale]) return '';

	const re = new RegExp('[^' + alpha[currentLocale] + ']', 'ig');

	return str.replace(re, '')
};
validator.toAlnum = function (str, opts) {
	if (!alphanumeric[currentLocale]) return '';
	opts = parseInt(opts, 10);
	if (isNaN(opts)) opts = 0;

	let symbols = alphanumeric[currentLocale];
	if(opts ^ STRCL_STRICT_ALNUM) symbols += '-_';
	if(opts & STRCL_DOT) symbols += '\\.';
	if(opts & STRCL_SLASH) symbols += '/';

	const re = new RegExp('[^' + symbols + ']', 'ig');

	return str.replace(re, '')
};
validator.reduceSpaces = function (str) {
	const re = new RegExp('\s{2,}', 'g');
	return str.replace(re, ' ')
};
validator.toClear = function (str, opts, maxLen) {
	if (!alphanumeric[currentLocale]) return '';
	opts = parseInt(opts, 10);
	if (isNaN(opts)) opts = 0;

	let symbols = alphanumeric[currentLocale] + "-_\\s";
	if (opts & STRCL_PUNC) symbols += ',\\.;:/\\!\\?№\\(\\)\\+\\*\\@%$=&|<>';
	if (opts & STRCL_SLASH) symbols += '/';
	if (opts & STRCL_QOUT) symbols += '"\\\'';
	if (opts & STRCL_DOT) symbols += '\\.';
	if (opts & STRCL_NL || opts & STRCL_NLBR) symbols += "\\n";
	if (opts & STRCL_SPACE) str = validator.reduceSpaces(str);

	const re = new RegExp('[^' + symbols + ']', 'ig');
	console.log("-- -- -- Sanitize regexp", symbols);
	let result = str.replace(re, '');

	if (opts & STRCL_QOUT) result = result.replace(/["]/g, '&quot;');
	if (opts & STRCL_QOUT) result = result.replace(/[']/g, '&#039;');

	if (opts & STRCL_PUNC) result = result.replace(/[<]/g, '&lt;');
	if (opts & STRCL_PUNC) result = result.replace(/[>]/g, '&gt;');

	if (opts & STRCL_NLBR) result = result.replace(/[\\n]/g, '<br/>');

	result = result.trim();

	if (maxLen > 0) {
		result = result.substr(0, maxLen);
	}

	return result
};
validator.toDigits = function (str, opts) {
	opts = parseInt(opts, 10);
	if (isNaN(opts)) opts = 0;

	let symbols = '0-9';
	if(opts & STRCL_DOT) symbols += '\\.,';
	if(opts & STRCL_PUNC) symbols += '-_\\s';

	const re = new RegExp('[^' + symbols + ']', 'ig');

	return str.replace(re, '')
};
validator.toEmail = function (str) {
	if (validator.isEmail(str + '')) {
		return validator.normalizeEmail(str + '')
	}

	return false;
};

export default validator