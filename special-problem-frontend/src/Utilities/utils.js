import CryptoJS from 'crypto-js';

export const encrypt = (data) => {
    const encryptionKey = process.env.REACT_APP_SECRET_KEY;
    const encryptedData = CryptoJS.AES.encrypt(data, encryptionKey).toString();
    return encryptedData;
};

export const decrypt = (encryptedData) => {
    const encryptionKey = process.env.REACT_APP_SECRET_KEY;
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
};