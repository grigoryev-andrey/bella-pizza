document.addEventListener("DOMContentLoaded", () => {
  const warning = document.getElementById("crud-warning");
  const afterAction = document.getElementById("after-action");
  const viewBtn = document.getElementById("viewBtn");

  const apiBase = "/api/testimonials";

  function showMessage(msg, type = "success") {
    warning.textContent = msg;
    warning.classList.remove("success", "error");
    warning.classList.add(type);
    afterAction.style.display = type === "success" ? "block" : "none";
  }

  function getFormData() {
    const data = {};

    const message = document.getElementById("message").value.trim();
    const rating = document.getElementById("rating").value.trim();
    const userId = document.getElementById("userId").value.trim();

    if (message) data.message = message;
    if (rating) data.rating = Number(rating);
    if (userId) data.userId = userId;

    return data;
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

  const createBtn = document.getElementById("createBtn");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      const data = {
        message: document.getElementById("message").value,
        rating: Number(document.getElementById("rating").value),
        userId: document.getElementById("userId").value
      };
      const res = await apiRequest(apiBase, "POST", data);
      if (res) {
        const body = await res.json();
        showMessage(`Отзыв создан!\nid: ${body.id}`, "success");
      }
    });
  }

  const updateBtn = document.getElementById("updateBtn");
  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
      const id = document.getElementById("updateId").value.trim();
      if (!id) {
        showMessage("Введите ID отзыва!", "error");
        return;
      }

      const data = getFormData();
      if (Object.keys(data).length === 0) {
        showMessage("Заполните хотя бы одно поле для обновления!", "error");
        return;
      }

      const result = await apiRequest(`${apiBase}/${id}`, "PATCH", data);
      if (result) showMessage(`Отзыв обновлён!`, "success");
    });
  }

  const deleteBtn = document.getElementById("deleteBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = document.getElementById("deleteId").value;
      if (!id) {
        showMessage("Введите ID!", "error");
        return;
      }
      const res = await apiRequest(`${apiBase}/${id}`, "DELETE");
      if (res) showMessage("Отзыв удалён!", "success");
    });
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      window.location.href = "/";
    });
  }
});

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: "3000"
};

const eventSource = new EventSource("/api/testimonials/events");

eventSource.onmessage = function (event) {
  try {
    const payload = JSON.parse(event.data);
    if (payload.type === "created") {
      toastr.success(`Новый отзыв создан: ${payload.data.message.substring(0, 50)}...`);
    } else if (payload.type === "updated") {
      toastr.info(`Отзыв обновлён: ${payload.data.message.substring(0, 50)}...`);
    } else if (payload.type === "removed") {
      toastr.warning(`Отзыв удалён (id: ${payload.data.id})`);
    }
  } catch (err) {
    console.error("Ошибка обработки SSE:", err);
  }
};

eventSource.onerror = function () {
  toastr.error("Потеряна связь с сервером SSE для отзывов");
};