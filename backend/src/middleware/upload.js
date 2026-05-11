const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.mimetype))
    return cb(Object.assign(new Error('Only JPG, PNG, and PDF files are allowed.'), { status: 400 }));
  cb(null, true);
}

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter }).single('file');

function uploadMiddleware(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.status(err.status || 400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const isImage = ['image/jpeg', 'image/png'].includes(req.file.mimetype);
    if (isImage && req.file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Image files must be under 5MB.' });
    }
    next();
  });
}

module.exports = uploadMiddleware;
