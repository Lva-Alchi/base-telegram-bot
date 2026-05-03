const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');

//Define 'log file' location
const errorDir = path.join(__dirname, '../../logs');

// Make sure folder is available
if (!fs.existsSync(errorDir)) {
    fs.mkdirSync(errorDir, { recursive: true });
}

/**
 * Helper to get 'error date' for log filename
 * e.g : 2024-05-20_14-30-05
 */
const getFileTimestamp = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-mm-ss
    return `${date}_${time}`;
};

/**
 * LOGGER 1: For System Error (Startup / npm run / Crash Node.js)
 */
const logSystemError = (error) => {
    const fileName = `systemError_${getFileTimestamp()}.txt`;
    const filePath = path.join(errorDir, fileName);

    const content = `
========================================
🚨 SYSTEM FATAL ERROR (STARTUP/RUNTIME)
========================================
DATE/TIME : ${new Date().toLocaleString('id-ID')}
----------------------------------------
ERROR   : ${error.name || 'Error'}
MESSAGE : ${error.message || 'No message'}
----------------------------------------
STACK TRACE :
${error.stack || 'No stack trace available'}
========================================
`;

    fs.writeFileSync(filePath, content, 'utf8');
    console.error(`[LOGGER] 🚨 System Crash log saved : ${fileName}`);
};

/**
 * LOGGER 2: For User Error (Interaction / Command Error)
 */
const logUserError = (error, ctx) => {
    const fileName = `userError_${getFileTimestamp()}.txt`;
    const filePath = path.join(errorDir, fileName);

    const userId = ctx?.from?.id || 'Unknown';
    const username = ctx?.from?.username || 'Unknown';
    const input = ctx?.message?.text || ctx?.callbackQuery?.data || 'Unknown Input';

    const content = `
========================================
❌ USER INTERACTION ERROR REPORT
========================================
Date/Time : ${new Date().toLocaleString('id-ID')}
User ID       : ${userId}
Username      : @${username}
Input User    : ${input}
----------------------------------------
ERROR   : ${error.name || 'Error'}
MESSAGE : ${error.message || 'No message'}
----------------------------------------
STACK TRACE :
${error.stack || 'No stack trace available'}
========================================
`;

    fs.writeFileSync(filePath, content, 'utf8');
    console.error(`[LOGGER] ❌ User Error log saved: ${fileName}`);
};

module.exports = { logSystemError, logUserError };