const fs = require('fs');
const path = require('path');
const os = require('os');

async function cleanupPuppeteerFiles() {
    try {
        const tempDir = os.tmpdir();
        console.log(`Checking temp directory: ${tempDir}`);

        // Find Puppeteer temp directories
        const files = fs.readdirSync(tempDir);
        const puppeteerDirs = files.filter(
            (file) =>
                file.startsWith('puppeteer_dev_chrome_profile-') ||
                file.startsWith('puppeteer_dev_firefox_profile-'),
        );

        console.log(`Found ${puppeteerDirs.length} Puppeteer temp directories`);

        for (const dir of puppeteerDirs) {
            const fullPath = path.join(tempDir, dir);
            try {
                console.log(`Cleaning up: ${fullPath}`);
                await fs.promises.rm(fullPath, {
                    recursive: true,
                    force: true,
                });
                console.log(`✅ Cleaned up: ${dir}`);
            } catch (error) {
                console.log(`❌ Failed to clean: ${dir} - ${error.message}`);
                // Try to unlock and delete individual files
                try {
                    const dirContents = fs.readdirSync(fullPath);
                    for (const file of dirContents) {
                        const filePath = path.join(fullPath, file);
                        try {
                            await fs.promises.unlink(filePath);
                        } catch (fileError) {
                            console.log(`Failed to delete file: ${filePath}`);
                        }
                    }
                    await fs.promises.rmdir(fullPath);
                    console.log(`✅ Force cleaned: ${dir}`);
                } catch (forceError) {
                    console.log(`❌ Force clean failed: ${dir}`);
                }
            }
        }

        console.log('Cleanup completed!');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

cleanupPuppeteerFiles();
