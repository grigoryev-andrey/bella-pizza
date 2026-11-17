document.addEventListener("DOMContentLoaded", () => {
  const warning = document.getElementById("crud-warning");
  const afterAction = document.getElementById("after-action");
  const viewBtn = document.getElementById("viewBtn");

  const apiBase = "/api/menu/categories";

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

  const createBtn = document.getElementById("createCategoryBtn");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      const data = { name: document.getElementById("name").value };
      const res = await apiRequest(apiBase, "POST", data);
      if (res) {
        const body = await res.json();
        showMessage(`Категория создана!\nid: ${body.id}`, "success");
      }
    });
  }

  const updateBtn = document.getElementById("updateCategoryBtn");
  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
      const id = document.getElementById("updateId").value.trim();
      if (!id) {
        showMessage("Введите ID категории!", "error");
        return;
      }

      const name = document.getElementById("name").value.trim();

      const data = {};
      if (name) data.name = name;

      if (Object.keys(data).length === 0) {
        showMessage("Заполните хотя бы одно поле для обновления!", "error");
        return;
      }

      const res = await apiRequest(`${apiBase}/${id}`, "PATCH", data);
      if (res) {
        showMessage("Категория обновлена!", "success");
      }
    });
  }


  const deleteBtn = document.getElementById("deleteCategoryBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = document.getElementById("deleteId").value.trim();
      if (!id) return showMessage("Введите ID!", "error");

      const res = await apiRequest(`${apiBase}/${id}`, "DELETE");
      if (res) showMessage("Категория удалена!", "success");
    });
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      window.location.href = "/menu"
    });
  }
});

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: "3000"
};

const eventSource = new EventSource("/api/menu/events");

eventSource.onmessage = function (event) {
  try {
    const payload = JSON.parse(event.data);

    if (payload.entity === "category") {
      if (payload.type === "created") {
        toastr.success(`Новая категория: ${payload.data.name}`);
      } else if (payload.type === "updated") {
        toastr.info(`Категория обновлена: ${payload.data.name}`);
      } else if (payload.type === "removed") {
        toastr.warning(`Категория удалена (id: ${payload.data.id})`);
      }
    }

  } catch (err) {
    console.error("Ошибка обработки SSE:", err);
  }
};

eventSource.onerror = function () {
  toastr.error("Потеряна связь с сервером SSE");
};
