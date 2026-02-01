/**
 * Actualiza la visualización de fecha y hora en tiempo real.
 */
function actualizarFechaHora() {
  const fecha = new Date();

  // Formateamos la fecha y hora
  const dia = fecha.toLocaleDateString('es-AR');
  const hora = fecha.toLocaleTimeString('es-AR', { hour12: false });

  // Actualizamos el contenido en el HTML
  document.getElementById('fecha').textContent = dia;
  document.getElementById('hora').textContent = hora;
}

// Inicialización de actualización periódica
setInterval(actualizarFechaHora, 1000);

// --- Lógica de Renderizado de Tabla ---
const resultsContainer = document.getElementById('results-container');

/**
 * Renderiza la tabla de viajes próximos.
 * @param {Array} data - Lista de objetos de viaje.
 */
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
                <td data-label="Inicio">${viaje.horaSalida || 'N/A'}</td>
                <td data-label="Recorrido">${viaje.recorrido || 'N/A'}</td>
                <td data-label="Costo">$${viaje.costoTotal || 'N/A'}</td>
                <td data-label="Ticket">${viaje.codigoTicket || 'N/A'}</td>
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

    // Remover clase activa de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-route'));
    // Agregar clase activa al botón presionado
    button.classList.add('active-route');

    const route = button.dataset.route;
    const fecha = new Date();
    const dia = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
    const hora = fecha.toLocaleTimeString('es-AR', { hour12: false }).substring(0, 5);

    if (route) {
      const origen = button.textContent.split('→')[0].trim();
      const destino = button.textContent.split('→')[1].trim();
      // Normalizar día para la API
      let tipoDia = 'ENTRE_SEMANA';
      if (dia.toLowerCase() === 'domingo') tipoDia = 'DOMINGOS';
      if (dia.toLowerCase() === 'sábado' || dia.toLowerCase() === 'sabado') tipoDia = 'SABADOS';

      console.log(`Consultando API: ${origen} -> ${destino}, Hora: ${hora}, Día: ${tipoDia}`);

      fetch(`/api/viajes?origen=${origen}&destino=${destino}&hora_salida=${hora}&tipo_dia=${tipoDia}`)
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

if (btnPersonalizado && personalizadoContainer) {
  btnPersonalizado.addEventListener('click', () => {
    personalizadoContainer.classList.toggle('hidden');
  });
}

// --- Lógica del Filtro Personalizado ---
function toggleActiveButton(buttons, selectedButton) {
  buttons.forEach(button => {
    button.classList.remove('active');
  });
  selectedButton.classList.add('active');
}

const tripTypeButtons = document.querySelectorAll('.trip-type button');
if (tripTypeButtons.length > 0) {
  tripTypeButtons.forEach(button => {
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

      console.log('Filtro personalizado accionado');
    });
  });
}


// --- Lógica de Tarifario ---
const btnTarifario = document.getElementById('btn-tarifario');

// La lista de tarifas estáticas se ha eliminado para usar el endpoint /api/tarifas


/**
 * Renderiza la tabla de tarifario basada en los datos de la API.
 * @param {Array} tarifas - Lista de tarifas obtenidas del servidor.
 */
function renderTarifasTable(tarifas) {
  resultsContainer.innerHTML = '';

  if (!Array.isArray(tarifas) || tarifas.length === 0) {
    resultsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">No hay tarifas disponibles.</p>';
    return;
  }

  let tableHtml = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Código Ticket</th>
                    <th>Precio</th>
                    <th>Destino (Ejemplo)</th>
                    <th>Histórico</th>
                </tr>
            </thead>
            <tbody>
    `;

  tarifas.forEach(tarifa => {
    tableHtml += `
            <tr>
                <td data-label="Código">${tarifa.codigo || 'N/A'}</td>
                <td data-label="Precio">$${tarifa.monto || 'N/A'}</td>
                <td data-label="Description">${tarifa.description || 'N/A'}</td>
                <td data-label="Histórico">
                    <button class="btn-history" onclick="showHistory(${tarifa.codigo})">Ver Historial</button>
                </td>
            </tr>
        `;
  });

  tableHtml += '</tbody></table>';
  resultsContainer.innerHTML = tableHtml;
}

/**
 * Obtiene el historial de una tarifa y muestra el modal con el histograma.
 * @param {number} id - ID de la tarifa.
 */
function showHistory(id) {
  const modal = document.getElementById('history-modal');
  const container = document.getElementById('histogram-container');
  const closeBtn = document.querySelector('.close-modal');

  // Mostrar modal con cargando
  modal.classList.remove('hidden');
  container.innerHTML = '<p style="text-align:center; width: 100%;">Cargando historial...</p>';

  // Configurar cierre de modal
  closeBtn.onclick = () => modal.classList.add('hidden');
  window.onclick = (event) => {
    if (event.target == modal) modal.classList.add('hidden');
  };

  fetch(`/api/tarifas/${id}/history`)
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener el historial');
      return response.json();
    })
    .then(data => {
      renderHistoryChart(data);
    })
    .catch(error => {
      console.error(error);
      container.innerHTML = '<p style="text-align:center; width: 100%; color: red;">Error al cargar el historial.</p>';
    });
}

/**
 * Renderiza un gráfico de líneas minimalista usando SVG.
 * @param {Array} historyData - Lista de objetos con fecha y precio.
 */
function renderHistoryChart(historyData) {
  const container = document.getElementById('histogram-container');
  container.innerHTML = '';

  if (!Array.isArray(historyData) || historyData.length === 0) {
    container.innerHTML = '<p style="text-align:center; width: 100%;">No hay datos históricos disponibles.</p>';
    return;
  }

  const width = container.clientWidth - 60; // Padding
  const height = container.clientHeight - 120; // Padding para etiquetas
  const maxPrice = Math.max(...historyData.map(d => d.cost || 0));
  const minPrice = Math.min(...historyData.map(d => d.cost || 0));
  const range = maxPrice - minPrice || 1;

  // Crear SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "chart-svg");
  svg.setAttribute("viewBox", `0 0 ${container.clientWidth} ${container.clientHeight}`);

  const drawHeight = height;
  const drawWidth = width;
  const xStep = historyData.length > 1 ? drawWidth / (historyData.length - 1) : 0;

  // Función para calcular Y basado en el precio
  const getY = (price) => {
    // Escalar precio al área de dibujo (invertido porque Y crece hacia abajo)
    const normalized = (price - minPrice) / (maxPrice - minPrice || 1);
    return drawHeight - (normalized * drawHeight * 0.8) + 40; // 0.8 para dejar margen arriba/abajo
  };

  let points = "";

  historyData.forEach((item, i) => {
    const x = i * xStep + 40;
    const y = getY(item.cost || 0);
    points += `${x},${y} `;

    // Dibujar Punto
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 5);
    circle.setAttribute("class", "chart-point");
    svg.appendChild(circle);

    // Etiqueta de Precio
    const labelValue = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelValue.setAttribute("x", x);
    labelValue.setAttribute("y", y - 15);
    labelValue.setAttribute("class", "chart-label-value");
    labelValue.textContent = `$${item.cost || 0}`;
    svg.appendChild(labelValue);

    // Etiqueta de Fecha
    const from = item.vigenciaDesde ? new Date(item.vigenciaDesde).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

    // Si vigenciaHasta es null o "1970-01-01", mostrar "Hoy"
    let to = 'Hoy';
    if (item.vigenciaHasta && !item.vigenciaHasta.startsWith('1970-01-01')) {
      to = new Date(item.vigenciaHasta).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    const dateRange = from ? `${from} - ${to}` : 'N/A';

    const labelDate = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelDate.setAttribute("x", x);
    labelDate.setAttribute("y", drawHeight + 80);
    labelDate.setAttribute("class", "chart-label-date");
    labelDate.setAttribute("transform", `rotate(-45, ${x}, ${drawHeight + 80})`);
    labelDate.textContent = dateRange;
    svg.appendChild(labelDate);
  });

  // Dibujar Línea
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", points.trim());
  polyline.setAttribute("class", "chart-line");
  svg.insertBefore(polyline, svg.firstChild);

  container.appendChild(svg);
}

if (btnTarifario) {
  btnTarifario.addEventListener('click', () => {
    // Remover clase activa de todos los botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-route'));
    // Agregar clase activa al botón tarifario
    btnTarifario.classList.add('active-route');

    console.log('Mostrando tabla de tarifario');

    fetch('/api/tarifas')
      .then(response => {
        if (!response.ok) throw new Error('Error en la respuesta de la API de tarifas');
        return response.json();
      })
      .then(data => {
        console.log('Tarifas recibidas:', data);
        renderTarifasTable(data);
      })
      .catch(error => {
        console.error('Error al consultar API de tarifas:', error);
        resultsContainer.innerHTML = '<p style="text-align:center; padding: 20px; color: red;">Error al cargar las tarifas. Asegúrese de que el servidor esté corriendo.</p>';
      });
  });
}