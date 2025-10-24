import multer from 'multer';
import path from 'path';

// Define storage location and filename format
const storage = multer.diskStorage({
    destination(req, file, cb) {
        // Files will be stored in the 'uploads' folder in the backend root
        cb(null, 'uploads/'); 
    },
    filename(req, file, cb) {
        // Creates a unique filename: fieldname-timestamp.ext
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// File filter to accept only images and common document types
const fileFilter = (req, file, cb) => {
    // Regex for allowed file extensions (case-insensitive)
    const allowedTypes = /\.(jpeg|jpg|png|gif|pdf|doc|docx)$/i; 
    
    const extname = allowedTypes.test(path.extname(file.originalname));
    // Check MIME type as well for security
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.includes('pdf') || file.mimetype.includes('document');

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDF, and MS Office documents are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 }, // Limit to 10MB
});

export default upload;