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

// TODO 1: Отрисовка списка обращений + обработка пустого массива
function renderTickets(items) {
  list.innerHTML = "";

  if (!items || items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Обращений пока нет";
    list.append(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "ticket-card";

    const header = document.createElement("h3");
    header.textContent = `#${item.id} — ${item.customer} (${item.status})`;

    const description = document.createElement("p");
    description.textContent = item.problem;

    card.append(header, description);
    list.append(card);
  });
}

// TODO 2: GET /api/tickets
async function loadTickets() {
  setStatus("Загрузка заявок...", "info");
  try {
    const response = await fetch("/api/tickets");
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    renderTickets(data.items);
    summary.textContent = `Всего заявок: ${data.total}`;
    setStatus("Данные успешно загружены", "success");
  } catch (error) {
    setStatus(error.message || "Не удалось загрузить заявки", "error");
  }
}

// TODO 3: POST /api/tickets с полями customer и problem
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
    throw new Error(data.error || data.message || `Ошибка создания: ${response.status}`);
  }

  return data;
}

// TODO 4: Обработка submit с проверкой длины полей (minlength 2 и 5)
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const customer = formData.get("customer")?.trim() || "";
  const problem = formData.get("problem")?.trim() || "";

  if (customer.length < 2) {
    setStatus("Имя должно содержать минимум 2 символа", "error");
    return;
  }

  if (problem.length < 5) {
    setStatus("Описание проблемы должно содержать минимум 5 символов", "error");
    return;
  }

  sendButton.disabled = true;
  setStatus("Отправка заявки...", "info");

  try {
    await createTicket({ customer, problem });
    form.reset();
    await loadTickets();
    setStatus("Заявка успешно создана", "success");
  } catch (error) {
    setStatus(error.message || "Ошибка при отправке формы", "error");
  } finally {
    sendButton.disabled = false;
  }
});

refreshButton.addEventListener("click", loadTickets);

// TODO 5: Первичная загрузка при открытии страницы
loadTickets();
