// Movimientos.js - Historial del producto activo, ordenado por fecha descendente.
const Movimientos = {
  renderizar() {
    const movimientos = Cajero.producto.movimientos;

    if (movimientos.length === 0) {
      el("tabla-movimientos-body").innerHTML = `
        <tr><td colspan="3" class="text-center">Aún no se registran movimientos en este producto.</td></tr>`;
      return;
    }

    el("tabla-movimientos-body").innerHTML = movimientos.map((movimiento) => `
      <tr>
        <td>${esc(movimiento.fecha.toLocaleString("es-CO"))}</td>
        <td>${esc(movimiento.tipo)}<br><small class="text-muted">${esc(movimiento.detalle)}</small></td>
        <td style="color: ${movimiento.valor < 0 ? "var(--color-danger)" : "var(--color-success)"}">${esc(cop(movimiento.valor))}</td>
      </tr>`).join("");
  }
};
Cajero.registrar(Movimientos);
