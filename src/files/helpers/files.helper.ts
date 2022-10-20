import { v4 as uuidV4 } from 'uuid';

const IMAGES_VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const extension = file.mimetype.split('/')[1];
  if (IMAGES_VALID_EXTENSIONS.includes(extension)) {
    return callback(null, true);
  }

  callback(null, false);
};

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, filename: string) => void,
) => {
  if (!file) return callback(new Error('File is empty'), null);

  const extension = file.mimetype.split('/')[1];
  const fileName = `${uuidV4()}.${extension}`;

  callback(null, fileName);
};
