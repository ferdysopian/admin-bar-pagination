const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const config = {
    sourceDir: path.resolve(__dirname, '../build/admin-bar-pagination'), // Source directory for files to be zipped
    outputFile: path.resolve(__dirname, '../build/admin-bar-pagination.zip'), // Output ZIP file path
    pluginName: 'admin-bar-pagination' // The name of the root folder inside the ZIP
};

async function createZip() {
    console.log('Creating ZIP file...');

    // Ensure the output directory exists
    await fs.ensureDir(path.dirname(config.outputFile));

    const output = fs.createWriteStream(config.outputFile);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    output.on('close', function() {
        console.log(`ZIP file created: ${archive.pointer()} total bytes`);
        console.log(`ZIP file created: ${config.outputFile}`);
    });

    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            console.warn('Archiver warning:', err);
        } else {
            throw err;
        }
    });

    archive.on('error', function(err) {
        throw err;
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add all files from the source directory to the archive, excluding hidden files
    // This creates admin-bar-pagination/ folder inside the ZIP
    archive.directory(config.sourceDir, config.pluginName, {
        filter: function(entry) {
            // Exclude hidden files and directories
            const fileName = path.basename(entry.name);
            if (fileName.startsWith('.')) {
                console.log(`Excluding hidden file: ${entry.name}`);
                return false;
            }
            return true;
        }
    });

    // Finalize the archive
    await archive.finalize();

    console.log('ZIP file created successfully!');
    console.log(`Total size: ${archive.pointer()} bytes`);
}

if (require.main === module) {
    createZip();
}

module.exports = { createZip, config };
