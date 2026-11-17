document.addEventListener("DOMContentLoaded", () => {
  const warning = document.getElementById("crud-warning");
  const afterAction = document.getElementById("after-action");
  const viewBtn = document.getElementById("viewBtn");

  const apiBase = "/api/orders";

  function showMessage(msg, type = "success") {
    warning.textContent = msg;
    warning.classList.remove("success", "error");
    warning.classList.add(type);
    afterAction.style.display = type === "success" ? "block" : "none";
  }

  async function apiRequest(url, method, data = null) {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (data) options.body = JSON.stringify(data);

    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Ошибка " + res.status);
      return res;
    } catch (err) {
      showMessage(err.message, "error");
    }
  }

  const createBtn = document.getElementById("createOrderBtn");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      const userId = document.getElementById("userId").value.trim();
      const itemsText = document.getElementById("items").value.trim();

      if (!userId || !itemsText) return showMessage("Заполните все поля!", "error");

      let items;
      try {
        items = JSON.parse(itemsText);
      } catch {
        return showMessage("Некорректный JSON для items!", "error");
      }
      const res = await apiRequest(apiBase, "POST", { userId, items });
      if (res) {
        const data = await res.json();
        showMessage(`Заказ создан!\nid: ${data.id}`, "success");
      }
    });
  }

  const updateBtn = document.getElementById("updateOrderBtn");
  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
      const id = document.getElementById("updateId").value.trim();
      if (!id) return showMessage("Введите ID заказа!", "error");

      const status = document.getElementById("status").value.trim();
      const itemsText = document.getElementById("items").value.trim();

      const dto = {};
      if (status) dto.status = status;

      if (itemsText) {
        try {
          dto.items = JSON.parse(itemsText);
        } catch {
          return showMessage("Некорректный JSON для items!", "error");
        }
      }

      if (Object.keys(dto).length === 0) {
        return showMessage("Нужно указать хотя бы одно поле для обновления!", "error");
      }

      const res = await apiRequest(`${apiBase}/${id}`, "PATCH", dto);
      if (res) showMessage("Заказ обновлён!", "success");
    });
  }

  const deleteBtn = document.getElementById("deleteOrderBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = document.getElementById("deleteId").value.trim();
      if (!id) return showMessage("Введите ID заказа!", "error");

      const res = await apiRequest(`${apiBase}/${id}`, "DELETE");
      if (res) showMessage("Заказ удалён!", "success");
    });
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      window.location.href = "/"; // TODO
    });
  }
});

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: "3000"
};

const eventSource = new EventSource("/api/orders/events");

eventSource.onmessage = function (event) {
  try {
    const payload = JSON.parse(event.data);
    if (payload.type === "created") {
      toastr.success(`Новый заказ создан: ID ${payload.data.id}`);
    } else if (payload.type === "updated") {
      toastr.info(`Заказ обновлён: ID ${payload.data.id}, статус: ${payload.data.status}`);
    } else if (payload.type === "removed") {
      toastr.warning(`Заказ удалён (id: ${payload.data.id})`);
    }
  } catch (err) {
    console.error("Ошибка обработки SSE:", err);
  }
};

eventSource.onerror = function () {
  toastr.error("Потеряна связь с сервером SSE для заказов");
};
