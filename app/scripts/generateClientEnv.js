/**
 * @file generateClientEnv.js
 * 
 * This script reads the environment variables and adds any variables matching `REACT_APP_` to the global window object.
 */

require('dotenv').config()
const fs = require('fs');
const pathToWrite='./build/public';
const fileToWrite = `${pathToWrite}/client-env.js`;
const globalVarName = '_env_';

const raw = Object.keys(process.env)
  .filter((key) => /^REACT_APP_/i.test(key))
  .reduce(
    (env, key) => {
      env[key] = process.env[key];
      return env;
    }, 
    {}
  );

const content = `Object.defineProperty(window, '${globalVarName}', {value: ${JSON.stringify(raw)}, writable: false});`;

try {
  fs.writeFileSync(fileToWrite, content, 'utf8');
} catch (err) {
  console.log('Error while writing client-env file:', err.message);
  process.exit(1);
}
