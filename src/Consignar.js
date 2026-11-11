//consignar.js - Consignar dinero (en la tarjeta de crédito funciona como pago de la deuda).
const Consignar = {
  iniciar() {
    document.getElementById("form-consignar").addEventListener("submit", evento => {
      evento.preventDefault();
      this.enviar();
    });
  },

  renderizar() {
    const productoSeleccionado = Cajero.producto;
    if (!productoSeleccionado) return;

    const esTarjetaCredito = productoSeleccionado.permiteCuotas;
    document.querySelector("#panel-consignar .card__header h3").textContent =
      esTarjetaCredito ? "Pagar tarjeta de crédito" : "Consignar dinero";
    document.querySelector("#panel-consignar .card__header p").textContent = esTarjetaCredito
      ? "Abona a tu deuda. El pago no puede superar lo que debes y recupera tu cupo disponible."
      : "Ingresa un monto positivo mayor a cero para acreditarlo en tu producto seleccionado.";
    document.querySelector("label[for=input-monto-consignar]").textContent =
      esTarjetaCredito ? "Monto a pagar ($)" : "Monto a consignar ($)";
    document.querySelector("#form-consignar button[type=submit]").textContent =
      esTarjetaCredito ? "Realizar pago" : "Realizar consignación";
  },

  enviar() {
    ejecutar(() => {
      const productoSeleccionado = Cajero.producto;
      const montoIngresado = aNumero(document.getElementById("input-monto-consignar").value);
      const nuevoSaldo = productoSeleccionado.consignar(montoIngresado);
      Banco.guardar();
      document.getElementById("form-consignar").reset();
      Cajero.refrescar();
      Alerta.exito(productoSeleccionado.permiteCuotas
        ? `Pago de ${cop(montoIngresado)} registrado. Cupo disponible: ${cop(nuevoSaldo)}.`
        : `Consignación de ${cop(montoIngresado)} exitosa. Nuevo saldo: ${cop(nuevoSaldo)}.`);
    });
  }
};
Cajero.registrar(Consignar);