import fs from 'fs';
import path from 'path';

import csv from 'csv-parser';
import extract from 'extract-zip';
import { fromFile } from 'file-type';

type FileFormat = {
  readonly ext: string; //png
  readonly mime: string; // image/png
};

const getFileFormat = async (path): Promise<FileFormat> => {
  return fromFile(path);
};

const unzipFile = async (path: string, target: string): Promise<void> => {
  return extract(path, { dir: target });
};

const getFirstCsvFileName = (dir: string) => {
  const files = fs.readdirSync(dir);
  const firstCsv = files.find((file) => path.extname(file) === '.csv');
  return firstCsv;
};

const processZipFile = async (remoteDataPath: string): Promise<string> => {
  try {
    console.log(`Unzipping ${remoteDataPath} to ${__dirname}/UnzippedFiles.`);
    await unzipFile(remoteDataPath, path.resolve(__dirname, 'UnzippedFiles'));
    console.log(`Successfully unzipped`);
    const csvDirectoryPath = path.resolve(__dirname, 'UnzippedFiles', 'Data');
    const csvFileName = getFirstCsvFileName(csvDirectoryPath);
    const csvPath = path.join(csvDirectoryPath, csvFileName);

    return csvPath;
  } catch (err) {
    console.error('Could not unzip file');
    process.exit(0);
  }
};

const changeExtension = (file, extension) => {
  const basename = path.basename(file, path.extname(file));
  return path.join(path.dirname(file), basename + extension);
};

const readPostalCodesSync = async (csvPath: string) => {
  console.log(`Reading postalcodes from ${csvPath} ...`);

  return await new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data['pcd']))
      .on('end', () => {
        console.log('Finished reading postal codes.');
        return resolve(results);
      });
  });
};

export {
  getFileFormat,
  unzipFile,
  getFirstCsvFileName,
  processZipFile,
  changeExtension,
  readPostalCodesSync,
};
