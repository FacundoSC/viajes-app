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
  
  // Función para manejar el cambio de estado de los botones
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
  
      // Información de los filtros seleccionados
      const origen = document.getElementById('origen').value;
      const destino = document.getElementById('destino').value;
      const parada = document.getElementById('parada').value;
      const tipoViaje = button.dataset.value;  // 'ida' o 'vuelta'
      const fecha = document.getElementById('fecha').textContent;
      const hora = document.getElementById('hora').textContent;
  
      // Simulamos una petición a la API (en lugar de hacer una verdadera solicitud HTTP)
      const peticion = {
        origen,
        destino,
        parada: parada === 'todos' ? null : parada,  // Si la parada es 'todos', la dejamos como null
        tipoViaje,
        fecha,
        hora
      };
  
      // Simulamos la respuesta de la API
      console.log('Simulando petición a API con los siguientes datos:', peticion);
  
      // Aquí podrías hacer una solicitud real a la API con fetch()
      // fetch('/api/viajes', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(peticion)
      // })
      // .then(response => response.json())
      // .then(data => console.log('Respuesta de la API:', data))
      // .catch(error => console.log('Error en la solicitud:', error));
    });
  });
  