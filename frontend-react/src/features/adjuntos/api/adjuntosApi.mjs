export function buildAdjuntosListRequest(escribanoId){ return { method: 'GET', url: `/adjuntos?escribano_id=${escribanoId}` } }
export function buildAdjuntoUploadRequest(payload){ return { method: 'POST', url: '/adjuntos', body: { escribano_id: payload.escribano_id, filename: String(payload.filename ?? '').trim(), content: String(payload.content ?? '') } } }
export function buildAdjuntoDownloadRequest(adjuntoId, stepUpToken){ return { method: 'POST', url: '/adjuntos/download', body: { adjunto_id: adjuntoId, ...(stepUpToken ? { step_up_token: stepUpToken } : {}) } } }
