import path from 'path';
import getRemoteData from './getRemoteData';
import { getFileFormat, readPostalCodesSync, processZipFile } from './utils';
import config from './config';

async function bootstrap() {
  try {
    const { postcode } = config;

    console.log('Downloading...');

    await getRemoteData({
      url: postcode.url,
      path: postcode.downloadPath,
    });

    const { ext } = await getFileFormat(postcode.downloadPath);

    let csvPath: string;

    switch (ext) {
      case 'zip':
        csvPath = await processZipFile(postcode.downloadPath);
        break;
      case 'csv':
        csvPath = path.resolve(__dirname, postcode.downloadPath);
        break;
    }

    const postCodes = await readPostalCodesSync(csvPath);
    console.log(postCodes);
  } catch (err) {
    console.error(err);
  }
}
bootstrap();
