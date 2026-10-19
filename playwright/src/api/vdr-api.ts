import { APIRequestContext, APIResponse } from '@playwright/test';
import { APP_CONFIG } from '../data';

export interface VdrItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId?: string | null;
  size?: number;
}

export class VdrApiClient {
  readonly request: APIRequestContext;
  readonly baseUrl: string;
  private token: string | null = null;

  constructor(request: APIRequestContext, baseUrl = APP_CONFIG.API_BASE_URL) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // --- Auth Endpoints ---
  async login(email: string, pass: string): Promise<APIResponse> {
    const res = await this.request.post(`${this.baseUrl}/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: { email, password: pass },
    });
    if (res.ok()) {
      const data = await res.json();
      this.token = data.accessToken;
    }
    return res;
  }

  async register(email: string, pass: string, name: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/auth/register`, {
      headers: { 'Content-Type': 'application/json' },
      data: { email, password: pass, name },
    });
  }

  // --- Data Rooms ---
  async getDataRooms(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/data-rooms`, {
      headers: this.getHeaders(),
    });
  }

  async getRoomContents(roomId: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/data-rooms/${roomId}/contents`, {
      headers: this.getHeaders(),
    });
  }

  // --- Folders ---
  async createFolder(dataRoomId: string, name: string, parentId: string | null = null): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/folders`, {
      headers: this.getHeaders(),
      data: { dataRoomId, name, parentId },
    });
  }

  async renameFolder(folderId: string, name: string): Promise<APIResponse> {
    return this.request.patch(`${this.baseUrl}/folders/${folderId}`, {
      headers: this.getHeaders(),
      data: { name },
    });
  }

  async getDeletePreview(folderId: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/folders/${folderId}/delete-preview`, {
      headers: this.getHeaders(),
    });
  }

  async deleteFolder(folderId: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/folders/${folderId}`, {
      headers: this.getHeaders(),
    });
  }

  async deleteFile(fileId: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/files/${fileId}`, {
      headers: this.getHeaders(),
    });
  }

  // --- Shares ---
  async createShare(resourceType: 'DATAROOM' | 'FOLDER' | 'FILE', resourceId: string, mode: 'PUBLIC_LINK' | 'USER', granteeEmail?: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/shares`, {
      headers: this.getHeaders(),
      data: { resourceType, resourceId, mode, granteeEmail },
    });
  }

  async getReceivedShares(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/shares/received`, {
      headers: this.getHeaders(),
    });
  }

  async revokeShare(shareId: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/shares/${shareId}`, {
      headers: this.getHeaders(),
    });
  }

  // --- Public Links ---
  async getPublicShare(token: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/public/${token}`, {
      headers: { 'Accept': 'application/json' },
    });
  }
}
