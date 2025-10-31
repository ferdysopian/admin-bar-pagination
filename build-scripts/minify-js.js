const fs = require('fs-extra');
const path = require('path');
const UglifyJS = require('uglify-js');

const config = {
    sourceFile: path.resolve(__dirname, '../assets/js/admin-bar-pagination.js'),
    outputFile: path.resolve(__dirname, '../assets/js/admin-bar-pagination.min.js')
};

async function minifyJS() {
    console.log('Minifying JavaScript...');
    try {
        if (!await fs.pathExists(config.sourceFile)) {
            console.error(`Source JS file not found: ${config.sourceFile}`);
            process.exit(1);
        }
        
        // Ensure output directory exists
        await fs.ensureDir(path.dirname(config.outputFile));
        
        const sourceJs = await fs.readFile(config.sourceFile, 'utf8');
        const result = UglifyJS.minify(sourceJs, {
            compress: {
                drop_console: true // Remove console.log statements
            },
            mangle: true // Mangle variable names
        });

        if (result.error) {
            console.error('Error minifying JavaScript:', result.error);
            process.exit(1);
        }
        await fs.writeFile(config.outputFile, result.code);
        console.log('JavaScript minified successfully!');
        console.log(`Source: ${(sourceJs.length / 1024).toFixed(2)} KB`);
        console.log(`Minified: ${(result.code.length / 1024).toFixed(2)} KB`);
        console.log(`Savings: ${(((sourceJs.length - result.code.length) / sourceJs.length) * 100).toFixed(1)}%`);
    } catch (error) {
        console.error('Error minifying JavaScript:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    minifyJS();
}

module.exports = { minifyJS, config };