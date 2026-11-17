document.addEventListener('DOMContentLoaded', () => {
  const warning = document.getElementById('crud-warning');
  const afterAction = document.getElementById('after-action');
  const viewBtn = document.getElementById('viewBtn');

  const apiBase = '/api/users';

  function showMessage(msg, type = 'success') {
    warning.textContent = msg;
    warning.classList.remove('success', 'error');
    warning.classList.add(type);
    afterAction.style.display = type === 'success' ? 'block' : 'none';
  }

  function getFormData() {
    const data = {};

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();

    if (name) data.name = name;
    if (email) data.email = email;

    return data;
  }

  async function apiRequest(url, method, data = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) options.body = JSON.stringify(data);

    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error('Ошибка ' + res.status);
      return res;
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }

  const createBtn = document.getElementById('createBtn');
  if (createBtn) {
    createBtn.addEventListener('click', async () => {
      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
      };
      const res = await apiRequest(apiBase, 'POST', data);
      if (res) {
        const body = await res.json();
        showMessage(`Пользователь создан!\nid: ${body.id}`, 'success');
      }
    });
  }

  const updateBtn = document.getElementById('updateBtn');
  if (updateBtn) {
    updateBtn.addEventListener('click', async () => {
      const id = document.getElementById('updateId').value.trim();
      if (!id) {
        showMessage('Введите ID пользователя!', 'error');
        return;
      }

      const data = getFormData();
      if (Object.keys(data).length === 0) {
        showMessage('Заполните хотя бы одно поле для обновления!', 'error');
        return;
      }

      const result = await apiRequest(`${apiBase}/${id}`, 'PATCH', data);
      if (result) showMessage(`Пользователь обновлён!`, 'success');
    });
  }

  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const id = document.getElementById('deleteId').value;
      if (!id) {
        showMessage('Введите ID!', 'error');
        return;
      }
      const res = await apiRequest(`${apiBase}/${id}`, 'DELETE');
      if (res) showMessage('Пользователь удалён!', 'success');
    });
  }

  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      window.location.href = '/'; // TODO
    });
  }
});

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-right",
  timeOut: "3000"
};

const eventSource = new EventSource("/api/users/events");

eventSource.onmessage = function (event) {
  try {
    const payload = JSON.parse(event.data);
    if (payload.type === "created") {
      toastr.success(`Новый пользователь создан: ${payload.data.name}`);
    } else if (payload.type === "updated") {
      toastr.info(`Пользователь обновлён: ${payload.data.name}`);
    } else if (payload.type === "removed") {
      toastr.warning(`Пользователь удалён (id: ${payload.data.id})`);
    }
  } catch (err) {
    console.error("Ошибка обработки SSE:", err);
  }
};

eventSource.onerror = function () {
  toastr.error("Потеряна связь с сервером SSE для пользователей");
};