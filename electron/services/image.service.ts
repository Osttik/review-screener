import CryptoJS from 'crypto-js';

export class ImageService {
    public generateImageName = (imageData: string) => {
        return CryptoJS.SHA256(imageData).toString(CryptoJS.enc.Hex);
    }
}

export const imageService = new ImageService();