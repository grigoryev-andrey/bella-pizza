document.addEventListener('DOMContentLoaded', function () {
  const categoryButtons = document.querySelectorAll('.category-button');
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = urlParams.get('page') || 1;
  const currentLimit = urlParams.get('limit') || 6;

  function filterDishes(categoryId) {
    categoryButtons.forEach((button) => {
      if (button.getAttribute('data-category') === categoryId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  const pathParts = window.location.pathname.split('/');
  if (pathParts.length > 2 && pathParts[1] === 'menu') {
    const categoryId = pathParts[2];
    if (categoryId) {
      filterDishes(categoryId);
    }
  } else {
    filterDishes('');
  }

  categoryButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const categoryId = this.getAttribute('data-category');
      window.location.href = categoryId
        ? `/menu/${categoryId}?page=1&limit=${currentLimit}`
        : `/menu?page=1&limit=${currentLimit}`;
    });
  });
});
