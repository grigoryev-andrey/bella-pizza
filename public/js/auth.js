supertokens.init({
  appInfo: {
    appName: 'bella-pizza',
    apiDomain: window.location.origin,
    websiteDomain: window.location.origin,
    apiBasePath: '/api',
    websiteBasePath: '/auth',
  },
  recipeList: [supertokensEmailPassword.init(), supertokensSession.init()],
});

document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.querySelector('.login-button');
  const crudButton = document.querySelector('.main-crud-button');

  const authModal = document.getElementById('auth-modal');
  const modalClose = document.querySelector('.modal-close');
  const modalTitle = document.getElementById('modal-title');
  const nameGroup = document.getElementById('name-group');
  const submitButton = document.getElementById('submit-button');
  const switchText = document.getElementById('switch-text');
  const authForm = document.getElementById('auth-form');

  const nameInput = document.getElementById('name-input');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');

  const userInfo = document.getElementById('user-info');
  const userName = document.getElementById('user-name');
  const logoutButton = document.getElementById('logout-button');

  loginButton.addEventListener('click', () => {
    authModal.classList.remove('hidden');
    setAuthMode('login');
  });

  logoutButton.addEventListener('click', async () => {
    await supertokensEmailPassword.signOut();
    updateUserInterface(null);
    await refreshAddToCartButtons();
    toastr.success('Вы вышли из системы');
  });

  modalClose.addEventListener('click', () => {
    authModal.classList.add('hidden');
    clearForm();
  });

  const switchLink = document.createElement('a');
  switchLink.href = '#';
  const switchPrefix = document.createElement('span');
  switchText.appendChild(switchPrefix);
  switchText.appendChild(switchLink);

  function setAuthMode(mode) {
    if (mode === 'login') {
      modalTitle.textContent = 'Вход';
      nameGroup.classList.add('hidden');
      submitButton.textContent = 'Войти';
      switchPrefix.textContent = 'Нет аккаунта? ';
      switchLink.textContent = 'Зарегистрироваться';
    } else {
      modalTitle.textContent = 'Регистрация';
      nameGroup.classList.remove('hidden');
      submitButton.textContent = 'Зарегистрироваться';
      switchPrefix.textContent = 'Уже есть аккаунт? ';
      switchLink.textContent = 'Войти';
    }
  }

  switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    setAuthMode(modalTitle.textContent === 'Вход' ? 'register' : 'login');
  });

  function clearForm() {
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  }

  function isAdmin(user) {
    return user && user.role && user.role.toLowerCase() === 'admin';
  }

  function updateUserInterface(user) {
    if (user) {
      userName.textContent = user.name;
      userInfo.classList.remove('hidden');
      loginButton.classList.add('hidden');

      if (isAdmin(user)) {
        crudButton.classList.remove('hidden');
        crudButton.classList.add('admin-active');
        userName.classList.add('admin-user');
      } else {
        crudButton.classList.add('hidden');
        crudButton.classList.remove('admin-active');
        userName.classList.remove('admin-user');
      }
    } else {
      userInfo.classList.add('hidden');
      crudButton.classList.add('hidden');
      crudButton.classList.remove('admin-active');
      loginButton.classList.remove('hidden');
      userName.classList.remove('admin-user');
    }
  }

  async function me() {
    const me = await fetch('/api/users/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await me.json();
  }

  async function fetchUserProfile() {
    try {
      const userMe = await me()
      const userResp = await fetch(`/api/users/${userMe.userId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (userResp.status === 404) {
        console.error(`Desynchronization with SuperTokens: ${userMe.userId}`);
      }
      if (!userResp.ok) return null;
      return await userResp.json();
    } catch (err) {
      console.error('fetchUserProfile error:', err);
      return null;
    }
  }

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      toastr.warning('Введите email и пароль');
      return;
    }

    try {
      let response;
      if (modalTitle.textContent === 'Регистрация') {
        response = await supertokensEmailPassword.signUp({
          formFields: [
            { id: 'email', value: email },
            { id: 'password', value: password },
          ],
        });
        if (response.status === 'OK') {
          let data = {
            id: (await me()).userId,
            email: email,
            name: document.querySelector('#name-input').value,
            role: 'user',
          }
          await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
        }
      } else {
        response = await supertokensEmailPassword.signIn({
          formFields: [
            { id: 'email', value: email },
            { id: 'password', value: password },
          ],
        });
      }

      if (response.status === 'FIELD_ERROR') {
        toastr.error(response.formFields[0].error);
        return;
      }
      if (response.status === 'WRONG_CREDENTIALS_ERROR') {
        toastr.error('Неверный email или пароль');
        return;
      }
      if (response.status === 'OK') {
        const user = await fetchUserProfile()
        updateUserInterface(user);
        refreshAddToCartButtons();
        toastr.success(
          modalTitle.textContent === 'Вход'
            ? 'Вход выполнен успешно!'
            : 'Регистрация выполнена успешно!',
        );
        authModal.classList.add('hidden');
        clearForm();
      }
    } catch (err) {
      console.error('Auth error:', err);
      toastr.error('Ошибка при авторизации');
    }
  });

  (async function initUser() {
    try {
      const hasSession = await supertokensSession.doesSessionExist();
      if (hasSession) {
        const user = await fetchUserProfile();
        updateUserInterface(user);
      }
    } catch (err) {
      console.error('Session check error:', err);
    }
  })();
});
