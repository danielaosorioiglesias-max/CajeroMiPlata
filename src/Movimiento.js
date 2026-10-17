// Movimiento.js - Registro de una transacción (fecha y hora, tipo, valor y detalle).
class Movimiento {
  #fecha;
  #tipo;
  #valor;
  #detalle;

  constructor(tipo, valor, detalle = "", fecha = new Date()) {
    this.#tipo = tipo;
    this.#valor = valor;
    this.#detalle = detalle;
    this.#fecha = new Date(fecha);
  }

  get fecha() { return this.#fecha; }
  get tipo() { return this.#tipo; }
  get valor() { return this.#valor; }
  get detalle() { return this.#detalle; }

  toJSON() {
    return {
      fecha: this.#fecha.toISOString(),
      tipo: this.#tipo,
      valor: this.#valor,
      detalle: this.#detalle
    };
  }
}
