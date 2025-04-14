const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Dynamic imports for ES modules
const importImagemin = async () => {
    const imagemin = (await import('imagemin')).default;
    const imageminMozjpeg = (await import('imagemin-mozjpeg')).default;
    const imageminPngquant = (await import('imagemin-pngquant')).default;
    return { imagemin, imageminMozjpeg, imageminPngquant };
};

const uploadImage = async (req, res) => {
    console.log(req.file);
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const outputFilePath = path.join(__dirname, 'resized', `${req.file.filename}.jpg`);

    try {
        // Resize image
        await sharp(filePath)
            .resize(800, 600) // width x height
            .toFormat('jpg')
            .toFile(outputFilePath);

        // Dynamically import imagemin and its plugins
        const { imagemin, imageminMozjpeg, imageminPngquant } = await importImagemin();

        // Compress image
        const compressedImage = await imagemin([outputFilePath], {
            destination: 'compressed/',
            plugins: [
                imageminMozjpeg({ quality: 60 }),
                imageminPngquant({
                    quality: [0.6, 0.8]
                })
            ]
        });

        // Send compressed image path back
        res.status(200).json({ message: 'Image processed successfully', filePath: compressedImage[0].destinationPath });
    } catch (error) {
        res.status(500).json({ error: 'Error processing image' });
    } finally {
        // Clean up uploaded and resized images
        fs.unlinkSync(filePath);
        fs.unlinkSync(outputFilePath);
    }
};

module.exports = { uploadImage };
