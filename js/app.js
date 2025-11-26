// Función para mostrar la fecha y hora en tiempo real
function actualizarFechaHora() {
  const fecha = new Date();

  // Formateamos la fecha y hora
  const dia = fecha.toLocaleDateString('es-AR');
  const hora = fecha.toLocaleTimeString('es-AR');

  // Actualizamos el contenido en el HTML
  document.getElementById('fecha').textContent = dia;
  document.getElementById('hora').textContent = hora;
}

// Llamamos a la función para que actualice la fecha y hora cada segundo
setInterval(actualizarFechaHora, 1000);

// --- Lógica de Renderizado de Tabla ---
const resultsContainer = document.getElementById('results-container');

function renderTable(data) {
  resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

  if (!Array.isArray(data) || data.length === 0) {
    // Si no hay datos, dejamos el contenedor vacío (o podríamos mostrar un mensaje)
    return;
  }

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  let nextDepartureIndex = -1;
  let minDiff = Infinity;

  // Encontrar el próximo horario
  data.forEach((viaje, index) => {
    if (viaje.horaSalida) {
      const [hours, minutes] = viaje.horaSalida.split(':').map(Number);
      const tripTimeInMinutes = hours * 60 + minutes;

      // Calculamos la diferencia. Si es negativo, significa que ya pasó (asumiendo mismo día)
      // Nota: Esto es una simplificación. Para producción, manejar cambio de día.
      let diff = tripTimeInMinutes - currentTimeInMinutes;

      if (diff >= 0 && diff < minDiff) {
        minDiff = diff;
        nextDepartureIndex = index;
      }
    }
  });

  let tableHtml = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Inicio Recorrido</th>
                    <th>Recorrido</th>
                    <th>Costo Ticket</th>
                    <th>Codigo Ticket</th>
                </tr>
            </thead>
            <tbody>
    `;

  data.forEach((viaje, index) => {
    const isNext = index === nextDepartureIndex ? 'class="next-departure"' : '';

    tableHtml += `
            <tr ${isNext}>
                <td>${viaje.id || 'N/A'}</td>
                <td>${viaje.horaSalida || 'N/A'}</td>
                <td>${viaje.recorrido || 'N/A'}</td>
                <td>$${viaje.costoTotal || 'N/A'}</td>
                <td>${viaje.codigoTicket || 'N/A'}</td>
            </tr>
        `;
  });

  tableHtml += '</tbody></table>';
  resultsContainer.innerHTML = tableHtml;
}

// --- Lógica de Navegación y Botones de Ruta ---
document.querySelectorAll('.nav-btn').forEach(button => {
  button.addEventListener('click', () => {
    // Ignorar botón personalizado
    if (button.id === 'btn-personalizado') return;

    const route = button.dataset.route;
    const fecha = new Date();
    const dia = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
    const hora = fecha.toLocaleTimeString('es-AR').substring(0, 5);

    if (route) {
      const origen = button.textContent.split('→')[0].trim();
      const destino = button.textContent.split('→')[1].trim();
      // Normalizar día para la API
      let tipoDia = 'ENTRE_SEMANA';
      if (dia.toLowerCase() === 'domingo') tipoDia = 'DOMINGOS';
      if (dia.toLowerCase() === 'sábado' || dia.toLowerCase() === 'sabado') tipoDia = 'SABADOS';

      console.log(`Consultando API: ${origen} -> ${destino}, Hora: ${hora}, Día: ${tipoDia}`);

      fetch(`http://localhost:8080/api/viajes?origen=${origen}&destino=${destino}&hora_salida=${hora}&tipo_dia=${tipoDia}`)
        .then(response => {
          if (!response.ok) throw new Error('Error en la respuesta de la API');
          return response.json();
        })
        .then(data => {
          console.log('Datos recibidos:', data);
          renderTable(data);
        })
        .catch(error => {
          console.error('Error al consultar API:', error);
          resultsContainer.innerHTML = '<p style="text-align:center; padding: 20px; color: red;">Error al cargar los datos. Asegúrese de que el servidor esté corriendo.</p>';
        });
    }
  });
});

// --- Lógica de "Personalizado" ---
const btnPersonalizado = document.getElementById('btn-personalizado');
const personalizadoContainer = document.getElementById('personalizado-container');

btnPersonalizado.addEventListener('click', () => {
  personalizadoContainer.classList.toggle('hidden');
});

// --- Lógica del Filtro Personalizado ---
function toggleActiveButton(buttons, selectedButton) {
  buttons.forEach(button => {
    button.classList.remove('active');
  });
  selectedButton.classList.add('active');
}

document.querySelectorAll('.trip-type button').forEach(button => {
  button.addEventListener('click', () => {
    const buttons = button.parentElement.querySelectorAll('button');
    toggleActiveButton(buttons, button);

    const origen = document.getElementById('origen').value;
    const destino = document.getElementById('destino').value;
    const tipoViaje = button.dataset.value;
    const fecha = document.getElementById('fecha').textContent;
    const hora = document.getElementById('hora').textContent;

    if (!origen || !destino) {
      alert('Por favor seleccione origen y destino');
      return;
    }

    // Aquí también podríamos llamar a la API real si se desea, 
    // por ahora mantenemos la simulación o reutilizamos la lógica si la API soporta estos filtros exactos.
    // Para consistencia con el pedido del usuario, vamos a intentar usar la misma función de renderizado si fuera posible,
    // pero como el usuario pidió específicamente para el navbar, dejaremos esto como estaba o lo adaptaremos mínimamente.

    console.log('Filtro personalizado accionado');
    // TODO: Implementar llamada a API para filtro personalizado si es necesario.
  });
});