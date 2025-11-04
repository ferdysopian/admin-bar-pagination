const fs = require('fs-extra');
const path = require('path');

const config = {
    sourceDir: path.resolve(__dirname, '..'),
    buildDir: path.resolve(__dirname, '../build'),
    outputDir: path.resolve(__dirname, '../build/admin-bar-pagination')
};

async function buildPlugin() {
    console.log('Building plugin...');
    
    try {
        // Ensure output directory exists
        await fs.ensureDir(config.outputDir);
        
        // Copy main plugin files
        const mainFiles = [
            'admin-bar-pagination.php',
            'uninstall.php',
            'readme.txt',
            'languages/',
            'inc/'
        ];
        
        for (const file of mainFiles) {
            const sourcePath = path.join(config.sourceDir, file);
            const destPath = path.join(config.outputDir, file);
            
            if (await fs.pathExists(sourcePath)) {
                await fs.copy(sourcePath, destPath);
                console.log(`Copied: ${file}`);
            }
        }
        
        // Copy assets directory (source files)
        const assetsSourcePath = path.join(config.sourceDir, 'assets');
        const assetsDestPath = path.join(config.outputDir, 'assets');
        
        if (await fs.pathExists(assetsSourcePath)) {
            await fs.copy(assetsSourcePath, assetsDestPath);
            console.log('Copied: assets/ (source files)');
        }
        
        // Minified files are generated directly to the output directory
        console.log('Minified files will be generated directly to build directory');
        
        // Clean up any .DS_Store files that might have been copied
        const { execSync } = require('child_process');
        try {
            execSync(`find "${config.outputDir}" -name ".DS_Store" -type f -delete`, { stdio: 'ignore' });
            console.log('Cleaned .DS_Store files from build directory');
        } catch (error) {
            // Ignore errors if find command fails
        }
        
        console.log('Plugin built successfully!');
        
    } catch (error) {
        console.error('Error building plugin:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    buildPlugin();
}

module.exports = { buildPlugin, config };