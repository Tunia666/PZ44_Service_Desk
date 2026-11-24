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
  const fragment = document.createDocumentFragment();
  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Обращений пока нет";
    fragment.appendChild(empty);
  } else {
    for (const ticket of items) {
      const card = document.createElement("div");
      card.className = "item";

      const title = document.createElement("h3");
      title.textContent = `Заявка #${ticket.id}`;

      const meta = document.createElement("div");
      meta.className = "meta";

      const author = document.createElement("span");
      author.className = "chip";
      author.textContent = ticket.customer;

      const state = document.createElement("span");
      state.className = "chip";
      state.textContent = ticket.status;

      meta.appendChild(author);
      meta.appendChild(state);

      const text = document.createElement("p");
      text.textContent = ticket.problem;

      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(text);
      fragment.appendChild(card);
    }
  }
  list.replaceChildren(fragment);
}
async function loadTickets() {
  setStatus("Загрузка обращений…", "loading");
  try {
    const response = await fetch("/api/tickets", { method: "GET" });
    if (!response.ok) {
      throw new Error(`Сервер вернул ${response.status}`);
    }
    const data = await response.json();
    renderTickets(data.items);
    summary.textContent = `Всего обращений: ${data.total}`;
    setStatus("Список обновлён", "success");
  } catch (err) {
    setStatus(`Ошибка загрузки: ${err.message}`, "error");
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
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.error || `Сервер вернул ${response.status}`);
  }
  return data;
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const customerName = form.customer.value.trim();
  const problemText = form.problem.value.trim();
  if (customerName.length < 2 || problemText.length < 5) {
    setStatus("Укажите имя (от 2 символов) и проблему (от 5 символов)", "error");
    return;
  }
  sendButton.disabled = true;
  try {
    const result = await createTicket({ customer: customerName, problem: problemText });
    form.customer.value = "";
    form.problem.value = "";
    setStatus(result.message || "Заявка создана", "success");
    await loadTickets();
  } catch (err) {
    setStatus(`Не удалось создать заявку: ${err.message}`, "error");
  } finally {
    sendButton.disabled = false;
  }
});
refreshButton.addEventListener("click", loadTickets);
loadTickets();