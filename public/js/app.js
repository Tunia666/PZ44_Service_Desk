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
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Заявок пока нет";
    list.append(empty);
    return;
  }

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "item";

    const title = document.createElement("h3");
    title.textContent = item.customer;

    const meta = document.createElement("div");
    meta.className = "meta";

    const idChip = document.createElement("span");
    idChip.className = "chip";
    idChip.textContent = `#${item.id}`;

    const statusChip = document.createElement("span");
    statusChip.className = "chip";
    statusChip.textContent = item.status;

    meta.append(idChip, statusChip);

    const problem = document.createElement("p");
    problem.textContent = item.problem;

    card.append(title, meta, problem);
    list.append(card);
  }
}

async function loadTickets() {
  setStatus("Загрузка заявок...", "loading");

  try {
    const response = await fetch("/api/tickets");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Ошибка при загрузке заявок");
    }

    renderTickets(data.items);
    summary.textContent = `Всего заявок: ${data.total}`;
    setStatus("Список заявок обновлён", "success");
  } catch (err) {
    setStatus(err.message || "Не удалось загрузить заявки", "error");
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
    throw new Error(data.error || "Ошибка при создании заявки");
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const customer = String(formData.get("customer") || "").trim();
  const problem = String(formData.get("problem") || "").trim();

  if (customer.length < 2 || problem.length < 5) {
    setStatus(
      "Укажите имя (от 2 символов) и проблему (от 5 символов)",
      "error",
    );
    return;
  }

  sendButton.disabled = true;
  setStatus("Отправка заявки...", "loading");

  try {
    const result = await createTicket({ customer, problem });
    form.reset();
    await loadTickets();
    setStatus(result.message || "Заявка создана", "success");
  } catch (err) {
    setStatus(err.message || "Не удалось отправить заявку", "error");
  } finally {
    sendButton.disabled = false;
  }
});

refreshButton.addEventListener("click", loadTickets);

loadTickets();
