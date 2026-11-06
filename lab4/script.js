// ===== Daily Task: script.js =====
document.addEventListener('DOMContentLoaded', () => {
  const addForm = document.querySelector('body > form');
  const list = document.querySelector('body > ol');
  const nameInput = document.getElementById('task_name');
  const descInput = document.getElementById('task_description');
  if (!addForm || !list) return;

  /* ---------- Done-state storage (browser localStorage) ---------- */
  const STORE_KEY = 'dailyTasksDone';
  let doneKeys = new Set();
  try { doneKeys = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]')); } catch (_) {}
  const saveDone = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...doneKeys])); } catch (_) {}
  };
  const keyFor = (li) =>
    li.querySelector('.task-name').textContent + '\u0000' + li.querySelector('.task-desc').textContent;

  /* ---------- 1. Page heading with live task count ---------- */
  const header = document.createElement('header');
  header.className = 'page-header';
  header.innerHTML = '<h1>Daily tasks</h1><span class="task-count" aria-live="polite"></span>';
  document.body.insertBefore(header, addForm);
  const countEl = header.querySelector('.task-count');

  /* ---------- 2. Build each task: styled text + checkbox ---------- */
  list.querySelectorAll('li').forEach((li) => {
    // Split "Name: Description" (skipped if PHP already outputs .task-name)
    if (!li.querySelector('.task-name')) {
      const deleteForm = li.querySelector('form');
      const textNode = [...li.childNodes].find(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== ''
      );
      if (!textNode) return;

      const text = textNode.textContent.trim();
      const cut = text.indexOf(': ');
      const body = document.createElement('div');
      body.className = 'task-body';
      body.innerHTML = '<span class="task-name"></span><span class="task-desc"></span>';
      body.querySelector('.task-name').textContent = cut === -1 ? text : text.slice(0, cut);
      body.querySelector('.task-desc').textContent = cut === -1 ? '' : text.slice(cut + 2);

      li.replaceChild(body, textNode);
      if (deleteForm) li.appendChild(deleteForm);
    }

    // Checkbox
    const taskName = li.querySelector('.task-name').textContent;
    const label = document.createElement('label');
    label.className = 'task-check';
    label.innerHTML = '<input type="checkbox"><span class="box" aria-hidden="true"></span>';
    const box = label.querySelector('input');
    box.setAttribute('aria-label', 'Mark "' + taskName + '" as done');

    const key = keyFor(li);
    box.checked = doneKeys.has(key);
    li.classList.toggle('is-done', box.checked);
    li.classList.add('has-check');
    li.prepend(label);

    box.addEventListener('change', () => {
      li.classList.toggle('is-done', box.checked);
      box.checked ? doneKeys.add(key) : doneKeys.delete(key);
      saveDone();
      refresh();
    });
  });

  // Forget saved states for tasks that no longer exist
  const currentKeys = new Set([...list.querySelectorAll('li')].map(keyFor));
  doneKeys = new Set([...doneKeys].filter((k) => currentKeys.has(k)));
  saveDone();

  /* ---------- 3. Task count + empty state ---------- */
  function refresh() {
    const total = list.children.length;
    const done = list.querySelectorAll('li.is-done').length;
    countEl.textContent = total === 0 ? '' : done + ' of ' + total + ' done';

    let empty = document.querySelector('.empty-state');
    if (total === 0 && !empty) {
      empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<strong>No tasks yet</strong>Add your first task above to get started.';
      list.after(empty);
    } else if (total > 0 && empty) {
      empty.remove();
    }
    list.hidden = total === 0;
  }
  refresh();

  /* ---------- 4. Description: auto-grow, counter, Ctrl/Cmd+Enter ---------- */
  if (descInput) {
    const LIMIT = 300;
    descInput.maxLength = LIMIT;

    const hint = document.createElement('span');
    hint.className = 'field-hint';
    descInput.after(hint);

    const update = () => {
      descInput.style.height = 'auto';
      descInput.style.height = descInput.scrollHeight + 'px';
      hint.textContent = descInput.value.length + ' / ' + LIMIT;
    };
    descInput.addEventListener('input', update);
    update();

    descInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addForm.requestSubmit();
    });
  }

  /* ---------- 5. Block whitespace-only entries + double submits ---------- */
  addForm.addEventListener('submit', (e) => {
    const blank = (el) => el && el.value.trim() === '';
    if (blank(nameInput) || blank(descInput)) {
      e.preventDefault();
      (blank(nameInput) ? nameInput : descInput).focus();
      return;
    }
    const btn = addForm.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }
  });

  /* ---------- 6. Styled delete confirmation (replaces window.confirm) ---------- */
  const dialog = document.createElement('dialog');
  dialog.className = 'confirm-dialog';
  dialog.setAttribute('aria-labelledby', 'confirm-title');
  dialog.innerHTML =
    '<form method="dialog">' +
      '<h2 id="confirm-title">Delete this task?</h2>' +
      '<p class="confirm-text"></p>' +
      '<div class="confirm-actions">' +
        '<button type="submit" value="cancel" class="btn-cancel">Keep task</button>' +
        '<button type="submit" value="delete" class="btn-delete">Delete task</button>' +
      '</div>' +
    '</form>';
  document.body.appendChild(dialog);

  function confirmDelete(taskName) {
    return new Promise((resolve) => {
      dialog.querySelector('.confirm-text').textContent =
        '"' + taskName + '" will be removed from your list. This can\u2019t be undone.';
      dialog.returnValue = '';
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'delete'), { once: true });
      dialog.showModal();
      dialog.querySelector('.btn-cancel').focus(); // safest default
    });
  }

  // Click on the dark backdrop closes the dialog
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close('cancel');
  });

  list.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.matches('form') || form.dataset.confirmed) return;

    e.preventDefault();
    const li = form.closest('li');
    const name = li.querySelector('.task-name')?.textContent || 'This task';

    if (!(await confirmDelete(name))) return;

    // form.submit() drops the clicked button's name/value, so add it back
    const btn = form.querySelector('button[name="delete"]');
    if (btn) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = btn.name;
      hidden.value = btn.value;
      form.appendChild(hidden);
    }

    doneKeys.delete(keyFor(li));
    saveDone();

    form.dataset.confirmed = 'true';
    li.classList.add('is-removing');
    setTimeout(() => form.submit(), 200);
  });

  /* ---------- 7. Start with the cursor in the name field ---------- */
  if (nameInput) nameInput.focus();
});