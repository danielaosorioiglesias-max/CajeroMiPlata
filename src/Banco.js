// Banco.js - Guarda y recupera los productos de cada cliente en localStorage.
const Banco = {
  CLAVE_PRODUCTOS: "productosBanco",
  CLAVE_USUARIOS: "usuariosBanco",

  // Clase de cada producto según su clave (polimorfismo al reconstruir desde JSON).
  CLASES: {
    ahorros: CuentaAhorros,
    corriente: CuentaCorriente,
    credito: TarjetaCredito
  },

  // { idUsuario: [CuentaAhorros, CuentaCorriente, TarjetaCredito] }
  productos: {},

  cargar() {
    const datos = JSON.parse(localStorage.getItem(this.CLAVE_PRODUCTOS) || "{}");
    this.productos = {};
    for (const [idUsuario, lista] of Object.entries(datos)) {
      this.productos[idUsuario] = lista.map((producto) => this.CLASES[producto.clave].desdeJSON(producto));
    }
  },

  guardar() {
    localStorage.setItem(this.CLAVE_PRODUCTOS, JSON.stringify(this.productos));
  },

  // Productos del cliente. Si aún no tiene, se le abren los tres productos del banco.
  productosDe(idUsuario) {
    if (!this.productos[idUsuario]) {
      this.productos[idUsuario] = Object.values(this.CLASES).map(
        (Clase) => new Clase(this.generarNumero(Clase.PREFIJO))
      );
      this.guardar();
    }
    return this.productos[idUsuario];
  },

  generarNumero(prefijo) {
    const existentes = Object.values(this.productos).flat().map((producto) => producto.numero);
    let numero;
    do {
      numero = `${prefijo}-${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;
    } while (existentes.includes(numero));
    return numero;
  },

  // Busca un cliente registrado por nombre de usuario o por identificación.
  buscarUsuario(texto) {
    const buscado = String(texto ?? "").trim().toLowerCase();
    const usuarios = JSON.parse(localStorage.getItem(this.CLAVE_USUARIOS) || "[]");
    return usuarios.find((usuario) => usuario.usuario === buscado || usuario.identificacion === buscado) ?? null;
  }
};
