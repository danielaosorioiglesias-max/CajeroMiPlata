// TarjetaCredito.js - HERENCIA: extiende Cuenta.
// POLIMORFISMO: redefine limiteRetiro(), retirar(), detalles(), _validarAbono() y las propiedades
// puedeEnviar / permiteCuotas, de modo que el cajero trata igual a todos los productos.
// En la tarjeta el "saldo" es el CUPO DISPONIBLE: cada compra lo reduce y cada pago de capital lo recupera.
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
    // Compras guardadas antes de este cambio no traen capital/interés pendiente.
    this.#compras = (compras ?? []).map((compra) => ({
      ...compra,
      capitalPendiente: compra.capitalPendiente ?? compra.monto,
      interesPendiente: compra.interesPendiente ?? 0
    }));
  }

  static desdeJSON(datos) {
    return new TarjetaCredito(datos.numero, datos.saldo, datos.movimientos, datos.cupo, datos.compras);
  }

  // ── Identidad y reglas del producto ───────────────────
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

  get compras() {
    return this.#compras.map((compra) => ({ ...compra }));
  }

  consultarCupo() {
    return this.saldo;
  }

  // ── Deuda ─────────────────────────────────────────────
  // Capital pendiente: lo que se ha usado del cupo.
  get deudaCapital() {
    return redondear(this.#cupo - this.saldo);
  }

  get interesesPendientes() {
    return redondear(this.#compras.reduce((suma, c) => suma + c.interesPendiente, 0));
  }

  // Interés que se causaría con el próximo pago (un ciclo sobre el capital pendiente).
  get interesDelCiclo() {
    return redondear(this.#compras.reduce((suma, c) => suma + this.#interesDe(c), 0));
  }

  // Lo máximo que se puede pagar hoy.
  get deudaTotal() {
    return redondear(this.deudaCapital + this.interesesPendientes + this.interesDelCiclo);
  }

  #interesDe(compra) {
    return compra.tasa > 0 ? redondear(compra.capitalPendiente * compra.tasa) : 0;
  }

  // ── Cálculo de cuotas ─────────────────────────────────
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

  // ── Compra: guarda el estado de cada compra ───────────
  comprar(monto, cuotas) {
    const simulacion = this.simularCompra(monto, cuotas);

    if (monto > this.saldo) {
      throw new OperacionError(`Cupo insuficiente. Tu cupo disponible es ${cop(this.saldo)}.`);
    }

    this._debitar(monto);
    this.#compras.push({
      ...simulacion,
      fecha: new Date().toISOString(),
      capitalPendiente: monto,
      interesPendiente: 0
    });
    this._registrar(
      "Compra",
      -monto,
      `${cuotas} cuota(s) de ${cop(simulacion.cuota)} · tasa ${(simulacion.tasa * 100).toFixed(1)}% mensual`
    );
    return simulacion;
  }

  // ── Pago: una sola rutina para todos los caminos ──────
  #aplicarPago(monto, tipo, detalle) {
    this._validarMonto(monto);
    this._validarAbono(monto);

    // 1) Causar el interés del ciclo (se calcula sobre el capital antes de pagar)
    for (const c of this.#compras) {
      c.interesPendiente = redondear(c.interesPendiente + this.#interesDe(c));
    }

    let restante = monto;
    let pagoIntereses = 0;
    let pagoCapital = 0;

    // 2) Primero intereses
    for (const c of this.#compras) {
      const x = Math.min(restante, c.interesPendiente);
      c.interesPendiente = redondear(c.interesPendiente - x);
      pagoIntereses = redondear(pagoIntereses + x);
      restante = redondear(restante - x);
    }

    // 3) La diferencia abona a capital (compra más antigua primero)
    for (const c of this.#compras) {
      const x = Math.min(restante, c.capitalPendiente);
      c.capitalPendiente = redondear(c.capitalPendiente - x);
      pagoCapital = redondear(pagoCapital + x);
      restante = redondear(restante - x);
    }

    // 4) Solo el capital recupera el cupo
    if (pagoCapital > 0) {
      this._acreditar(pagoCapital);
    }

    this._registrar(
      tipo,
      monto,
      `${detalle} · Intereses ${cop(pagoIntereses)} · Capital ${cop(pagoCapital)}`
    );

    return { pagado: monto, intereses: pagoIntereses, capital: pagoCapital, saldo: this.saldo };
  }

  pagar(monto) {
    return this.#aplicarPago(monto, this._tipoAbono, this._detalleAbono);
  }

  // Mantiene el contrato de Cuenta (devuelve el saldo) pero con la lógica nueva.
  consignar(monto) {
    this.#aplicarPago(monto, this._tipoAbono, this._detalleAbono);
    return this.saldo;
  }

  recibirTransferencia(monto, origen) {
    this.#aplicarPago(monto, "Transferencia", `Recibida de ${origen}`);
  }

  // ── Polimorfismo: reglas propias de la tarjeta ────────
  limiteRetiro() {
    return Math.max(this.saldo, 0);
  }

  retirar() {
    throw new OperacionError("La tarjeta de crédito no permite retiros. Usa la opción de compra a cuotas.");
  }

  _validarAbono(monto) {
    if (this.deudaTotal <= 0) {
      throw new OperacionError("La tarjeta no tiene deuda pendiente.");
    }
    if (monto > this.deudaTotal) {
      throw new OperacionError(`El pago no puede superar la deuda actual de ${cop(this.deudaTotal)}.`);
    }
  }

  detalles() {
    const filas = [
      ["Cupo total", this.#cupo],
      ["Deuda de capital", this.deudaCapital],
      ["Intereses a pagar", redondear(this.interesesPendientes + this.interesDelCiclo)],
      ["Total a pagar hoy", this.deudaTotal],
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