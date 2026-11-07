// CuentaAhorros.js - HERENCIA: extiende Cuenta.
class CuentaAhorros extends Cuenta {
  static PREFIJO = "AH";
  static TITULO = "Cuenta de Ahorros";
  static ETIQUETA = "1.5% mensual";
  static DESCRIPCION = "Guarda tu dinero a mediano y largo plazo y recibe rendimientos.";
  static REGLA = "Al retirar se abona un rendimiento del 1.5% sobre tu saldo y luego se descuenta el retiro. No puedes retirar más que tu saldo.";
  static TASA_MENSUAL = 0.015;

  get clave() { return "ahorros"; }
  get tipo() { return CuentaAhorros.TITULO; }
  get regla() { return CuentaAhorros.REGLA; }

  // Interpretación acordada: el rendimiento es 1.5% del saldo, se calcula y se abona al retirar.
  calcularInteres() { return redondear(this.saldo * CuentaAhorros.TASA_MENSUAL); }

  detalles() {
    return [
      ["Tasa de interés mensual", "1.5% (se abona al retirar)"],
      ["Disponible para retiro", this.limiteRetiro()]
    ];
  }
}
