// Perfil.js - Muestra los datos del cliente en "Perfil y Seguridad".
// Identificación, usuario y celular son de solo lectura; el nombre completo se puede editar.
const Perfil = {
  CLAVE_USUARIOS: "usuariosBanco",

  iniciar() {
    el("form-editar-perfil").addEventListener("submit", (evento) => {
      evento.preventDefault();
      ejecutar(() => this.guardarNombre());
    });
  },

  // Se llama desde Cajero.refrescar() al abrir la sesión: llena los campos con lo que registró el cliente.
  renderizar() {
    const cliente = Cajero.cliente;
    if (!cliente) return;

    el("perfil-id").value = cliente.identificacion;
    el("perfil-nombre").value = `${cliente.nombres} ${cliente.apellidos}`;
    el("perfil-celular").value = cliente.celular;
    el("perfil-usuario").value = cliente.usuario;
  },

  // Solo se edita el nombre. Se conserva cuántas palabras tenían los apellidos para separar nombres y apellidos.
  guardarNombre() {
    const cliente = Cajero.cliente;
    if (!cliente) return;

    const palabras = el("perfil-nombre").value.trim().split(/\s+/).filter(Boolean);
    const cantidadApellidos = Math.max(1, cliente.apellidos.split(/\s+/).length);

    if (palabras.length <= cantidadApellidos) {
      throw new OperacionError("Escribe tu nombre completo: nombres y apellidos.");
    }

    const nombres = palabras.slice(0, palabras.length - cantidadApellidos).join(" ");
    const apellidos = palabras.slice(palabras.length - cantidadApellidos).join(" ");

    const usuarios = JSON.parse(localStorage.getItem(this.CLAVE_USUARIOS) || "[]");
    const registro = usuarios.find((usuario) => usuario.id === cliente.id);
    if (!registro) throw new OperacionError("No se encontró tu usuario. Inicia sesión de nuevo.");

    registro.nombres = nombres;
    registro.apellidos = apellidos;
    localStorage.setItem(this.CLAVE_USUARIOS, JSON.stringify(usuarios));

    cliente.nombres = nombres;
    cliente.apellidos = apellidos;
    el("cajero-nombre-cliente").textContent = `${cliente.nombres} ${cliente.apellidos}`;
    this.renderizar();

    Alerta.exito("Datos actualizados correctamente.");
  }
};
Cajero.registrar(Perfil);