document.addEventListener('DOMContentLoaded', ev => {
  const $$ = query => document.querySelectorAll(query);

  const box = $$('#box')[0];
  box.textContent = 'Hello, webpack!';
}, false);
