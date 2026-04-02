import { FaceDetector, FilesetResolver, FaceDetectorResult } from "@mediapipe/tasks-vision";

let faceDetector: FaceDetector | null = null;
let isInitializing = false;

/**
 * Инициализирует детектор лиц (синглтон) с защитой от двойного вызова
 */
async function initializeFaceDetector() {
  if (faceDetector) return faceDetector;
  
  // Если инициализация уже идет, ждем
  if (isInitializing) {
     while (isInitializing) {
         await new Promise(r => setTimeout(r, 100));
         if (faceDetector) return faceDetector;
     }
  }

  isInitializing = true;
  try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
          delegate: "GPU" // Используем GPU телефона для скорости
        },
        runningMode: "IMAGE"
      });
  } catch (e) {
      console.error("MediaPipe Init Failed:", e);
      throw e;
  } finally {
      isInitializing = false;
  }

  return faceDetector;
}

/**
 * ОПТИМИЗАЦИЯ: Уменьшает изображение перед проверкой.
 * Для детекции лица нам не нужно 4K, достаточно 512px.
 * Это спасает память дешевых Android телефонов.
 */
async function resizeImageForDetection(file: File, maxSize: number = 512): Promise<HTMLCanvasElement> {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    let width = bitmap.width;
    let height = bitmap.height;

    // Вычисляем пропорции для уменьшения
    if (width > maxSize || height > maxSize) {
        if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
        } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
        }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(bitmap, 0, 0, width, height);
    
    // Освобождаем память битмапа сразу
    bitmap.close(); 
    
    return canvas;
}

/**
 * Проверяет наличие лица на файле изображения
 * @param file Файл изображения
 * @returns boolean true если лицо найдено
 */
export async function validateFaceInImage(file: File): Promise<{ hasFace: boolean; error?: string }> {
  try {
    // ТАЙМАУТ: Если загрузка модели тупит > 4 сек (плохой 3G), пропускаем проверку
    const timeoutPromise = new Promise<{ hasFace: boolean; error: string }>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 4000)
    );

    const checkPromise = (async () => {
        const detector = await initializeFaceDetector();
        if (!detector) return { hasFace: true }; // Should not happen

        // Используем уменьшенную копию
        const smallCanvas = await resizeImageForDetection(file);
        
        const result: FaceDetectorResult = detector.detect(smallCanvas);
        
        // Очищаем canvas для GC
        smallCanvas.width = 0; 
        smallCanvas.height = 0;

        const hasFace = result.detections.some(detection => {
            const score = detection.categories[0]?.score || 0;
            return score > 0.55; // Чуть снизили порог (55%) для сложных условий света
        });

        return { hasFace };
    })();

    return await Promise.race([checkPromise, timeoutPromise]);

  } catch (error) {
    console.warn("Face Check Skipped:", error);
    // Fail-safe: Если что-то упало (или таймаут), разрешаем загрузку, 
    // чтобы не блокировать клиента.
    return { hasFace: true, error: "Validation skipped due to performance/timeout" };
  }
}