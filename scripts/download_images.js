/* eslint-disable */
const fs = require('fs');
const https = require('https');
const path = require('path');

const destDir = path.join(__dirname, '..', 'public', 'gpus');
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const images = [
    { name: 'nvidia.png', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Nvidia_GeForce_RTX_3080_Founders_Edition_10GB_front_quarter_upright.png' },
    { name: 'amd.png', url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/AMD_Radeon_RX_6800_XT.png' },
    { name: 'apple.png', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Apple_M1.png' },
    { name: 'intel.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Intel_Arc_A770_Limited_Edition_16GB_front_side.png/800px-Intel_Arc_A770_Limited_Edition_16GB_front_side.png' }
];

const download = (url, destPath) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        };

        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return download(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }

            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', (err) => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
        }).on('error', reject);
    });
};

async function main() {
    for (const img of images) {
        try {
            const destPath = path.join(destDir, img.name);
            await download(img.url, destPath);
            console.log(`Successfully downloaded ${img.name}`);
        } catch (error) {
            console.error(`Error downloading ${img.name}:`, error.message);
        }
    }
}

main();
