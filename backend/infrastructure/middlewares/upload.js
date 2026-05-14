import multer from 'multer';
import express from 'express';
import {fileURLToPath} from "node:url";
import path from "path";
import {unlinkSync,existsSync} from "node:fs";
import { createRequire } from 'module';




const __dirname = path.resolve();

const uploadDir = path.join(__dirname, '../../../uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    }
    ,filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomString = Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const secureFilename = `product-${timestamp}-${randomString}${fileExtension}`;
        cb(null, secureFilename);



    }
})

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.png', '.jpeg', '.gif'];
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/gif'];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);
    const isExtensionValid = allowedExtensions.includes(fileExtension);

    if (isMimeTypeValid && isExtensionValid) {
        cb(null, true);
    } else {
        const error = new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed`);
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false);
    }
}

const upload = multer({
   storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter

})

/*const handleMulterError = (error, req, res, next) => {
    // Clean up uploaded file if there was an error
    if (req.file) {
        try {
            unlinkSync(req.file.path);
        } catch (cleanupError) {
            console.error('Failed to cleanup file:', cleanupError);
        }
    }

    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB.',
                    code: 'FILE_TOO_LARGE'
                });

            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Only one file allowed per upload.',
                    code: 'TOO_MANY_FILES'
                });

            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field. Use "productImage" as field name.',
                    code: 'UNEXPECTED_FIELD'
                });

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Upload error occurred.',
                    code: 'UPLOAD_ERROR'
                });
        }
    }

    if (error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            success: false,
            message: error.message,
            code: 'INVALID_FILE_TYPE'
        });
    }

    next(error);
};*/

// Utility function to clean up files
const cleanupFile = (filePath) => {
    try {
        if (existsSync(filePath)) {
            unlinkSync(filePath);
            return true;
        }
    } catch (error) {
        console.error('Failed to cleanup file:', filePath, error);
        return false;
    }
    return false;
};

// Generate secure URL for frontend
const generateImageUrl = (filename) => {
    return `/uploads/${filename}`;
};

export {
    upload,
    //handleMulterError,
    cleanupFile,
    generateImageUrl,
    uploadDir

}