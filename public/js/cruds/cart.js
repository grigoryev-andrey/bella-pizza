document.addEventListener("DOMContentLoaded", () => {
  const warning = document.getElementById("crud-warning");
  const afterAction = document.getElementById("after-action");
  const viewBtn = document.getElementById("viewBtn");

  const apiBase = "/api/carts";

  function showMessage(msg, type = "success") {
    warning.textContent = msg;
    warning.classList.remove("success", "error");
    warning.classList.add(type);
    afterAction.style.display = type === "success" ? "block" : "none";
  }

  async function apiRequest(url, method, data = null) {
    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (data) options.body = JSON.stringify(data);

    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Ошибка " + res.status);
      return res;
    } catch (err) {
      showMessage(err.message, "error");
    }
  }

  const createBtn = document.getElementById("createCartBtn");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      const userId = document.getElementById("userId").value;
      const items = document.getElementById("items").value;
      let parsedItems = [];
      try {
        parsedItems = items ? JSON.parse(items) : [];
      } catch {
        return showMessage("Некорректный JSON в items", "error");
      }

      const result = await apiRequest(apiBase, "POST", { userId, items: parsedItems });
      if (result) showMessage(`Корзина создана! id: ${(await result.json()).id}`, "success");
    });
  }

  const updateBtn = document.getElementById("updateCartBtn");
  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
      const id = document.getElementById("updateId").value.trim();
      if (!id) return showMessage("Введите ID корзины!", "error");

      const userId = document.getElementById("userId").value;
      const items = document.getElementById("items").value;
      let parsedItems = [];
      try {
        parsedItems = items ? JSON.parse(items) : [];
      } catch {
        return showMessage("Некорректный JSON в items", "error");
      }

      const data = {};
      if (userId) data.userId = userId;
      if (parsedItems.length) data.items = parsedItems;

      const res = await apiRequest(`${apiBase}/${id}`, "PATCH", data);
      if (res) showMessage("Корзина обновлена!", "success");
    });
  }

  const deleteBtn = document.getElementById("deleteCartBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = document.getElementById("deleteId").value;
      if (!id) return showMessage("Введите ID!", "error");

      const result = await apiRequest(`${apiBase}/${id}`, "DELETE");
      if (result) showMessage("Корзина удалена!", "success");
    });
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      window.location.href = "/carts";
    });
  }
});

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: "3000"
};

const eventSource = new EventSource("/api/carts/events");

eventSource.onmessage = function (event) {
  try {
    const payload = JSON.parse(event.data);
    if (payload.type === "created") {
      toastr.success(`Новая корзина создана (id: ${payload.data.id})`);
    } else if (payload.type === "updated") {
      toastr.info(`Корзина обновлена (id: ${payload.data.id})`);
    } else if (payload.type === "removed") {
      toastr.warning(`Корзина удалена (id: ${payload.data.id})`);
    } else if (payload.type === "item_added") {
      toastr.success(`В корзину добавлен товар (cartId: ${payload.data.id})`);
    } else if (payload.type === "item_updated") {
      toastr.info(`Товар в корзине обновлён (id: ${payload.data.id})`);
    } else if (payload.type === "item_removed") {
      toastr.warning(`Товар удалён из корзины (itemId: ${payload.data.itemId})`);
    }
  } catch (err) {
    console.error("Ошибка обработки SSE:", err);
  }
};

eventSource.onerror = function () {
  toastr.error("Потеряна связь с сервером SSE");
};
