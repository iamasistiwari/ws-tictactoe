import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
dotenv.config();

function hashStringWithSecret(input: string): string {
  const secretKey = process.env.SECRET_KEY!;
  console.log("KEY", secretKey)
  return CryptoJS.HmacSHA256(input, secretKey).toString(CryptoJS.enc.Hex);
}
const formatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  timeStyle: 'short',
  dateStyle: 'short',
});

export default function ValidateUser(token: string) {
  const time = formatter.format(new Date());
  const hashedString = hashStringWithSecret(time);
  console.log("hash",hashedString)
  if (hashedString === token) {
    return true;
  }
  return false;
}
ValidateUser("asdasd");
