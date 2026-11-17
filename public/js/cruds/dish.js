document.addEventListener('DOMContentLoaded', () => {
  const warning = document.getElementById('crud-warning');
  const afterAction = document.getElementById('after-action');
  const viewBtn = document.getElementById('viewBtn');

  const apiBase = '/api/menu/dishes';

  function showMessage(msg, type = 'success') {
    warning.textContent = msg;
    warning.classList.remove('success', 'error');
    warning.classList.add(type);
    afterAction.style.display = type === 'success' ? 'block' : 'none';
  }

  async function apiRequest(url, method, data = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) options.body = JSON.stringify(data);

    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error('Ошибка ' + res.status);
      return res;
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }

  const createBtn = document.getElementById('createDishBtn');
  if (createBtn) {
    createBtn.addEventListener('click', async () => {
      const data = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: Number(document.getElementById('price').value),
        imageUrl: document.getElementById('imageUrl').value,
        categoryId: document.getElementById('categoryId').value,
      };
      const res = await apiRequest(apiBase, 'POST', data);
      if (res) {
        const body = await res.json();
        showMessage(`Блюдо создано!\nid: ${body.id}`, 'success');
      }
    });
  }

  const updateBtn = document.getElementById('updateDishBtn');
  if (updateBtn) {
    updateBtn.addEventListener('click', async () => {
      const id = document.getElementById('updateId').value.trim();
      if (!id) return showMessage('Введите ID блюда!', 'error');

      const data = {};
      const name = document.getElementById('name').value.trim();
      const description = document.getElementById('description').value.trim();
      const price = document.getElementById('price').value;
      const imageUrl = document.getElementById('imageUrl').value.trim();
      const categoryId = document.getElementById('categoryId').value.trim();

      if (name) data.name = name;
      if (description) data.description = description;
      if (price) data.price = Number(price);
      if (imageUrl) data.imageUrl = imageUrl;
      if (categoryId) data.categoryId = categoryId;

      if (Object.keys(data).length === 0) {
        return showMessage('Заполните хотя бы одно поле!', 'error');
      }

      const res = await apiRequest(`${apiBase}/${id}`, 'PATCH', data);
      if (res) showMessage('Блюдо обновлено!', 'success');
    });
  }

  const deleteBtn = document.getElementById('deleteDishBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const id = document.getElementById('deleteId').value.trim();
      if (!id) return showMessage('Введите ID!', 'error');

      const res = await apiRequest(`${apiBase}/${id}`, 'DELETE');
      if (res) showMessage('Блюдо удалено!', 'success');
    });
  }

  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      window.location.href = '/menu';
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

    if (payload.entity === "dish") {
      if (payload.type === "created") {
        toastr.success(`Новое блюдо: ${payload.data.name}`);
      } else if (payload.type === "updated") {
        toastr.info(`Блюдо обновлено: ${payload.data.name}`);
      } else if (payload.type === "removed") {
        toastr.warning(`Блюдо удалено (id: ${payload.data.id})`);
      }
    }

  } catch (err) {
    console.error("Ошибка обработки SSE:", err);
  }
};

eventSource.onerror = function () {
  toastr.error("Потеряна связь с сервером SSE");
};

