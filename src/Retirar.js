//retirar.js - Retirar dinero (Ahorros y Corriente) o comprar a cuotas (Tarjeta de crédito).
 
const Retirar = {
  iniciar() {
    document.getElementById("form-retirar").addEventListener("submit", evento => {
      evento.preventDefault();
      this.enviar();
    });
    ["input-monto-retirar", "input-cuotas-tc"].forEach(idCampo =>
      document.getElementById(idCampo).addEventListener("input", () => this.simular()));
  },

  renderizar() {
    const productoSeleccionado = Cajero.producto;
    if (!productoSeleccionado) return;

    const permiteCuotas = productoSeleccionado.permiteCuotas;
    document.getElementById("grupo-cuotas-tc").classList.toggle("oculto", !permiteCuotas);
    document.querySelector("#panel-retirar .card__header h3").textContent =
      permiteCuotas ? "Comprar a cuotas con tu tarjeta" : "Retirar dinero";
    document.getElementById("texto-regla-retiro").textContent = productoSeleccionado.regla;
    document.querySelector("label[for=input-monto-retirar]").textContent =
      permiteCuotas ? "Valor de la compra ($)" : "Monto del retiro ($)";
    document.querySelector("#form-retirar button[type=submit]").textContent =
      permiteCuotas ? "Confirmar compra" : "Confirmar retiro";
    this.simular();
  },

  _mostrarResultado(contenidoHtml) {
    document.getElementById("texto-resultado-retiro").innerHTML = contenidoHtml;
    document.getElementById("resultado-operacion-retiro").classList.remove("oculto");
  },

  _ocultarResultado() {
    document.getElementById("resultado-operacion-retiro").classList.add("oculto");
  },

  /** Vista previa sin modificar nada. */
  simular() {
    const productoSeleccionado = Cajero.producto;
    const montoIngresado = aNumero(document.getElementById("input-monto-retirar").value);
    if (!productoSeleccionado || !(montoIngresado > 0)) return this._ocultarResultado();

    if (productoSeleccionado.permiteCuotas) {
      const numeroCuotas = Number(document.getElementById("input-cuotas-tc").value);
      if (!Number.isInteger(numeroCuotas) || numeroCuotas < 1 || numeroCuotas > TarjetaCredito.MAX_CUOTAS) {
        return this._ocultarResultado();
      }

      const simulacionCompra = productoSeleccionado.simularCompra(montoIngresado, numeroCuotas);
      this._mostrarResultado(`Pago mensual: <strong>${cop(simulacionCompra.cuota)}</strong> durante ${numeroCuotas} mes(es). `
        + `Tasa: ${(simulacionCompra.tasa * 100).toFixed(1)}% mensual. Total a pagar: ${cop(simulacionCompra.total)} `
        + `(intereses: ${cop(simulacionCompra.intereses)}).`);
    } else {
      const resultadoRetiro = productoSeleccionado.calcularRetiro(montoIngresado);
      if (montoIngresado > resultadoRetiro.limite) {
        this._mostrarResultado(`El monto supera lo que puedes retirar hoy: <strong>${cop(resultadoRetiro.limite)}</strong>.`);
      } else {
        const mensajeRendimiento = resultadoRetiro.interes > 0
          ? `Se abonará un rendimiento de ${cop(resultadoRetiro.interes)}. `
          : "";
        this._mostrarResultado(`${mensajeRendimiento}Saldo después del retiro: `
          + `<strong>${cop(resultadoRetiro.saldoFinal)}</strong>.`);
      }
    }
  },

  enviar() {
    ejecutar(() => {
      const productoSeleccionado = Cajero.producto;
      const montoIngresado = aNumero(document.getElementById("input-monto-retirar").value);

      if (productoSeleccionado.permiteCuotas) {
        const numeroCuotas = Number(document.getElementById("input-cuotas-tc").value);
        const resultadoCompra = productoSeleccionado.comprar(montoIngresado, numeroCuotas);
        Banco.guardar();
        document.getElementById("form-retirar").reset();
        Cajero.refrescar();
        this._mostrarResultado(`Compra registrada. Pago mensual: <strong>${cop(resultadoCompra.cuota)}</strong> `
          + `durante ${numeroCuotas} mes(es) (tasa ${(resultadoCompra.tasa * 100).toFixed(1)}% mensual, `
          + `total ${cop(resultadoCompra.total)}).`);
        Alerta.exito(`Compra de ${cop(montoIngresado)} aprobada. Pagarás ${numeroCuotas} cuota(s) mensual(es) `
          + `de ${cop(resultadoCompra.cuota)}. Cupo disponible: ${cop(productoSeleccionado.saldo)}.`);
      } else {
        const { interes } = productoSeleccionado.calcularRetiro(montoIngresado);
        const nuevoSaldo = productoSeleccionado.retirar(montoIngresado);
        Banco.guardar();
        document.getElementById("form-retirar").reset();
        Cajero.refrescar();
        const mensajeRendimiento = interes > 0 ? ` Se abonó un rendimiento de ${cop(interes)}.` : "";
        Alerta.exito(`Retiro de ${cop(montoIngresado)} exitoso.${mensajeRendimiento} Nuevo saldo: ${cop(nuevoSaldo)}.`);
      }
    });
  }
};
Cajero.registrar(Retirar);