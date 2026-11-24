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

  items.forEach((ticket) => {
    const card = document.createElement("article");
    card.className = "ticket-card";

    const header = document.createElement("h3");
    header.textContent = `#${ticket.id} — ${ticket.customer}`;

    const problemText = document.createElement("p");
    problemText.textContent = ticket.problem;

    const ticketStatus = document.createElement("span");
    ticketStatus.textContent = `Статус: ${ticket.status ?? "новая"}`;

    card.append(header, problemText, ticketStatus);
    list.appendChild(card);
  });
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
    setStatus("Список обращений актуален", "success");
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Ошибка создания: ${response.status}`);
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const customer = String(formData.get("customer") ?? "").trim();
  const problem = String(formData.get("problem") ?? "").trim();

  if (!customer || !problem) {
    setStatus("Заполните имя и описание проблемы перед отправкой", "error");
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
