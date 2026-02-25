import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerConfig: MulterOptions = {
  fileFilter: (req, file, callback) => {
    if (file.mimetype.match(/\/(pdf)$/)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type'), false);
    }
  },

  limits: {
    fileSize: 1024 * 1024 * 200,
  },
};
