// TarjetaCredito.js - HERENCIA: extiende Cuenta.
// POLIMORFISMO: redefine limiteRetiro(), retirar(), detalles(), _validarAbono() y las propiedades
// puedeEnviar / permiteCuotas, de modo que el cajero trata igual a todos los productos.
// En la tarjeta el "saldo" es el CUPO DISPONIBLE: cada compra lo reduce y cada pago lo recupera.
class TarjetaCredito extends Cuenta {
  static PREFIJO = "TC";
  static TITULO = "Tarjeta de Crédito Ultra Plata";
  static ETIQUETA = "0% a 2 cuotas";
  static DESCRIPCION = "Financia tus compras a cuotas con tu cupo preaprobado.";
  static REGLA = "Compras a cuotas: hasta 2 cuotas sin interés, de 3 a 6 cuotas 1.9% mensual y de 7 cuotas en adelante 2.3% mensual.";
  static CUPO_INICIAL = 5000000;
  static MAX_CUOTAS = 36;

  // Tabla de tasas mensuales según el número de cuotas.
  static TASAS = [
    { hasta: 2, tasa: 0 },
    { hasta: 6, tasa: 0.019 },
    { hasta: Infinity, tasa: 0.023 }
  ];

  #cupo;
  #compras;

  constructor(numero, saldo = TarjetaCredito.CUPO_INICIAL, movimientos = [], cupo = TarjetaCredito.CUPO_INICIAL, compras = []) {
    super(numero, saldo, movimientos);
    this.#cupo = cupo;
    this.#compras = (compras ?? []).map((compra) => ({ ...compra }));
  }

  static desdeJSON(datos) {
    return new TarjetaCredito(datos.numero, datos.saldo, datos.movimientos, datos.cupo, datos.compras);
  }

  get clave() { return "credito"; }
  get tipo() { return TarjetaCredito.TITULO; }
  get regla() { return TarjetaCredito.REGLA; }
  get etiquetaSaldo() { return "Cupo disponible"; }
  get puedeEnviar() { return false; }
  get permiteCuotas() { return true; }
  get _tipoAbono() { return "Pago tarjeta"; }
  get _detalleAbono() { return "Abono a la deuda de la tarjeta"; }

  get cupo() {
    return this.#cupo;
  }

  // Deuda de capital pendiente: lo que se ha usado del cupo.
  get deuda() {
    return redondear(this.#cupo - this.saldo);
  }

  get compras() {
    return this.#compras.map((compra) => ({ ...compra }));
  }

  consultarCupo() {
    return this.saldo;
  }

  static calcularTasaInteres(cuotas) {
    if (!Number.isInteger(cuotas) || cuotas < 1 || cuotas > TarjetaCredito.MAX_CUOTAS) {
      throw new OperacionError(`El número de cuotas debe ser un entero entre 1 y ${TarjetaCredito.MAX_CUOTAS}.`);
    }

    return TarjetaCredito.TASAS.find((rango) => cuotas <= rango.hasta).tasa;
  }

  // Cuota mensual = (Capital × tasa) / (1 − (1 + tasa)^(−n)). Sin interés: Capital / n.
  static calcularCuota(capital, cuotas) {
    const tasa = TarjetaCredito.calcularTasaInteres(cuotas);

    if (tasa === 0) {
      return redondear(capital / cuotas);
    }

    return redondear((capital * tasa) / (1 - Math.pow(1 + tasa, -cuotas)));
  }

  /** Vista previa de una compra sin modificar la tarjeta. */
  simularCompra(monto, cuotas) {
    this._validarMonto(monto);
    const tasa = TarjetaCredito.calcularTasaInteres(cuotas);
    const cuota = TarjetaCredito.calcularCuota(monto, cuotas);
    const total = tasa === 0 ? monto : redondear(cuota * cuotas);

    return {
      monto,
      cuotas,
      tasa,
      cuota,
      total,
      intereses: redondear(total - monto)
    };
  }

  comprar(monto, cuotas) {
    const simulacion = this.simularCompra(monto, cuotas);

    if (monto > this.saldo) {
      throw new OperacionError(`Cupo insuficiente. Tu cupo disponible es ${cop(this.saldo)}.`);
    }

    this._debitar(monto);
    this.#compras.push({ ...simulacion, fecha: new Date().toISOString() });
    this._registrar(
      "Compra",
      -monto,
      `${cuotas} cuota(s) de ${cop(simulacion.cuota)} · tasa ${(simulacion.tasa * 100).toFixed(1)}% mensual`
    );
    return simulacion;
  }

  // Pagar la tarjeta es abonar a la deuda (reutiliza consignar de Cuenta).
  pagar(monto) {
    return this.consignar(monto);
  }

  limiteRetiro() {
    return Math.max(this.saldo, 0);
  }

  retirar() {
    throw new OperacionError("La tarjeta de crédito no permite retiros. Usa la opción de compra a cuotas.");
  }

  _validarAbono(monto) {
    if (this.deuda <= 0) {
      throw new OperacionError("La tarjeta no tiene deuda pendiente.");
    }
    if (monto > this.deuda) {
      throw new OperacionError(`El pago no puede superar la deuda actual de ${cop(this.deuda)}.`);
    }
  }

  detalles() {
    const filas = [
      ["Cupo total", this.#cupo],
      ["Deuda actual", this.deuda],
      ["Tasas", "≤ 2 cuotas: 0% | 3-6 cuotas: 1.9% | ≥ 7 cuotas: 2.3% mensual"]
    ];

    const ultima = this.#compras.at(-1);
    if (ultima) {
      filas.push(["Pago mensual última compra", `${cop(ultima.cuota)} × ${ultima.cuotas} cuota(s)`]);
    }
    return filas;
  }

  _extraJSON() {
    return {
      cupo: this.#cupo,
      compras: this.#compras
    };
  }
}
