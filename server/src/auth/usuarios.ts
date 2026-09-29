import sql from 'mssql'
import { getPoolCasaCentral } from '../db/pool.js'

export type UsuarioSecr = { usuario: string; autorizado: boolean }

export async function buscarUsuarioSecr(
  usuario: string,
  clave: string,
): Promise<UsuarioSecr | undefined> {
  const pool = await getPoolCasaCentral()
  const { recordset } = await pool
    .request()
    .input('usuario', sql.VarChar(20), usuario)
    .input('clave', sql.VarChar(10), clave)
    .query<{ usuario: string; niveles: string }>(
      `SELECT RTRIM(usuario) AS usuario, niveles FROM SECR
       WHERE RTRIM(usuario) = @usuario AND RTRIM(clave) = @clave`,
    )
  const encontrado = recordset[0]
  return encontrado && { usuario: encontrado.usuario, autorizado: encontrado.niveles.includes('#DASH') }
}
