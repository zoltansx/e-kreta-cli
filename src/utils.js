const { Base64 } = require('js-base64');
const { bold, red } = require('chalk');
const configstore = require('configstore');
const request = require('request-promise-native');

exports.pkg = require('../package.json');
exports.conf = new configstore(exports.pkg.name);

exports.getInstitutes = async () => {
  const response = await request.get('https://kretaglobalmobileapi.ekreta.hu/api/v1/Institute', {
    headers: { apiKey: '7856d350-1fda-45f5-822d-e1a2f3f1acf0' },
  });
  return JSON.parse(response);
};

async function loginUtil(institute, username, password) {
  try {
    const response = await request.post(`https://${institute}.e-kreta.hu/idp/api/v1/Token`, {
      body: `institute_code=${institute}&userName=${username}&password=${password}&grant_type=password&client_id=919e0c1c-76a2-4646-a2fb-7085bbbf3c56`,
    });
    return JSON.parse(response);
  } catch (e) {
    return e.statusCode || -1;
  }
}

exports.login = async () => {
  if (
    (exports.conf.get('institute') || '') == '' ||
    (exports.conf.get('username') || '') == '' ||
    (exports.conf.get('password') || '') == ''
  ) {
    console.error(`${red('Required settings are missing.')} ${bold('Please run reconfigure.')}`);
    return false;
  }

  const response = await loginUtil(
    exports.conf.get('institute'),
    Base64.decode(exports.conf.get('username')),
    Base64.decode(exports.conf.get('password')),
  );

  if (response == -1) {
    console.error(
      `${red('Invalid institute in configuration.')} ${bold('Please run reconfigure.')}`,
    );
    return false;
  }

  if (!response['access_token']) {
    console.error(
      `${red('Invalid username or password in configuration.')} ${bold('Please run reconfigure.')}`,
    );
    return false;
  }

  return response;
};

exports.replaceIllegalChars = path => {
  return path.replace(/[/\\?%*:|"<>]/g, '-');
};

exports.toDateString = date => {
  return (
    date.getFullYear() +
    '. ' +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    '. ' +
    ('0' + date.getDate()).slice(-2) +
    '. ' +
    ('0' + date.getHours()).slice(-2) +
    ':' +
    ('0' + date.getMinutes()).slice(-2) +
    ':' +
    ('0' + date.getSeconds()).slice(-2)
  );
};

exports.toDateFileName = date => {
  return (
    date.getFullYear() +
    '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + date.getDate()).slice(-2)
  );
};
