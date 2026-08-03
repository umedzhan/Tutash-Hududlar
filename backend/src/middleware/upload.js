import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

function makeStorage(subdir) {
  const dir = path.resolve('uploads', subdir);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
}

const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function documentFilter(req, file, cb) {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    return cb(new Error('Faqat PDF yoki rasm fayllari qabul qilinadi'));
  }
  cb(null, true);
}

function imageFilter(req, file, cb) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error('Faqat rasm fayllari qabul qilinadi'));
  }
  cb(null, true);
}

export const uploadRegistrationDocument = multer({
  storage: makeStorage('companies'),
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('registrationDocument');

export const uploadLandPhotos = multer({
  storage: makeStorage('applications'),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
}).fields([
  { name: 'shimol', maxCount: 1 },
  { name: 'janub', maxCount: 1 },
  { name: 'sharq', maxCount: 1 },
  { name: 'gharb', maxCount: 1 },
]);

// Joylashuv sxemasi / dizayn-kod fayllari — DWG/DXF brauzerlarda barqaror mimetype
// yubormaydi, shuning uchun kengaytma bo'yicha tekshiriladi.
const ALLOWED_SCHEME_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.dwg', '.dxf'];

function schemeFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_SCHEME_EXTENSIONS.includes(ext)) {
    return cb(new Error('Faqat PDF, JPG, PNG, DWG yoki DXF fayllari qabul qilinadi'));
  }
  cb(null, true);
}

export const uploadLocationScheme = multer({
  storage: makeStorage('applications'),
  fileFilter: schemeFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
}).single('locationScheme');

export const uploadDesignCode = multer({
  storage: makeStorage('applications'),
  fileFilter: schemeFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
}).single('designCode');

// Xatlov natijasi / noqonuniy foydalanish holati uchun bir nechta fayl (rasm/PDF)
export const uploadInspectionFiles = multer({
  storage: makeStorage('inspections'),
  fileFilter: documentFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
}).array('files', 5);
