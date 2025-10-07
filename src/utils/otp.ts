import crypto from 'crypto';

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
};

export const getOTPExpiryDate = (minutes: number = 10): Date => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || minutes;
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};



