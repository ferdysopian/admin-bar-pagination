const fs = require('fs-extra');
const path = require('path');

const config = {
    sourceDir: path.resolve(__dirname, '..'),
    buildDir: path.resolve(__dirname, '../build'),
    svnTrunkDir: path.resolve(__dirname, '../svn-structure/trunk')
};

async function copyToSVN() {
    console.log('Copying files to SVN structure...');
    
    try {
        // Ensure SVN trunk directory exists
        await fs.ensureDir(config.svnTrunkDir);
        
        // Copy main plugin files
        const mainFiles = [
            'admin-bar-pagination.php',
            'uninstall.php',
            'readme.txt',
            'languages/'
        ];
        
        for (const file of mainFiles) {
            const sourcePath = path.join(config.sourceDir, file);
            const destPath = path.join(config.svnTrunkDir, file);
            
            if (await fs.pathExists(sourcePath)) {
                await fs.copy(sourcePath, destPath);
                console.log(`Copied to SVN: ${file}`);
            }
        }
        
        // Copy assets directory
        const assetsSourcePath = path.join(config.sourceDir, 'assets');
        const assetsDestPath = path.join(config.svnTrunkDir, 'assets');
        
        if (await fs.pathExists(assetsSourcePath)) {
            await fs.copy(assetsSourcePath, assetsDestPath);
            console.log('Copied to SVN: assets/');
        }
        
        // Copy minified files from build directory
        const minifiedFiles = [
            'assets/css/admin-bar-pagination.min.css',
            'assets/js/admin-bar-pagination.min.js'
        ];
        
        for (const file of minifiedFiles) {
            const sourcePath = path.join(config.buildDir, file);
            const destPath = path.join(config.svnTrunkDir, file);
            
            if (await fs.pathExists(sourcePath)) {
                await fs.copy(sourcePath, destPath);
                console.log(`Copied minified to SVN: ${file}`);
            }
        }
        
        console.log('Files copied to SVN structure successfully!');
        
    } catch (error) {
        console.error('Error copying to SVN:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    copyToSVN();
}

module.exports = { copyToSVN, config };
