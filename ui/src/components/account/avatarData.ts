export const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface AvatarPayload {
  contentType: string;
  content: string;
}

export function avatarDataUrl(payload: AvatarPayload): string {
  if (!payload.contentType.startsWith('image/') || !payload.content) {
    throw new Error('Invalid avatar response');
  }
  return `data:${payload.contentType};base64,${payload.content}`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image.'));
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const separator = result.indexOf(',');
      if (separator < 0) {
        reject(new Error('Invalid image.'));
        return;
      }
      resolve(result.slice(separator + 1));
    };
    reader.readAsDataURL(file);
  });
}
