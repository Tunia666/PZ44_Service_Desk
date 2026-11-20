const form = document.getElementById('ticket-form');
const customerInput = document.getElementById('customer');
const problemInput = document.getElementById('problem');
const sendButton = document.getElementById('send-button');
const refreshButton = document.getElementById('refresh-button');
const statusBox = document.getElementById('status');
const summaryBox = document.getElementById('summary');
const ticketList = document.getElementById('ticket-list');

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle('error', isError);
}

function renderTickets(items) {
  ticketList.innerHTML = '';

  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Обращений пока нет.';
    ticketList.appendChild(empty);
    return;
  }

  items.forEach((ticket) => {
    const card = document.createElement('article');
    card.className = 'card';

    const head = document.createElement('div');
    head.className = 'card-head';

    const title = document.createElement('strong');
    title.textContent = `#${ticket.id} — ${ticket.customer}`;

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = ticket.status || 'Новая';

    head.append(title, badge);

    const text = document.createElement('p');
    text.textContent = ticket.problem;

    card.append(head, text);
    ticketList.appendChild(card);
  });
}

async function loadTickets() {
  try {
    const response = await fetch('/api/tickets');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderTickets(data.items);
    summaryBox.textContent = `Всего обращений: ${data.total}`;
    setStatus('Список обращений актуален.', false);
  } catch (error) {
    setStatus(`Ошибка загрузки: ${error.message}`, true);
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const customer = customerInput.value.trim();
  const problem = problemInput.value.trim();

  if (customer.length < 2 || problem.length < 5) {
    setStatus('Укажите имя (от 2 символов) и проблему (от 5 символов).', true);
    return;
  }

  sendButton.disabled = true;

  try {
    const result = await createTicket({ customer, problem });
    form.reset();
    await loadTickets();
    setStatus(result.message || 'Заявка создана.', false);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    sendButton.disabled = false;
  }
});

refreshButton.addEventListener('click', loadTickets);
loadTickets();


