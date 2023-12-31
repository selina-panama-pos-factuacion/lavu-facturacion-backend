export default function getTemplate() {
  return {
    dNroDF: '0000000001', // Consecutivo de la factura, 10 digitos
    iTpEmis: '01',
    iDoc: '01', // Factura de operacion interna
    dPtoFacDF: '001', // ID del punto de venta.
    dFechaEm: '', // DATETIME con la fecha de emisión
    iNatOp: '01',
    iTipoOp: '1',
    iDest: '1',
    iFormCAFE: '1',
    iEntCAFE: '1',
    dEnvFE: '1',
    iProGen: '1',
    iTipoSuc: '1',
    iTipoTranVenta: '4',
    SecuencialERP: '123456', // Potencial lugar para la orden de Lavu
    Emisor: {
      dTipoRuc: '2',
      dRuc: '155631917-2-2016', // RUC Selina
      dDV: '42',
      dCodUbi: '1-1-1',
      dCorreg: 'BOCAS DEL TORO (CABECERA)',
      dDistr: 'BOCAS DEL TORO',
      dProv: 'BOCAS DEL TORO',
      dNombEm: 'FE generada en ambiente de pruebas - sin valor comercial ni fiscal',
      dSucEm: '0009',
      dCoordEm: '+9.1263,-79.5855',
      dDirecEm: 'CALLE PRIMERA, EDIFICIO TROPIKAL MARKET',
      dTfnEm1: '321-0350',
      dCorElectEmi1: 'facturacion.bocasdeltoro@selina.com',
    },
    Receptor: {
      iTipoRec: '02',
      dTipoRuc: '',
      dDV: '',
      dRuc: '',
      dCodUbi: '',
      dCorreg: '',
      dDistr: '',
      dProv: '',
      dNombRec: '',
      dDirecRec: '',
      dTfnRec1: '',
      dCorElectRec1: '',
      cPaisRec: 'PA',
      dIdExt: '',
      dPaisExt: '',
    },
    Detalle: [
      {
        dSecItem: '',
        dDescProd: 'SERVICIO DE RESTAURANTE',
        dCodProd: '5611', // Codigo de LAVU
        cUnidad: 'und',
        dCantCodInt: '1.000',
        dCodCPBScmp: '9010',
        DetPrecio: {
          dPrUnitDesc: '',
          dPrUnit: '100.23456',
          dPrItem: '100.23456',
          dValTotItem: '100.23456',
        },
        DetITBMS: {
          dTasaITBMS: '01',
          dValITBMS: '00.00',
        },
      },
    ],
    Total: {
      dTotNeto: '100.23456',
      dTotITBMS: '00.00',
      dTotGravado: '00.00',
      dVTot: '100.23456',
      dTotRec: '100.23456',
      iPzPag: '1',
      dNroItems: '1',
      dVTotItems: '100.23456',
      dTotDesc: '0',
    },
    FormaPago: [
      {
        iFormaPago: '03', // 02: Efectivo, 03: TC, 04: TD Preguntar a Yericel
        dVlrCuota: '100.23456', // Siempre igual al valor total
      },
    ],
  }
}
