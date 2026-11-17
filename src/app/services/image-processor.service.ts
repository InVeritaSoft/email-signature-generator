import { Injectable } from '@angular/core';
import * as blazeface from '@tensorflow-models/blazeface';
import type {
  BlazeFaceModel,
  NormalizedFace,
} from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

@Injectable({
  providedIn: 'root',
})
export class ImageProcessorService {
  private model: BlazeFaceModel | null = null;
  private modelLoading = false;
  private backendInitialized = false;

  /**
   * Initializes TensorFlow.js backend
   */
  private async initializeBackend(): Promise<void> {
    if (this.backendInitialized) {
      return;
    }

    try {
      // Try to set WebGL backend (faster, GPU-accelerated)
      await tf.setBackend('webgl');
      await tf.ready();
      this.backendInitialized = true;
    } catch (error) {
      // Fallback to CPU backend if WebGL fails
      try {
        await tf.setBackend('cpu');
        await tf.ready();
        this.backendInitialized = true;
        console.warn('WebGL backend not available, using CPU backend');
      } catch (cpuError) {
        console.error('Failed to initialize TensorFlow.js backend:', cpuError);
        throw cpuError;
      }
    }
  }

  /**
   * Loads the BlazeFace model (lazy loading)
   */
  private async loadModel(): Promise<BlazeFaceModel> {
    if (this.model) {
      return this.model;
    }

    if (this.modelLoading) {
      // Wait for the model to finish loading
      while (this.modelLoading) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (this.model) {
        return this.model;
      }
    }

    this.modelLoading = true;
    try {
      // Initialize backend before loading model
      await this.initializeBackend();
      this.model = await blazeface.load();
      this.modelLoading = false;
      return this.model;
    } catch (error) {
      this.modelLoading = false;
      console.error('Failed to load face detection model:', error);
      throw error;
    }
  }

  /**
   * Detects faces in an image
   */
  private async detectFaces(
    image: HTMLImageElement
  ): Promise<NormalizedFace[] | null> {
    try {
      const model = await this.loadModel();
      const predictions = await model.estimateFaces(image, false);
      return predictions.length > 0 ? predictions : null;
    } catch (error) {
      console.warn('Face detection failed, will use center crop:', error);
      return null;
    }
  }

  /**
   * Calculates crop region to center the face
   */
  private calculateFaceCrop(
    face: NormalizedFace,
    imageWidth: number,
    imageHeight: number,
    targetSize: number
  ): { x: number; y: number; width: number; height: number } {
    // Get face bounding box
    const start = face.topLeft as [number, number];
    const end = face.bottomRight as [number, number];

    // Calculate face center
    const faceCenterX = (start[0] + end[0]) / 2;
    const faceCenterY = (start[1] + end[1]) / 2;

    // Calculate face dimensions
    const faceWidth = end[0] - start[0];
    const faceHeight = end[1] - start[1];

    // Calculate crop size with padding around face
    // Use larger padding to ensure face is well-centered
    const faceMaxDimension = Math.max(faceWidth, faceHeight);
    const cropSize = Math.min(
      imageWidth,
      imageHeight,
      faceMaxDimension * 3.5 // Increased padding for better centering
    );

    // For better vertical centering, adjust the crop position
    // Move crop down slightly so face appears more centered (not too high)
    const verticalOffset = cropSize * 0.08; // Adjust to move face down in final image

    // Calculate crop position (center face horizontally, adjust vertically for better centering)
    let cropX = faceCenterX - cropSize / 2;
    let cropY = faceCenterY - cropSize / 2 + verticalOffset; // Add offset moves crop down, face appears lower

    // Ensure crop stays within image bounds
    cropX = Math.max(0, Math.min(cropX, imageWidth - cropSize));
    cropY = Math.max(0, Math.min(cropY, imageHeight - cropSize));

    // If image is smaller than crop size, use full image
    const finalCropSize = Math.min(cropSize, imageWidth, imageHeight);

    return {
      x: Math.max(0, cropX),
      y: Math.max(0, cropY),
      width: finalCropSize,
      height: finalCropSize,
    };
  }

  /**
   * Resizes and processes image: shrinks if needed and centers face
   */
  async processImage(
    file: File,
    maxDimension: number = 800,
    targetSize: number = 400
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.onload = async () => {
            try {
              if ('decode' in img && typeof img.decode === 'function') {
                try {
                  await img.decode();
                } catch (decodeErr) {
                  console.warn(
                    'Image decode() failed, continuing with onload state:',
                    decodeErr,
                  );
                }
              }
              // Step 1: Resize if image is too large
              const { width, height } = this.calculateResizeDimensions(
                img.width,
                img.height,
                maxDimension
              );

              // Step 2: Detect face
              const faces = await this.detectFaces(img);

              // Step 3: Create canvas and process image
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              if (!ctx) {
                throw new Error('Failed to get canvas context');
              }

              let sourceX = 0;
              let sourceY = 0;
              let sourceWidth = img.width;
              let sourceHeight = img.height;
              let outputWidth = width;
              let outputHeight = height;

              // If face detected, calculate crop region
              if (faces && faces.length > 0) {
                const face = faces[0]; // Use first detected face
                const crop = this.calculateFaceCrop(
                  face,
                  img.width,
                  img.height,
                  targetSize
                );

                sourceX = crop.x;
                sourceY = crop.y;
                sourceWidth = crop.width;
                sourceHeight = crop.height;

                // Resize crop region to target size (square)
                outputWidth = targetSize;
                outputHeight = targetSize;
              } else {
                // No face detected: center crop and resize
                const minDimension = Math.min(img.width, img.height);
                sourceWidth = minDimension;
                sourceHeight = minDimension;
                sourceX = (img.width - minDimension) / 2;
                sourceY = (img.height - minDimension) / 2;
                outputWidth = targetSize;
                outputHeight = targetSize;
              }

              // Set canvas size
              canvas.width = outputWidth;
              canvas.height = outputHeight;

              // Draw and resize image
              ctx.drawImage(
                img,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                outputWidth,
                outputHeight
              );

              // Convert to base64. Keep it small: the signature is inlined into every
              // message and quoted again in each reply, and Gmail clips messages over ~102KB.
              const base64 = canvas.toDataURL('image/jpeg', 0.8);
              resolve(base64);
            } catch (error) {
              console.error('Image processing error:', error);
              reject(error);
            }
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target?.result as string;
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Calculates new dimensions while maintaining aspect ratio
   */
  private calculateResizeDimensions(
    width: number,
    height: number,
    maxDimension: number
  ): { width: number; height: number } {
    if (width <= maxDimension && height <= maxDimension) {
      return { width, height };
    }

    const aspectRatio = width / height;
    if (width > height) {
      return {
        width: maxDimension,
        height: Math.round(maxDimension / aspectRatio),
      };
    } else {
      return {
        width: Math.round(maxDimension * aspectRatio),
        height: maxDimension,
      };
    }
  }
}
