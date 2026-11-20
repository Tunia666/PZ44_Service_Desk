const form = document.querySelector('#ticket-form');
const list = document.querySelector('#ticket-list');
const status = document.querySelector('#status');
const summary = document.querySelector('#summary');
const refreshButton = document.querySelector('#refresh-button');
const sendButton = document.querySelector('#send-button');

function setStatus(text, kind = 'info') {
  status.textContent = text;
  status.dataset.kind = kind;
}

function renderTickets(items = []) {
  list.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Обращений пока нет.';
    list.appendChild(empty);
    return;
  }

  items.forEach((ticket) => {
    const card = document.createElement('article');
    card.className = 'ticket-card';
    const header = document.createElement('header');
    const idEl = document.createElement('strong');
    idEl.textContent = `#${ticket.id} `;
    const authorEl = document.createElement('span');
    authorEl.textContent = ticket.name || ticket.author || 'Аноним';
    const statusEl = document.createElement('span');
    statusEl.className = 'ticket-status';
    statusEl.textContent = ` [${ticket.status || 'новое'}]`;
    header.append(idEl, authorEl, statusEl);
    const textEl = document.createElement('p');
    textEl.textContent = ticket.problem || ticket.text || ticket.description || '';

    card.append(header, textEl);
    list.appendChild(card);
  });
}
async function loadTickets() {
  setStatus('Загрузка обращений...', 'info');

  try {
    const response = await fetch('/api/tickets');

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    renderTickets(data.items);
    summary.textContent = `Всего обращений: ${data.total ?? data.items.length}`;
    setStatus('Список обновлён', 'success');
  } catch (error) {
    setStatus(`Не удалось загрузить данные: ${error.message}`, 'error');
  }
}

async function createTicket(payload) {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Не удалось создать обращение (код ${response.status})`);
  }

  return await response.json();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  // Убираем пробелы по краям и проверяем, что поля не пустые
  for (const key in payload) {
    payload[key] = payload[key].trim();
    if (!payload[key]) {
      setStatus('Пожалуйста, заполните все поля формы.', 'error');
      return;
    }
  }

  sendButton.disabled = true;
  setStatus('Отправка обращения...', 'info');

  try {
    await createTicket(payload);
    form.reset();
    await loadTickets();
    setStatus('Обращение успешно отправлено!', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    sendButton.disabled = false;
  }
});

refreshButton.addEventListener('click', loadTickets);
loadTickets();
