
const path = require("path");
const fs = require("fs");

const seleniumModule = require.resolve("selenium-server-standalone-jar");
const seleniumJarPath = path.join(path.dirname(seleniumModule), 'jar');
const seleniumJarDir = fs.readdirSync(seleniumJarPath);

if(seleniumJarDir.length !== 1){
    throw(`${seleniumJarDir.length >1 ? 'Multiple Files' : 'No Selenium JAR found'} at ${seleniumModule}`);
}

const seleniumJar = path.join(seleniumJarPath + seleniumJarDir[0]);

const chromeDriverMain = require.resolve("chromedriver");
const chromeDriverBinary = path.join(path.dirname(chromeDriverMain), "chromedriver", "chromedriver" + (process.platform.startsWith("win") ? ".exe" : ""));

process.env.CHROME_BIN = process.env.CHROME_BIN || require('puppeteer').executablePath();

exports.config = {
    framework: 'jasmine',
    specs: ['./dist/*.spec.js'],
    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            binary: process.env.CHROME_BIN
        }
    },
    directConnect: true,
    SELENIUM_PROMISE_MANAGER: false,
    seleniumServerJar: seleniumJar,
    chromeDriver: chromeDriverBinary
}