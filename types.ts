export interface GeneratedPart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}

export interface EditImageResponse {
  imageUrl?: string;
  text?: string;
}

export enum ImageStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
