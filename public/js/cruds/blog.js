document.addEventListener("DOMContentLoaded", () => {
  const warning = document.getElementById("crud-warning");
  const afterAction = document.getElementById("after-action");
  const viewBtn = document.getElementById("viewBtn");

  const apiBase = "/api/blog-posts";

  function showMessage(msg, type = "success") {
    warning.textContent = msg;
    warning.classList.remove("success", "error");
    warning.classList.add(type);
    afterAction.style.display = type === "success" ? "block" : "none";
  }

  function getFormData() {
    const data = {};

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const author = document.getElementById("author").value.trim();
    const userId = document.getElementById("userId").value.trim();

    if (title) data.title = title;
    if (content) data.content = content;
    if (author) data.author = author;
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
      return await res;
    } catch (err) {
      showMessage(err.message, "error");
    }
  }

  const createBtn = document.getElementById("createBtn");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      const data = {
        title: document.getElementById("title").value,
        content: document.getElementById("content").value,
        author: document.getElementById("author").value,
        userId: document.getElementById("userId").value
      };
      const result = await apiRequest(apiBase, "POST", data);
      if (result) showMessage(`Пост успешно создан!\nid: ${(await result.json()).id}`, "success");
    });
  }

  const updateBtn = document.getElementById("updateBtn");
  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
      const id = document.getElementById("updateId").value.trim();
      if (!id) {
        showMessage("Введите ID поста!", "error");
        return;
      }

      const data = getFormData();
      if (Object.keys(data).length === 0) {
        showMessage("Заполните хотя бы одно поле для обновления!", "error");
        return;
      }

      const res = await apiRequest(`${apiBase}/${id}`, "PATCH", data);
      if (res) {
        showMessage(`Пост обновлён!`, "success");
      }
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
      const result = await apiRequest(`${apiBase}/${id}`, "DELETE");
      if (result) showMessage("Пост успешно удалён!", "success");
    });
  }

  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      window.location.href = "/blog";
    });
  }
});

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: "3000"
};

const eventSource = new EventSource("/api/blog-posts/events");

eventSource.onmessage = function (event) {
  try {
    const payload = JSON.parse(event.data);
    if (payload.type === "created") {
      toastr.success(`Новый пост создан: ${payload.data.title}`);
    } else if (payload.type === "updated") {
      toastr.info(`Пост обновлён: ${payload.data.title}`);
    } else if (payload.type === "removed") {
      toastr.warning(`Пост удалён (id: ${payload.data.id})`);
    }
  } catch (err) {
    console.error("Ошибка обработки SSE:", err);
  }
};

eventSource.onerror = function () {
  toastr.error("Потеряна связь с сервером SSE");
};