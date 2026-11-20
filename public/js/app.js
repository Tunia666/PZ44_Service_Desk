function renderTickets(items) {
  ticketsList.innerHTML = '';

  if (!Array.isArray(items) || items.length === 0) {
    const emptyEl = document.createElement('p');
    emptyEl.className = 'empty-state';
    emptyEl.textContent = 'Обращений пока нет.';
    ticketsList.appendChild(emptyEl);
    return;
  }

  items.forEach((ticket) => {
    const card = document.createElement('article');
    card.className = 'ticket-card';

    const header = document.createElement('div');
    header.className = 'ticket-header';

    const title = document.createElement('strong');
    title.textContent = `Заявка #${ticket.id} — ${ticket.customer}`;

    const status = document.createElement('span');
    status.className = 'ticket-status';
    status.textContent = ticket.status || 'Новая';

    header.append(title, status);

    const problemText = document.createElement('p');
    problemText.className = 'ticket-problem';
    problemText.textContent = ticket.problem;

    card.append(header, problemText);
    ticketsList.appendChild(card);
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

    if (totalCounter) {
      totalCounter.textContent = data.total;
    }
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

ticketForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const customer = customerInput.value.trim();
  const problem = problemInput.value.trim();

  if (customer.length < 2 || problem.length < 5) {
    setStatus('Заполните имя (от 2 символов) и проблему (от 5 символов).', true);
    return;
  }

  submitBtn.disabled = true;

  try {
    const result = await createTicket({ customer, problem });
    setStatus(result.message || 'Заявка создана', false);
    ticketForm.reset();
    await loadTickets();
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    submitBtn.disabled = false;
  }
});

refreshBtn.addEventListener('click', loadTickets);
document.addEventListener('DOMContentLoaded', loadTickets);

