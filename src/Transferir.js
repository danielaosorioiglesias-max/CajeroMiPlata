// Transferir.js - Transferencias entre productos propios y hacia productos de otros clientes.
// La regla de "no transferir al mismo producto" y los límites los aplica Cuenta.enviarTransferencia().
const Transferir = {
  iniciar() {
    el("form-transferir").addEventListener("submit", (evento) => {
      evento.preventDefault();
      this.enviar();
    });
    el("select-tipo-transferencia").addEventListener("change", () => this._mostrarGrupoDestino());
  },

  renderizar() {
    el("select-producto-destino").replaceChildren(...Cajero.productos.map(
      (producto) => new Option(`${producto.tipo} · ${producto.numero}`, producto.numero)
    ));
    this._mostrarGrupoDestino();
  },

  _mostrarGrupoDestino() {
    const esPropia = el("select-tipo-transferencia").value === "propia";
    el("grupo-destino-propio").classList.toggle("oculto", !esPropia);
    el("grupo-destino-tercero").classList.toggle("oculto", esPropia);
  },

  _buscarDestino() {
    if (el("select-tipo-transferencia").value === "propia") {
      const numero = el("select-producto-destino").value;
      return Cajero.productos.find((producto) => producto.numero === numero);
    }

    const destinatario = Banco.buscarUsuario(el("input-usuario-destino").value);
    if (!destinatario) {
      throw new OperacionError("El usuario destinatario no existe.");
    }
    if (destinatario.id === Cajero.cliente.id) {
      throw new OperacionError("Para mover dinero entre tus productos elige \"Entre mis productos bancarios\".");
    }

    const clave = el("select-tipo-cuenta-tercero").value;
    return Banco.productosDe(destinatario.id).find((producto) => producto.clave === clave);
  },

  enviar() {
    ejecutar(() => {
      const origen = Cajero.producto;
      const monto = aNumero(el("input-monto-transferir").value);
      const destino = this._buscarDestino();

      origen.enviarTransferencia(monto, destino);
      Banco.guardar();
      el("form-transferir").reset();
      Cajero.refrescar();
      Alerta.exito(`Transferencia de ${cop(monto)} enviada a ${destino.numero}. Nuevo saldo: ${cop(origen.saldo)}.`);
    });
  }
};
Cajero.registrar(Transferir);
