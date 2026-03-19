import assert from 'node:assert/strict'
import { buildLoginRequest } from '../src/features/auth/api/authApi.mjs'
import { buildEscribanosQuery } from '../src/features/escribanos/api/escribanosApi.mjs'
const login=buildLoginRequest({username:' admin ',password:'secret'}); assert.equal(login.url,'/auth/login'); assert.equal(login.body.username,'admin');
const query=buildEscribanosQuery({search:' Pérez ',dni:'30.111.222'}); assert.equal(query,'/escribanos?search=P%C3%A9rez&dni=30111222');
console.log('OK - smoke tests frontend')
