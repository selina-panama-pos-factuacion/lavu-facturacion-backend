const datosEmisores = {
  casco: {
    dTipoRuc: '2',
    dRuc: '155664844-2-2018',
    dDV: '64',
    dCodUbi: '8-8-1',
    dCorreg: 'SAN FELIPE',
    dDistr: 'PANAMA',
    dProv: 'PANAMA',
    dNombEm: 'SELINA OPERATION BOLA DE ORO SA',
    dSucEm: '0009',
    dCoordEm: '+9.1263,-79.5855',
    dDirecEm: 'AV B con calle 12, Edificio Bola de Oro',
    dTfnEm1: '202-9883',
    dCorElectEmi1: 'facturacion.boladeoro@selina.com',
  },
  laNeta: {
    dTipoRuc: '2',
    dRuc: '155664844-2-2018',
    dDV: '64',
    dCodUbi: '8-8-1',
    dCorreg: 'SAN FELIPE',
    dDistr: 'PANAMA',
    dProv: 'PANAMA',
    dNombEm: 'SELINA OPERATION BOLA DE ORO SA',
    dSucEm: '0005',
    dCoordEm: '+9.1263,-79.5855',
    dDirecEm: 'AV B con calle 12, Edificio Bola de Oro',
    dTfnEm1: '202-9883',
    dCorElectEmi1: 'facturacion.boladeoro@selina.com',
  },
  bocas: {
    dTipoRuc: '2',
    dRuc: '155631917-2-2016',
    dDV: '42',
    dCodUbi: '1-1-1',
    dCorreg: 'BOCAS DEL TORO (CABECERA)',
    dDistr: 'BOCAS DEL TORO',
    dProv: 'BOCAS DEL TORO',
    dNombEm: 'SELINA OPERATIONS BOCAS DEL TORO, SA',
    dSucEm: '0009',
    dCoordEm: '+9.1263,-79.5855',
    dDirecEm: 'CALLE PRIMERA, EDIFICIO TROPIKAL MARKET',
    dTfnEm1: '321-0350',
    dCorElectEmi1: 'facturacion.bocasdeltoro@selina.com',
  },
  boquete: {
    dTipoRuc: '2',
    dRuc: '155704416-2-2021',
    dDV: '22',
    dCodUbi: '4-4-1',
    dCorreg: 'BAJO BOQUETE (CABECERA)',
    dDistr: 'BOQUETE',
    dProv: 'CHIRIQUI',
    dNombEm: 'SELINA OPERATION BOQUETE, S.A.',
    dSucEm: '0009',
    dCoordEm: '+9.1263,-79.5855',
    dDirecEm: 'Calle principal, Edif. Selina, Bajo Boquete',
    dTfnEm1: '621-3975',
    dCorElectEmi1: 'facturacion.boquete@selina.com',
  },
  redFrog: {
    dTipoRuc: '2',
    dRuc: '155623602-2-2016',
    dDV: '68',
    dCodUbi: '1-1-2',
    dCorreg: 'BASTIMENTOS',
    dDistr: 'BOCAS DEL TORO',
    dProv: 'BOCAS DEL TORO',
    dNombEm: 'SELINA OPERATION RED FROG S.A.',
    dSucEm: '0009',
    dCoordEm: '+9.1263,-79.5855',
    dDirecEm: 'Urbanización Playa Red Frog',
    dTfnEm1: '202-0873',
    dCorElectEmi1: 'facturacion.redfrog@selina.com',
  },
  venao: {
    dTipoRuc: '2',
    dRuc: '155656492-2-2017',
    dDV: '92',
    dCodUbi: '7-5-5',
    dCorreg: 'ORIA ARRIBA',
    dDistr: 'PEDASI',
    dProv: 'LOS SANTOS',
    dNombEm: 'SELINA OPERATION VENAO SA',
    dSucEm: '0009',
    dCoordEm: '+9.1263,-79.5855',
    dDirecEm: 'Calle principal Playa Venao',
    dTfnEm1: '202-7968',
    dCorElectEmi1: 'facturacion.playavenao@selina.com',
  },
  venaoTipi: {
    dTipoRuc: '2',
    dRuc: '155712645-2-2021',
    dDV: '57',
    dCodUbi: '7-5-5',
    dCorreg: 'ORIA ARRIBA',
    dDistr: 'PEDASI',
    dProv: 'LOS SANTOS',
    dNombEm: 'SELINA OPERATION VENAO TIPI SA',
    dSucEm: '0009',
    dCoordEm: '+9.1263,-79.5855',
    dDirecEm: 'Calle venao, Edificio Selina Tipi.',
    dTfnEm1: '659-4874',
    dCorElectEmi1: 'facturacion.venaotipi@selina.com',
  },
}

export const locacionesConfig = {
  TacosLaNeta: {
    envPrefix: 'TLN_',
    redisPrefix: 'bolaDeOro',
    mailReceivers: ['karen@tacoslaneta.com', 'jose.martinez@selina.com', 'dianye@selina.com', 'lineth.pimentel@selina.com'],
    factura: {
      emisor: datosEmisores.laNeta,
    },
  },
  Casco: {
    envPrefix: 'CASCO_',
    redisPrefix: 'casco',
    mailReceivers: ['karen@tacoslaneta.com', 'jose.martinez@selina.com', 'dianye@selina.com', 'lineth.pimentel@selina.com'],
    factura: {
      emisor: datosEmisores.casco,
    },
  },
  Bocas: {
    envPrefix: 'BOCAS_',
    redisPrefix: 'bocas',
    mailReceivers: ['contabilidadbocas@tacoslaneta.com', 'jose.martinez@selina.com', 'claribel.castillo@selina.com'],
    factura: {
      emisor: datosEmisores.bocas,
    },
  },
  Boquete: {
    envPrefix: 'BOQUETE_',
    redisPrefix: 'boquete',
    mailReceivers: ['cindy@tacoslaneta.com', 'jose.martinez@selina.com', 'dianye@selina.com', 'liliana.quiel@selina.com'],
    factura: {
      emisor: datosEmisores.boquete,
    },
  },
  RedFrog: {
    envPrefix: 'REDFROG_',
    redisPrefix: 'redfrog',
    mailReceivers: ['claribel.castillo@selina.com', 'vera.akhmetshin@selina.com'],
    factura: {
      emisor: datosEmisores.redFrog,
    },
  },
  Venao: {
    envPrefix: 'VENAO_',
    redisPrefix: 'venao',
    mailReceivers: ['contabilidadlapalma@tacoslaneta.com', 'jose.martinez@selina.com', 'aurys.cuentas@selina.com'],
    factura: {
      emisor: datosEmisores.venao,
    },
  },
  VenaoTipi: {
    envPrefix: 'VENAOTIPI_',
    redisPrefix: 'venaotipi',
    mailReceivers: ['contabilidadlapalma@tacoslaneta.com', 'jose.martinez@selina.com', 'aurys.cuentas@selina.com'],
    factura: {
      emisor: datosEmisores.venaoTipi,
    },
  },
}
