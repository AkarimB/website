import multer from 'multer';
import fs from 'fs';
import path from 'path';

function sanitizeFilename(filename) {
    const ext = path.extname(filename);
    let name = path.basename(filename, ext);
    name = name.replace(/\s+/g, '_');
    name = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    name = name.replace(/_+/g, '_');
    name = name.replace(/^_+|_+$/g, '');
    if (name.length === 0) name = 'file';
    return name + ext;
}

function getUniqueFilename(dir, name) {
    if (!fs.existsSync(path.join(dir, name))) return name;
    const ext = path.extname(name);
    const base = path.basename(name, ext);
    const match = base.match(/^(.+)_(\d+)$/);
    let newBase, counter;
    if (match) {
        newBase = match[1];
        counter = parseInt(match[2]) + 1;
    } else {
        newBase = base;
        counter = 1;
    }
    while (true) {
        const newName = newBase + '_' + counter + ext;
        if (!fs.existsSync(path.join(dir, newName))) return newName;
        counter++;
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        const safeName = sanitizeFilename(file.originalname);
        const uniqueName = getUniqueFilename('./public/images', safeName);
        req.savedFilename = uniqueName;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

export const getUpload = upload.single('upload');

export const handleUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileName = req.savedFilename || req.file.filename;
    const fres = {
        "uploaded": 1,
        "fileName": fileName,
        "url": '/images/' + fileName,
        "error": { "message": "File successfully uploaded" }
    };
    res.status(200).json(fres);
};
