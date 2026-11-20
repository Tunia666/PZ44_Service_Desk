const form = document.querySelector("#ticket-form");
const list = document.querySelector("#ticket-list");
const status = document.querySelector("#status");
const summary = document.querySelector("#summary");
const refreshButton = document.querySelector("#refresh-button");
const sendButton = document.querySelector("#send-button");

function setStatus(text, kind = "info") {
  status.textContent = text;
  status.dataset.kind = kind;
}

function renderTickets(items) {
  list.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Обращений пока нет";
    list.appendChild(empty);
    return;
  }

  for (const item of items) {
    const card = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = `#${item.id} — ${item.customer} [${item.status || "open"}]`;

    const body = document.createElement("p");
    body.textContent = item.problem;

    card.append(title, body);
    list.appendChild(card);
  }
}

async function loadTickets() {
  try {
    setStatus("Загрузка...", "info");
    const response = await fetch("/api/tickets");

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: HTTP ${response.status}`);
    }

    const data = await response.json();
    renderTickets(data.items);
    summary.textContent = `Всего обращений: ${data.total}`;
    setStatus("Список обновлён", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function createTicket(payload) {
  const response = await fetch("/api/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Ошибка создания: HTTP ${response.status}`);
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const customerInput = form.elements.customer;
  const problemInput = form.elements.problem;

  const customer = customerInput.value.trim();
  const problem = problemInput.value.trim();

  if (customer.length < 2 || problem.length < 5) {
    setStatus("Имя должно быть не короче 2 символов, а описание — не короче 5", "error");
    return;
  }

  sendButton.disabled = true;
  setStatus("Отправка обращения...", "info");

  try {
    await createTicket({ customer, problem });
    form.reset();
    await loadTickets();
    setStatus("Обращение успешно создано", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    sendButton.disabled = false;
  }
});

refreshButton.addEventListener("click", loadTickets);

loadTickets();