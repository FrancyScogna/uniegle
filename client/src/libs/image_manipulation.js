export const compressBase64Image = async (base64Image, maxSizeMB = 5) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0, img.width, img.height);

            const base64SizeInMB = (base64) => {
                const stringLength = base64.length - 'data:image/jpeg;base64,'.length;
                return (stringLength * (3 / 4)) / (1024 * 1024);
            };

            let quality = 0.9;
            let compressedBase64 = canvas.toDataURL("image/jpeg", quality);

            while (base64SizeInMB(compressedBase64) > maxSizeMB && quality > 0.1) {
                quality -= 0.1;
                compressedBase64 = canvas.toDataURL("image/jpeg", quality);
            }

            if (base64SizeInMB(compressedBase64) > maxSizeMB) {
                reject(new Error("Impossibile comprimere l'immagine entro il limite di dimensione specificato."));
            } else {
                resolve(compressedBase64);
            }
        };

        img.onerror = (err) => {
            reject(new Error("Errore durante il caricamento dell'immagine."));
        };
    });
};
