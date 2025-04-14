const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_URL,
  forcePathStyle: false,
  region: "sgp1",
  credentials: {
    accessKeyId: process.env.DO_ACCESS_KEY,
    secretAccessKey: process.env.DO_SECRET_KEY,
  },
});

const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/mpeg", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
};

const getFileExtension = (contentType) => {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "video/mp4": "mp4",
    "video/mpeg": "mpeg",
    "video/quicktime": "mov",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
  };
  return extensions[contentType] || "bin";
};

async function uploadFileToS3(file, fileName, contentType) {
  const fileBuffer = file;
  const truncatedFileName = fileName.substring(0, 4);
  const fileExtension = getFileExtension(contentType);
  const newFileName = `${truncatedFileName}-${Date.now()}.${fileExtension}`;

  // Determine folder based on file type
  let folder = "other";
  if (ALLOWED_FILE_TYPES.image.includes(contentType)) folder = "images";
  else if (ALLOWED_FILE_TYPES.pdf.includes(contentType)) folder = "documents";
  else if (ALLOWED_FILE_TYPES.video.includes(contentType)) folder = "videos";
  else if (ALLOWED_FILE_TYPES.audio.includes(contentType)) folder = "audio";

  const params = {
    Bucket: process.env.DO_BUCKET_KEY,
    Key: `${folder}/${newFileName}`,
    Body: fileBuffer,
    ACL: "public-read",
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));
  return `${folder}/${newFileName}`;
}

const fileUpload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "File is required!" });
    }

    // Validate file type
    const contentType = file.mimetype;
    const isAllowedType = Object.values(ALLOWED_FILE_TYPES)
      .flat()
      .includes(contentType);

    if (!isAllowedType) {
      return res.status(400).json({
        error:
          "Invalid file type. Allowed types: images, PDFs, videos, and audio files",
      });
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({
        error: "File size should be less than 50MB!",
      });
    }

    const fileName = await uploadFileToS3(
      file.buffer,
      file.originalname,
      contentType
    );
    return res.json({
      success: true,
      fileName,
      contentType,
      url: `${process.env.DO_SPACES_URL}/${process.env.DO_BUCKET_KEY}/${fileName}`,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ error: "File upload failed!" });
  }
};

module.exports = {
  fileUpload,
};
