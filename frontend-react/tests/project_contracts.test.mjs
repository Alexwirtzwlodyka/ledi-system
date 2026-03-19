import assert from 'node:assert/strict'
import { buildLoginRequest, buildStepUpRequest } from '../src/features/auth/api/authApi.mjs'
import { buildEscribanosQuery } from '../src/features/escribanos/api/escribanosApi.mjs'
import { buildCreateUserRequest } from '../src/features/users/api/usersApi.mjs'
import { buildAdjuntoUploadRequest, buildAdjuntoDownloadRequest } from '../src/features/adjuntos/api/adjuntosApi.mjs'
import { buildAuditListRequest } from '../src/features/audit/api/auditApi.mjs'

const login = buildLoginRequest({ username: ' admin ', password: 'Admin.1234' })
assert.equal(login.url, '/auth/login')
assert.equal(login.body.username, 'admin')

const users = buildCreateUserRequest({ username: ' op1 ', email: ' OP@MAIL.COM ', password: 'x', role: 'operador' })
assert.equal(users.body.email, 'op@mail.com')
assert.equal(users.body.username, 'op1')

const query = buildEscribanosQuery({ search: ' Pérez ', dni: '30.111.222', estado: 'activo' })
assert.equal(query, '/escribanos?search=P%C3%A9rez&dni=30111222&estado=activo')

const adj = buildAdjuntoUploadRequest({ escribano_id: 7, filename: ' legajo.pdf ', content: '%PDF', content_encoding: 'base64' })
assert.equal(adj.url, '/adjuntos')
assert.equal(adj.body.filename, 'legajo.pdf')
assert.equal(adj.body.content_encoding, 'base64')

console.log('OK - project contracts frontend')

const step = buildStepUpRequest({ username: ' ADMIN ', password: 'x' })
assert.equal(step.url, '/auth/step-up')
assert.equal(step.body.username, 'admin')

const down = buildAdjuntoDownloadRequest(7, 'abc123')
assert.equal(down.url, '/adjuntos/download')
assert.equal(down.body.step_up_token, 'abc123')

const audit = buildAuditListRequest({ action: 'ADJUNTO_DOWNLOADED', target_type: 'adjunto' })
assert.equal(audit.url, '/audit?action=ADJUNTO_DOWNLOADED&target_type=adjunto')
