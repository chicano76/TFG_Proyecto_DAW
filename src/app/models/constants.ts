export const ESTADOS_JORNADA = {
  CREADA: 'CREADA',
  EN_CURSO: 'EN_CURSO',
  PAUSA: 'PAUSA',
  FINALIZADA: 'FINALIZADA'
};

export const ESTADOS_VISITA = {
  PENDIENTE: 'pendiente',
  EN_CURSO: 'en curso',
  COMPLETADA: 'completada'
};

export const MENSAJES = {
  DEBES_INICIAR: 'Debes iniciar la jornada antes.',
  NO_PAUSA_CON_VISITA: 'No puedes iniciar una pausa con una visita en curso.',
  NO_FICHAR_EN_PAUSA: 'No puedes fichar durante una pausa.',
  ORDEN_VISITAS: 'Debes completar las visitas en orden.',
  VISITA_EN_CURSO: 'Ya tienes una visita en curso.',
  EXITO: 'Acción realizada correctamente.'
};
