const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const config = {
    pluginName: 'Admin Bar Pagination',
    version: '1.0.0',
    textDomain: 'admin-bar-pagination',
    outputFile: path.resolve(__dirname, '../languages/admin-bar-pagination.pot'),
    pluginFile: path.resolve(__dirname, '../admin-bar-pagination.php')
};

async function generatePOT() {
    console.log('Generating POT file...');

    try {
        // Check if wp-cli is available
        try {
            execSync('wp --version', { stdio: 'ignore' });
            console.log('Using WP-CLI for POT generation...');

            // Use wp-cli to generate POT, excluding build directories
            const wpCommand = `wp i18n make-pot . ${config.outputFile} --slug=${config.textDomain} --domain=${config.textDomain} --exclude="svn-structure,dist,build,node_modules,.git" --headers='{"Report-Msgid-Bugs-To":"https://wordpress.org/support/plugin/${config.textDomain}"}'`;
            execSync(wpCommand, { stdio: 'inherit' });

        } catch (wpError) {
            console.error('WP-CLI not available. Please install WP-CLI to generate POT files.');
            process.exit(1);
        }

        console.log('POT file generated successfully!');

    } catch (error) {
        console.error('Error generating POT file:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    generatePOT();
}

module.exports = { generatePOT, config };
