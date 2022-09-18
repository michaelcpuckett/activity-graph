import * as crypto from 'crypto';

export const getGuid = () => crypto.randomBytes(16).toString('hex');

export async function generateKeyPair() {
    let publicKey = '';
    let privateKey = '';

    crypto.generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    }, (error, pubKey, privKey) => {
        if (error) {
            console.log(error);
            throw new Error(String(error));
        }
        publicKey = pubKey;
        privateKey = privKey;
    });

    return {
        publicKey,
        privateKey,
    };
}