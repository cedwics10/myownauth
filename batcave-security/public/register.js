const form = document.getElementById('register-form');
const message = document.getElementById('message');

function showMessage(text, type) {
  message.textContent = text;
  message.className = `alert mt-3 alert-${type}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = form.username.value;
  const password = form.password.value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.message || 'Inscription refusée.', 'danger');
      return;
    }
    showMessage(data.message, 'success');
    form.reset();
  } catch {
    showMessage('Serveur injoignable.', 'danger');
  }
});
