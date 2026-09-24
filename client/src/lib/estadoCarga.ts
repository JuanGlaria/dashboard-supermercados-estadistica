export type EstadoCarga<T> =
  | { status: 'cargando' }
  | { status: 'error'; mensaje: string }
  | { status: 'listo'; datos: T }
