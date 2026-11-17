document.addEventListener('DOMContentLoaded', function() {
  const entityButtons = document.querySelectorAll('.entity-button');
  const actionButtons = document.querySelectorAll('.action-button');

  entityButtons.forEach(button => {
    button.addEventListener('click', function() {
      const entity = this.getAttribute('data-entity');
      window.location.href = `crud/${entity}`;
    });
  });

  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const action = this.getAttribute('data-entity');
      window.location.href += `/${action}`;
    });
  });
});