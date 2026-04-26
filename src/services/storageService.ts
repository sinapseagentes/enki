import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";

/**
 * Faz upload de um arquivo para o Firebase Storage
 * @param cardId ID do cartão ao qual o arquivo pertence
 * @param file O arquivo a ser enviado
 * @returns A URL de download do arquivo
 */
export const uploadFile = async (cardId: string, file: File): Promise<string> => {
  const timestamp = Date.now();
  const storageRef = ref(storage, `cards/${cardId}/${timestamp}_${file.name}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};
