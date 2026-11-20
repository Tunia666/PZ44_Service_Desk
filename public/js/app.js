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

  if (!items || items.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Обращений пока нет.";
    list.appendChild(empty);
    return;
  }

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "ticket-card";

    const header = document.createElement("h3");
    header.textContent = `#${item.id} — ${item.customer}`;

    const description = document.createElement("p");
    description.textContent = item.problem;

    const ticketStatus = document.createElement("span");
    ticketStatus.textContent = `Статус: ${item.status}`;

    card.append(header, description, ticketStatus);
    list.appendChild(card);
  }
}

async function loadTickets() {
  setStatus("Загрузка обращений...", "info");

  try {
    const response = await fetch("/api/tickets");
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    renderTickets(data.items);
    summary.textContent = `Всего обращений: ${data.total}`;
    setStatus("Список обращений обновлён", "success");
  } catch (error) {
    setStatus(`Не удалось загрузить заявки: ${error.message}`, "error");
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
    throw new Error(data.error || `Ошибка HTTP ${response.status}`);
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const customer = String(formData.get("customer") || "").trim();
  const problem = String(formData.get("problem") || "").trim();

  if (customer.length < 2 || problem.length < 5) {
    setStatus("Укажите имя (от 2 символов) и проблему (от 5 символов).", "error");
    return;
  }

  sendButton.disabled = true;
  setStatus("Отправка заявки...", "info");

  try {
    const result = await createTicket({ customer, problem });
    form.reset();
    await loadTickets();
    setStatus(result.message || "Заявка создана", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    sendButton.disabled = false;
  }
});

refreshButton.addEventListener("click", loadTickets);

loadTickets();
