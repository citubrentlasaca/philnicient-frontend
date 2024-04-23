export const encrypt = (str, keyword) => {
    const keyLength = keyword.length;
    let encryptedText = '';

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        const keywordChar = keyword.charCodeAt(i % keyLength);
        const shift = keywordChar - 65; // Assuming uppercase letters for the keyword

        if (charCode >= 65 && charCode <= 90) { // Uppercase letters
            encryptedText += String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
        } else if (charCode >= 97 && charCode <= 122) { // Lowercase letters
            encryptedText += String.fromCharCode(((charCode - 97 + shift) % 26) + 97);
        } else {
            encryptedText += str[i];
        }
    }

    return encryptedText;
};

export const decrypt = (str, keyword) => {
    const keyLength = keyword.length;
    let decryptedText = '';

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        const keywordChar = keyword.charCodeAt(i % keyLength);
        const shift = keywordChar - 65; // Assuming uppercase letters for the keyword

        if (charCode >= 65 && charCode <= 90) { // Uppercase letters
            decryptedText += String.fromCharCode(((charCode - 65 - shift + 26) % 26) + 65);
        } else if (charCode >= 97 && charCode <= 122) { // Lowercase letters
            decryptedText += String.fromCharCode(((charCode - 97 - shift + 26) % 26) + 97);
        } else {
            decryptedText += str[i];
        }
    }

    return decryptedText;
};