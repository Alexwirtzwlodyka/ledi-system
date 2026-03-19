export interface UploadAdjuntoPayload { escribano_id: number; filename: string; content: string }

export function buildAdjuntosListRequest(escribanoId: number) {
  return { method: 'GET' as const, url: `/adjuntos?escribano_id=${escribanoId}` }
}

export function buildAdjuntoUploadRequest(payload: UploadAdjuntoPayload) {
  return {
    method: 'POST' as const,
    url: '/adjuntos',
    body: { escribano_id: payload.escribano_id, filename: payload.filename.trim(), content: payload.content },
  }
}

export function buildAdjuntoDownloadRequest(adjuntoId: number, stepUpToken?: string) {
  return {
    method: 'POST' as const,
    url: '/adjuntos/download',
    body: { adjunto_id: adjuntoId, ...(stepUpToken ? { step_up_token: stepUpToken } : {}) },
  }
}
