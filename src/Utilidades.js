// Utilidades.js - Funciones y clases de apoyo compartidas por todos los módulos del cajero.

// Error de negocio: su mensaje se muestra tal cual al usuario.
class OperacionError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "OperacionError";
  }
}

// Redondea a 2 decimales (centavos).
function redondear(numero) {
  return Math.round((numero + Number.EPSILON) * 100) / 100;
}

const formatoPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

// Formatea un número como pesos colombianos.
function cop(numero) {
  return formatoPesos.format(numero);
}

// Escapa texto antes de insertarlo como HTML.
function esc(texto) {
  const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto).replace(/[&<>"']/g, (caracter) => reemplazos[caracter]);
}

function el(id) {
  return document.getElementById(id);
}

function q(selector) {
  return document.querySelector(selector);
}

// Convierte el valor de un input a número (vacío => NaN para que falle la validación).
function aNumero(valor) {
  const texto = String(valor ?? "").trim();
  return texto === "" ? NaN : Number(texto);
}

// Mensajes de retroalimentación (éxito, error, advertencia).
const Alerta = {
  mostrar(texto, tipo) {
    el("mensaje-texto").textContent = texto;
    el("mensaje-feedback").className = `alerta alerta--${tipo}`;
  },
  exito(texto) { this.mostrar(texto, "exito"); },
  error(texto) { this.mostrar(texto, "error"); },
  advertencia(texto) { this.mostrar(texto, "advertencia"); }
};

// Ejecuta una operación y muestra el error al usuario si algo falla.
function ejecutar(operacion) {
  try {
    operacion();
  } catch (error) {
    if (error instanceof OperacionError) {
      Alerta.error(error.message);
    } else {
      console.error(error);
      Alerta.error("Ocurrió un error inesperado. Intenta de nuevo.");
    }
  }
}
