import multer from "multer";

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set file size limit and filter for accepted file types (images, videos, audio)
const fileFilter = (req, file, cb) => {
  // Accept only images, videos, and audio files
  const filetypes = /jpeg|jpg|png|gif|mp4|mkv|webm|mp3|wav/;
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: fileFilter,
});
