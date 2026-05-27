(function () {
  var KEY = 'mkp_auth';
  var PASS = 'solvehardproblems';

  if (localStorage.getItem(KEY) === '1') return;

  var style = document.createElement('style');
  style.textContent = [
    '#mkp-gate {',
    '  position: fixed; inset: 0; z-index: 99999;',
    '  background: #faf7f2;',
    '  display: flex; align-items: center; justify-content: center;',
    '  font-family: "Figtree", sans-serif;',
    '}',
    '#mkp-gate .g-box {',
    '  display: flex; flex-direction: column; align-items: flex-start;',
    '  gap: 0; width: 320px;',
    '}',
    '#mkp-gate .g-label {',
    '  font-size: 11px; font-weight: 600; letter-spacing: 0.1em;',
    '  text-transform: uppercase; color: #767676; margin-bottom: 10px;',
    '}',
    '#mkp-gate .g-row {',
    '  display: flex; width: 100%; gap: 8px;',
    '}',
    '#mkp-gate input {',
    '  flex: 1; height: 44px; padding: 0 14px;',
    '  border: 1px solid #e0d8c8; border-radius: 10px;',
    '  background: #fff; font-size: 16px; font-family: inherit;',
    '  color: #1a1a1a; outline: none;',
    '  transition: border-color 150ms;',
    '}',
    '#mkp-gate input:focus { border-color: #1a1a1a; }',
    '#mkp-gate input.error { border-color: #c0392b; }',
    '#mkp-gate button {',
    '  height: 44px; padding: 0 20px;',
    '  background: #1a1a1a; color: #faf7f2;',
    '  border: none; border-radius: 10px;',
    '  font-size: 15px; font-family: inherit; font-weight: 500;',
    '  cursor: pointer; white-space: nowrap;',
    '  transition: opacity 150ms;',
    '}',
    '#mkp-gate button:hover { opacity: 0.8; }',
    '#mkp-gate .g-error {',
    '  font-size: 12px; color: #c0392b;',
    '  margin-top: 8px; min-height: 16px;',
    '}',
  ].join('');

  document.head.appendChild(style);

  var gate = document.createElement('div');
  gate.id = 'mkp-gate';
  gate.innerHTML = '<div class="g-box">'
    + '<p class="g-label">Password</p>'
    + '<div class="g-row">'
    + '<input type="password" id="mkp-input" autocomplete="off" autofocus spellcheck="false">'
    + '<button id="mkp-submit">Enter</button>'
    + '</div>'
    + '<p class="g-error" id="mkp-error"></p>'
    + '</div>';

  document.body.appendChild(gate);

  var input = gate.querySelector('#mkp-input');
  var error = gate.querySelector('#mkp-error');

  function attempt() {
    if (input.value === PASS) {
      localStorage.setItem(KEY, '1');
      gate.style.opacity = '0';
      gate.style.transition = 'opacity 200ms';
      setTimeout(function () { gate.remove(); }, 200);
    } else {
      error.textContent = 'Incorrect password.';
      input.classList.add('error');
      input.value = '';
      input.focus();
      setTimeout(function () {
        input.classList.remove('error');
        error.textContent = '';
      }, 2000);
    }
  }

  gate.querySelector('#mkp-submit').addEventListener('click', attempt);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') attempt();
  });
})();
