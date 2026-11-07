// Cuenta.js - Clase base ABSTRACTA de los productos bancarios.
class Cuenta {
  #numero;
  #saldo;
  #movimientos;

  constructor(numero, saldo = 0, movimientos = []) {
    if (new.target === Cuenta) {
      throw new TypeError("Cuenta es una clase abstracta: use una subclase.");
    }

    this.#numero = numero;
    this.#saldo = saldo;
    this.#movimientos = (movimientos ?? []).map((movimiento) => {
      if (movimiento instanceof Movimiento) {
        return movimiento;
      }

      return new Movimiento(
        movimiento.tipo,
        movimiento.valor,
        movimiento.detalle,
        movimiento.fecha
      );
    });
  }

  static desdeJSON(datos) {
    return new this(datos.numero, datos.saldo, datos.movimientos);
  }

  get numero() {
    return this.#numero;
  }

  get saldo() {
    return this.#saldo;
  }

  get movimientos() {
    return [...this.#movimientos].reverse().sort((a, b) => b.fecha - a.fecha);
  }

  get clave() {
    throw new Error("La subclase debe definir 'clave'.");
  }

  get tipo() {
    throw new Error("La subclase debe definir 'tipo'.");
  }

  get regla() {
    throw new Error("La subclase debe definir 'regla'.");
  }

  get etiquetaSaldo() {
    return "Saldo actual";
  }

  get puedeEnviar() {
    return true;
  }

  get permiteCuotas() {
    return false;
  }

  get _tipoAbono() {
    return "Consignación";
  }

  get _detalleAbono() {
    return "Depósito en cajero";
  }

  limiteRetiro() {
    return Math.max(this.#saldo, 0);
  }

  calcularInteres() {
    return 0;
  }

  detalles() {
    return [];
  }

  consultarSaldo() {
    return this.#saldo;
  }

  consignar(monto) {
    this._validarMonto(monto);
    this._validarAbono(monto);
    this._acreditar(monto);
    this._registrar(this._tipoAbono, monto, this._detalleAbono);
    return this.#saldo;
  }

  calcularRetiro(monto) {
    const interes = this.calcularInteres();
    return {
      interes,
      saldoFinal: redondear(this.#saldo + interes - monto),
      limite: this.limiteRetiro()
    };
  }

  retirar(monto) {
    this._validarMonto(monto);
    const limite = this.limiteRetiro();
    if (monto > limite) {
      throw new OperacionError(`Fondos insuficientes. Puede retirar hasta ${cop(limite)}.`);
    }

    const { interes } = this.calcularRetiro(monto);
    if (interes > 0) {
      this._acreditar(interes);
      this._registrar("Rendimiento", interes, "Interés mensual abonado al retirar");
    }
    this._debitar(monto);
    this._registrar("Retiro", -monto, "Retiro en cajero");
    return this.#saldo;
  }

  enviarTransferencia(monto, destino) {
    this._validarMonto(monto);
    if (!this.puedeEnviar) {
      throw new OperacionError(`${this.tipo} no permite enviar transferencias.`);
    }
    if (destino.numero === this.#numero) {
      throw new OperacionError("No se permite transferir al mismo producto.");
    }

    const limite = this.limiteRetiro();
    if (monto > limite) {
      throw new OperacionError(`Fondos insuficientes. Puede transferir hasta ${cop(limite)}.`);
    }

    destino._validarAbono(monto);
    this._debitar(monto);
    this._registrar("Transferencia", -monto, `Enviada a ${destino.numero}`);
    destino.recibirTransferencia(monto, this.#numero);
  }

  recibirTransferencia(monto, origen) {
    this._validarAbono(monto);
    this._acreditar(monto);
    this._registrar("Transferencia", monto, `Recibida de ${origen}`);
  }

  _validarMonto(m) {
    if (typeof m !== "number" || !Number.isFinite(m) || m <= 0) {
      throw new OperacionError("El monto debe ser un número positivo mayor a cero.");
    }
    if (redondear(m) !== m) {
      throw new OperacionError("El monto admite máximo dos decimales.");
    }
  }

  _validarAbono(m) {
    // Las subclases pueden agregar sus propias reglas.
  }

  _acreditar(m) {
    this.#saldo = redondear(this.#saldo + m);
  }

  _debitar(m) {
    this.#saldo = redondear(this.#saldo - m);
  }

  _registrar(tipo, valor, detalle) {
    this.#movimientos.push(new Movimiento(tipo, valor, detalle));
  }

  _extraJSON() {
    return {};
  }

  toJSON() {
    return {
      clave: this.clave,
      numero: this.#numero,
      saldo: this.#saldo,
      movimientos: this.#movimientos,
      ...this._extraJSON()
    };
  }
}