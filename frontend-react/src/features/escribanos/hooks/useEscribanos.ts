import { useEffect, useState } from 'react'
import { apiGet } from '../../../api/http'
import { buildEscribanosQuery } from '../api/escribanosApi'
import type { Escribano } from '../types'
export function useEscribanos(search=''){const [data,setData]=useState<Escribano[]>([]); useEffect(()=>{apiGet(buildEscribanosQuery({search})).then(setData).catch(()=>setData([]))},[search]); return {data}}
