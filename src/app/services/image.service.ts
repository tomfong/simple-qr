import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import jsQR from 'jsqr';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  /**
   * Scan a QR code from raw RGBA pixel data.
   * Extracted from ScanPage.getJsQr().
   */
  async scanQrFromImage(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const qrcode = jsQR(imageData, width, height, {
        inversionAttempts: 'attemptBoth',
      });
      if (qrcode) {
        return resolve(qrcode.data);
      } else {
        return reject();
      }
    });
  }

  /**
   * Scan a QR code from a data URL (e.g. from Camera.getPhoto).
   * Handles image loading, grayscale conversion, and QR detection.
   * Replaces ScanPage.convertDataUrlToImageData + getJsQr().
   */
  async scanQrFromDataUrl(
    dataUrl: string,
  ): Promise<{ data: string; format: string }> {
    const imageData = await this.dataUrlToImageData(dataUrl);
    const data = await this.scanQrFromImage(
      imageData.imageData.data,
      imageData.width,
      imageData.height,
    );
    return { data, format: 'QR_CODE' };
  }

  /**
   * Scan a QR code from a file path (e.g. a shared image via deep link).
   * Uses @capacitor/filesystem native API to read the file (bypasses webview file:// restrictions).
   * On Android/iOS, readFile() returns the binary data as a base64-encoded string.
   */
  async scanQrFromFilePath(
    filePath: string,
  ): Promise<{ data: string; format: string }> {
    // Strip file:// prefix — Filesystem.readFile expects native path
    const filesystemPath = filePath.startsWith('file://')
      ? filePath.replace('file://', '')
      : filePath;

    // Read file via Capacitor Filesystem (native layer, not webview)
    const result = await Filesystem.readFile({
      path: filesystemPath,
    });

    // On native platforms, data is returned as a base64-encoded string
    const base64Content = result.data as string;

    // Determine MIME type from file extension
    const isJpeg = filesystemPath.toLowerCase().endsWith('.jpg') ||
                   filesystemPath.toLowerCase().endsWith('.jpeg');
    const mimeType = isJpeg ? 'image/jpeg' : 'image/png';

    // Construct a data URL from base64
    const dataUrl = `data:${mimeType};base64,${base64Content}`;
    return this.scanQrFromDataUrl(dataUrl);
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert a data URL (data: or file://) to grayscale ImageData.
   * Matches the logic previously in ScanPage.convertDataUrlToImageData.
   */
  private async dataUrlToImageData(
    uri: string,
  ): Promise<{ imageData: ImageData; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (uri == null) return reject();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();
      image.addEventListener(
        'load',
        function () {
          canvas.width = image.width;
          canvas.height = image.height;
          if (!context) {
            return reject();
          }
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          // Convert to grayscale
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg =
              (imageData.data[i] +
                imageData.data[i + 1] +
                imageData.data[i + 2]) /
              3;
            imageData.data[i] = avg;
            imageData.data[i + 1] = avg;
            imageData.data[i + 2] = avg;
          }
          const width = image.width;
          const height = image.height;
          resolve({ imageData: imageData, width: width, height: height });
        },
        false,
      );
      if (uri.startsWith('data:') || uri.startsWith('file://')) {
        image.src = uri;
      } else {
        // Assume base64 encoded image data without prefix
        image.src = 'data:image/png;base64,' + uri;
      }
    });
  }
}