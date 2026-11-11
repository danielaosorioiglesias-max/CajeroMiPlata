// Cajero.js - Coordina el panel de transacciones: cliente, producto activo y módulos (Saldo, Consignar, ...).
const Cajero = {
  modulos: [],
  cliente: null,
  producto: null,

  // Cada módulo se registra aquí; iniciar() conecta sus eventos y renderizar() actualiza su vista.
  registrar(modulo) {
    this.modulos.push(modulo);
    modulo.iniciar?.();
  },

  get productos() {
    return this.cliente ? this.cliente.productos : [];
  },

  // Se llama después de un inicio de sesión exitoso.
  abrir(cliente) {
    this.cliente = cliente;
    this.producto = cliente.productos[0];

    el("cajero-nombre-cliente").textContent = `${cliente.nombres} ${cliente.apellidos}`;
    el("cajero-id-cliente").textContent = `ID: ${cliente.identificacion}`;

    const selector = el("select-producto-activo");
    selector.replaceChildren(...cliente.productos.map(
      (producto) => new Option(`${producto.tipo} · ${producto.numero}`, producto.numero)
    ));

    this.refrescar();
  },

  cerrar() {
    this.cliente = null;
    this.producto = null;
  },

  seleccionar(numero) {
    this.producto = this.productos.find((producto) => producto.numero === numero) ?? this.producto;
    this.refrescar();
  },

  refrescar() {
    if (!this.producto) return;
    this.modulos.forEach((modulo) => modulo.renderizar?.());
  }
};

el("select-producto-activo").addEventListener("change", (evento) => Cajero.seleccionar(evento.target.value));
