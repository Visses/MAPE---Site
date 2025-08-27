document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Inicializa FinisherHeader ----------
     Opcional: ajuste as cores, quantidade, shapes, blending, etc.
     Observação: inclui "className": "finisher-header" para garantir que o canvas seja anexado no elemento correto.
  */
  try {
    new FinisherHeader({
  "count": 60,
  "size": { "min": 2, "max": 6, "pulse": 0 },
  "speed": { "x": { "min": 0, "max": 0.05 }, "y": { "min": 0, "max": 0.05 } },
  "colors": {
    "background": "#000000ff",
    "particles": [
      "#ffffff",
      "#cdbb10",
      "#fffbfb"
    ]
  },
  "blending": "overlay",
  "opacity": { "center": 1, "edge": 0 },
  "skew": 0,    // desativa inclinação
  "shapes": ["s", "t"],
  "className": "finisher-header"
});

  } catch (err) {
    console.error('Erro ao inicializar finisher header:', err);
  }

  /* ---------- Cronômetro regressivo ----------
     Altere a data abaixo para a data/hora do drop:
     formato ISO: 'YYYY-MM-DDTHH:MM:SS' (UTC/local conforme preferir)
  */
  const targetDate = new Date('2025-09-10T10:00:00'); // <- muda aqui pra data do cliente

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date();
    let diff = targetDate - now;
    if (diff < 0) diff = 0;

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');

    // se quiser executar algo quando chegar em zero, faz aqui:
    if (diff === 0) {
      clearInterval(interval);
      // ex: document.querySelector('.tagline').textContent = 'Entrou no ar!';
    }
  }

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
});
