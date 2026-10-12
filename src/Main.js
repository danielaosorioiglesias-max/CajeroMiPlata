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

document.getElementById('btn-submit-login').addEventListener('click',()=>{
    cambiarVista('vista-cajero','btn-nav-login')
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