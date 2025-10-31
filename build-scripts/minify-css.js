const fs = require('fs-extra');
const path = require('path');
const CleanCSS = require('clean-css');

const config = {
    sourceFile: path.resolve(__dirname, '../assets/css/admin-bar-pagination.css'),
    outputFile: path.resolve(__dirname, '../assets/css/admin-bar-pagination.min.css')
};

async function minifyCSS() {
    console.log('Minifying CSS...');
    try {
        if (!await fs.pathExists(config.sourceFile)) {
            console.error(`Source CSS file not found: ${config.sourceFile}`);
            process.exit(1);
        }
        
        // Ensure output directory exists
        await fs.ensureDir(path.dirname(config.outputFile));
        
        const sourceCss = await fs.readFile(config.sourceFile, 'utf8');
        const output = new CleanCSS({ level: 2 }).minify(sourceCss);
        await fs.writeFile(config.outputFile, output.styles);
        console.log('CSS minified successfully!');
        console.log(`Source: ${(sourceCss.length / 1024).toFixed(2)} KB`);
        console.log(`Minified: ${(output.styles.length / 1024).toFixed(2)} KB`);
        console.log(`Savings: ${(((sourceCss.length - output.styles.length) / sourceCss.length) * 100).toFixed(1)}%`);
    } catch (error) {
        console.error('Error minifying CSS:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    minifyCSS();
}

module.exports = { minifyCSS, config };