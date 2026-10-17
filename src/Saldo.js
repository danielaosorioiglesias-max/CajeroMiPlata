//Saldo.js - Consultar saldo del producto activo.
const Saldo = {
  renderizar() {
    const p = Cajero.producto;
    if (!p) return;

    el("saldo-tipo-cuenta").textContent = `Resumen de ${p.tipo}`;
    el("saldo-numero-cuenta").textContent = `N.° de producto: ${p.numero}`;
    q("#panel-saldo .saldo-display__label").textContent = p.etiquetaSaldo;

    const visor = el("visor-saldo-principal");
    visor.textContent = cop(p.consultarSaldo());
    visor.style.color = p.saldo < 0 ? "var(--color-danger)" : "";

    // La regla y los datos extra cambian según el producto (polimorfismo: p.regla y p.detalles()).
    const filas = [["Regla del producto", p.regla], ...p.detalles()];
    el("detalles-adicionales-cuenta").innerHTML = filas.map(([etiqueta, valor]) => `
      <div class="detalle-item">
        <span>${esc(etiqueta)}:</span>
        <strong>${esc(typeof valor === "number" ? cop(valor) : valor)}</strong>
      </div>`).join("");
  }
};
Cajero.registrar(Saldo);