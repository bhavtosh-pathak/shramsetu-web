import 'dotenv/config';
import { sendResetEmail } from './src/utils/sendEmail.js';

sendResetEmail('bhavtoshpathak@gmail.com', 'Test', 'http://localhost:5173/reset-password/test')
  .then(() => console.log('Mail sent'))
  .catch((e) => console.error('Mail failed:', e.message));