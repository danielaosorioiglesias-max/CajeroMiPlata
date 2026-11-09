//CuentaCorriente.js - HERENCIA: extiende Cuenta.
class CuentaCorriente extends Cuenta {
  static PREFIJO = "CC";
  static TITULO = "Cuenta Corriente";
  static ETIQUETA = "Sobregiro 20%";
  static DESCRIPCION = "Para tu día a día: recibe tu nómina, paga facturas y haz transferencias.";
  static REGLA = "Puedes retirar hasta un 20% adicional sobre tu saldo actual (sobregiro). No genera intereses.";
  static SOBREGIRO = 0.20;

  get clave() { return "corriente"; }
  get tipo() { return CuentaCorriente.TITULO; }
  get regla() { return CuentaCorriente.REGLA; }

  // Con $1.000.000 de saldo el límite es $1.200.000. Con saldo <= 0 ya no queda cupo de sobregiro.
  limiteRetiro() {
    return this.saldo > 0 ? redondear(this.saldo * (1 + CuentaCorriente.SOBREGIRO)) : 0;
  }

  detalles() {
    const filas = [["Límite de retiro (con sobregiro del 20%)", this.limiteRetiro()]];
    if (this.saldo < 0) filas.push(["Estado", "Sobregiro en uso: consigna para regularizar"]);
    return filas;
  }
}
