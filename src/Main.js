//Función para cambiar de opciones
function cambiarVista(idVistaDestino,idBotonActivo){
    const todasLasVistas = document.querySelectorAll('.vista');
    todasLasVistas.forEach(vista=>{
        vista.classList.add('oculto');
    });
    document.getElementById(idVistaDestino).classList.remove('oculto');

    const todosLosBotones = document.querySelectorAll('.nav-link');
    todosLosBotones.forEach(boton=>{
        boton.classList.remove('active');
    });
    if(idBotonActivo){
        document.getElementById(idBotonActivo).classList.add('active');
    }
    
}

//Evento dar clic para iniciar función de cambiar vista: Inicio | Iniciar sesión | Registrarse | Admin Usuarios
document.getElementById('btn-nav-registro').addEventListener('click',()=>{
    cambiarVista('vista-registro','btn-nav-registro');
});

document.getElementById('btn-nav-login').addEventListener('click',()=>{
    cambiarVista('vista-login','btn-nav-login');
});

document.getElementById('btn-nav-crud').addEventListener('click',()=>{
    cambiarVista('vista-crud','btn-nav-crud');
});

document.getElementById('btn-nav-inicio').addEventListener('click',()=>{
    cambiarVista('vista-inicio','btn-nav-inicio');
});

//Acceder a Iniciar sesión o registrarse desde los botones de registro
document.getElementById('btn-hero-registro').addEventListener('click',()=>{
    cambiarVista('vista-registro','btn-nav-registro')
})

document.getElementById('btn-hero-login').addEventListener('click',()=>{
    cambiarVista('vista-login','btn-nav-login')
})

// La vista del cajero la abre Iniciosesion.js solo cuando las credenciales son válidas

// Botón para cerrar los mensajes de retroalimentación
document.getElementById('btn-cerrar-alerta').addEventListener('click',()=>{
    document.getElementById('mensaje-feedback').classList.add('oculto');
})

//Función para cambiar el modo claro u oscuro
const btnToggleTheme = document.getElementById('btn-toggle-theme');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const htmlElement = document.documentElement;

// --- NUEVO: Al cargar la página, revisar si hay un tema guardado ---
const temaGuardado = localStorage.getItem('temaBancario');
if (temaGuardado === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '☀️';
    themeText.textContent = 'Claro';
}

// Evento clic
btnToggleTheme.addEventListener('click', () => {
    const temaActual = htmlElement.getAttribute('data-theme');

    if (temaActual === 'light') {
        htmlElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Claro';
        localStorage.setItem('temaBancario', 'dark'); // Guarda en memoria
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Oscuro';
        localStorage.setItem('temaBancario', 'light'); // Guarda en memoria
    }
});


// 1. Capturar todos los botones del menú del cajero y los subpaneles
const botonesCajero = document.querySelectorAll('.cajero-menu .btn-menu');
const subpaneles = document.querySelectorAll('.subpanel');

// 2. Recorrer cada botón para asignarle el evento clic
botonesCajero.forEach(boton => {
    boton.addEventListener('click', function() {
        
        // Excepción: Si el botón presionado es el de cerrar sesión, no buscamos paneles
        if (this.id === 'btn-cerrar-sesion') {
            // Aquí luego pondrás tu lógica para cerrar sesión
            cambiarVista('vista-inicio', 'btn-nav-inicio'); 
            return; 
        }

        // A. Ocultar todos los subpaneles agregando la clase 'oculto'
        subpaneles.forEach(panel => {
            panel.classList.add('oculto');
        });

        // B. Quitar la clase 'active' de todos los botones del menú lateral
        botonesCajero.forEach(btn => {
            btn.classList.remove('active');
        });

        // C. Marcar como activo el botón que se acaba de presionar
        this.classList.add('active');

        // D. Leer a qué panel quiere ir este botón (ej. "panel-consignar")
        const idPanelDestino = this.getAttribute('data-panel');

        // E. Mostrar el panel destino quitándole la clase 'oculto'
        if (idPanelDestino) {
            document.getElementById(idPanelDestino).classList.remove('oculto');
        }
    });
});

