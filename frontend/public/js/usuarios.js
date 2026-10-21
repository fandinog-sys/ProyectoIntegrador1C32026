import { API } from './config.js';

// Fallback para navegadores sin soporte nativo de :user-invalid
const UserInvalidFallback = (() => {
    const dirtyState = new WeakMap();

    const updateState = (input) => {
        const isValid = input.checkValidity();
        input.classList.toggle('user-invalid-fallback', !isValid);
        input.classList.toggle('user-valid-fallback', isValid);
        if (!isValid) {
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.removeAttribute('aria-invalid');
        }
    };

    const handleEvent = (event) => {
        const input = event.target;
        if (event.type === 'reset') {
            const controls = input.elements || [];
            for (const control of controls) {
                dirtyState.delete(control);
                control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
                control.removeAttribute('aria-invalid');
            }
            return;
        }
        if (!input.checkValidity) return;

        if (event.type === 'input' || event.type === 'change') {
            const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
            state.hasInteracted = true;
            dirtyState.set(input, state);
            if (state.hasBlurred) updateState(input);
        } else if (event.type === 'blur') {
            const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
            state.hasBlurred = true;
            dirtyState.set(input, state);
            if (state.hasInteracted) updateState(input);
        }
    };

    const init = (root = document) => {
        if (CSS.supports('selector(:user-invalid)')) return;
        root.addEventListener('blur', handleEvent, true);
        root.addEventListener('input', handleEvent);
        root.addEventListener('change', handleEvent);
        root.addEventListener('reset', handleEvent, true);
    };

    return { init };
})();

// Sincronizar aria-invalid con el estado CSS :user-invalid nativo
const syncAria = (el) => {
    if (!el || typeof el.matches !== 'function') return;
    if (CSS.supports('selector(:user-invalid)')) {
        el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('usuarioForm');
    const formTitulo = document.getElementById('formTitulo');
    const inputId = document.getElementById('usuarioId');
    const inputNombre = document.getElementById('nombre');
    const inputCorreo = document.getElementById('correo');
    const inputClave = document.getElementById('clave');
    const btnToggleClave = document.getElementById('btnToggleClave');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    const btnRecargar = document.getElementById('btnRecargar');
    const tablaBody = document.getElementById('tablaUsuariosBody');
    const contadorUsuarios = document.getElementById('contadorUsuarios');
    const alertaContainer = document.getElementById('alertaContainer');

    UserInvalidFallback.init(form);

    form.addEventListener('blur', (e) => syncAria(e.target), true);
    form.addEventListener('input', (e) => {
        if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
    });

    // Alternar visibilidad de la contraseña
    btnToggleClave.addEventListener('click', () => {
        const mostrando = inputClave.type === 'text';
        inputClave.type = mostrando ? 'password' : 'text';
        btnToggleClave.setAttribute('aria-pressed', String(!mostrando));
        btnToggleClave.setAttribute('aria-label', mostrando ? 'Mostrar contraseña' : 'Ocultar contraseña');
        btnToggleClave.textContent = mostrando ? 'Mostrar' : 'Ocultar';
    });

    // Mostrar alerta accesible
    function mostrarAlerta(mensaje, tipo = 'success') {
        alertaContainer.replaceChildren();
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');

        const textoSpan = document.createElement('span');
        textoSpan.textContent = mensaje;

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-close';
        closeBtn.setAttribute('data-bs-dismiss', 'alert');
        closeBtn.setAttribute('aria-label', 'Cerrar');

        alertDiv.append(textoSpan, closeBtn);
        alertaContainer.appendChild(alertDiv);
    }

    // Cambiar entre modo Crear y modo Editar
    function activarModoEdicion(usuario) {
        inputId.value = usuario._id;
        inputNombre.value = usuario.nombre || '';
        inputCorreo.value = usuario.correo || '';
        inputClave.value = usuario.clave || '';

        formTitulo.textContent = 'Editar Usuario';
        btnGuardar.textContent = 'Actualizar cambios';
        btnGuardar.classList.replace('btn-primary', 'btn-warning');
        btnCancelarEdicion.classList.remove('d-none');
        inputNombre.focus();
    }

    function resetearFormulario() {
        form.reset();
        inputId.value = '';
        inputClave.type = 'password';
        btnToggleClave.setAttribute('aria-pressed', 'false');
        btnToggleClave.textContent = 'Mostrar';

        for (const control of [inputNombre, inputCorreo, inputClave]) {
            control.removeAttribute('aria-invalid');
            control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
        }

        formTitulo.textContent = 'Registrar Nuevo Usuario';
        btnGuardar.textContent = 'Guardar usuario';
        btnGuardar.classList.replace('btn-warning', 'btn-primary');
        btnCancelarEdicion.classList.add('d-none');
    }

    btnCancelarEdicion.addEventListener('click', resetearFormulario);

    // Renderizar filas de usuarios de forma segura (sin inyección HTML)
    function renderizarTabla(usuarios) {
        tablaBody.replaceChildren();
        contadorUsuarios.textContent = String(usuarios.length);

        if (!usuarios.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.className = 'text-center py-4 text-muted';
            td.textContent = 'No hay usuarios registrados todavía.';
            tr.appendChild(td);
            tablaBody.appendChild(tr);
            return;
        }

        for (const usuario of usuarios) {
            const tr = document.createElement('tr');

            const tdNombre = document.createElement('td');
            tdNombre.className = 'fw-medium';
            tdNombre.textContent = usuario.nombre;

            const tdCorreo = document.createElement('td');
            tdCorreo.textContent = usuario.correo;

            const tdClave = document.createElement('td');
            const codeClave = document.createElement('code');
            codeClave.className = 'text-secondary';
            codeClave.textContent = '••••••••';
            tdClave.appendChild(codeClave);

            const tdAcciones = document.createElement('td');
            tdAcciones.className = 'text-end';

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn btn-sm btn-outline-primary me-2';
            btnEditar.textContent = 'Editar';
            btnEditar.addEventListener('click', () => activarModoEdicion(usuario));

            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.className = 'btn btn-sm btn-outline-danger';
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.addEventListener('click', () => eliminarUsuario(usuario));

            tdAcciones.append(btnEditar, btnEliminar);
            tr.append(tdNombre, tdCorreo, tdClave, tdAcciones);
            tablaBody.appendChild(tr);
        }
    }

    // GET: Cargar todos los usuarios
    async function cargarUsuarios() {
        try {
            const respuesta = await fetch(API.USUARIOS);
            if (!respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta.status}`);
            }
            const usuarios = await respuesta.json();
            renderizarTabla(usuarios);
        } catch (error) {
            tablaBody.replaceChildren();
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.className = 'text-center py-4 text-danger';
            td.textContent = `No se pudo conectar con la API (${API.USUARIOS}). Verifica que el servidor backend esté activo.`;
            tr.appendChild(td);
            tablaBody.appendChild(tr);
        }
    }

    // POST / PUT: Guardar o actualizar usuario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.classList.add('user-invalid-fallback');
                firstInvalid.setAttribute('aria-invalid', 'true');
                firstInvalid.focus();
            }
            return;
        }

        const datosUsuario = {
            nombre: inputNombre.value.trim(),
            correo: inputCorreo.value.trim(),
            clave: inputClave.value.trim()
        };

        const idEdicion = inputId.value;
        const esEdicion = Boolean(idEdicion);
        const url = esEdicion ? `${API.USUARIOS}/${idEdicion}` : API.USUARIOS;
        const metodo = esEdicion ? 'PUT' : 'POST';

        btnGuardar.disabled = true;

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.message || 'Error al guardar el usuario');
            }

            mostrarAlerta(
                esEdicion
                    ? `Usuario "${datosUsuario.nombre}" actualizado correctamente.`
                    : `Usuario "${datosUsuario.nombre}" creado correctamente.`,
                'success'
            );

            resetearFormulario();
            await cargarUsuarios();
        } catch (error) {
            mostrarAlerta(`Error: ${error.message}`, 'danger');
        } finally {
            btnGuardar.disabled = false;
        }
    });

    // DELETE: Eliminar usuario
    async function eliminarUsuario(usuario) {
        const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre}"?`);
        if (!confirmar) return;

        try {
            const respuesta = await fetch(`${API.USUARIOS}/${usuario._id}`, {
                method: 'DELETE'
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.message || 'No se pudo eliminar el usuario');
            }

            if (inputId.value === usuario._id) {
                resetearFormulario();
            }

            mostrarAlerta(`Usuario "${usuario.nombre}" eliminado correctamente.`, 'info');
            await cargarUsuarios();
        } catch (error) {
            mostrarAlerta(`Error al eliminar: ${error.message}`, 'danger');
        }
    }

    btnRecargar.addEventListener('click', cargarUsuarios);

    // Carga inicial
    cargarUsuarios();
});

