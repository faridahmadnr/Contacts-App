const STORAGE_KEYS = {
  USER: "mycontact_user",
  LOGGED_IN: "mycontact_logged_in",
  CONTACTS: "mycontact_contacts",
};

const DEFAULT_USER = { username: "farid", password: "1234" };
const DEFAULT_CONTACTS = [
  { id: 1, name: "Ahmad Rizky", phone: "081234567890" },
  { id: 2, name: "Siti Nurhaliza", phone: "085678901234" },
  { id: 3, name: "Budi Santoso", phone: "082198765432" },
];

const loginScreen = document.getElementById("loginScreen");
const registerScreen = document.getElementById("registerScreen");
const mainScreen = document.getElementById("mainScreen");

const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const fillDemoBtn = document.getElementById("fillDemoBtn");
const goRegisterBtn = document.getElementById("goRegisterBtn");

const registerForm = document.getElementById("registerForm");
const regUsername = document.getElementById("regUsername");
const regPassword = document.getElementById("regPassword");
const regConfirmPassword = document.getElementById("regConfirmPassword");
const goLoginBtn = document.getElementById("goLoginBtn");

const activeUserLabel = document.getElementById("activeUserLabel");
const logoutBtn = document.getElementById("logoutBtn");
const contactList = document.getElementById("contactList");
const addFab = document.getElementById("addFab");
const resetBtn = document.getElementById("resetBtn");

const dialogOverlay = document.getElementById("dialogOverlay");
const dialogTitle = document.getElementById("dialogTitle");
const dialogFormBody = document.getElementById("dialogFormBody");
const dialogConfirmText = document.getElementById("dialogConfirmText");
const contactNameInput = document.getElementById("contactNameInput");
const contactPhoneInput = document.getElementById("contactPhoneInput");
const dialogCancelBtn = document.getElementById("dialogCancelBtn");
const dialogConfirmBtn = document.getElementById("dialogConfirmBtn");
const toastEl = document.getElementById("toast");

let toastTimer = null;
let dialogMode = null; // "add" | "edit" | "delete"
let activeContactId = null;

function seedIfEmpty() {
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(DEFAULT_CONTACTS));
  }
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

function getContacts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACTS)) || [];
  } catch {
    return [];
  }
}

function saveContacts(items) {
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(items));
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2200);
}

function showScreen(screen) {
  for (const s of [loginScreen, registerScreen, mainScreen]) {
    s.classList.remove("active");
  }
  screen.classList.add("active");
}

function renderContacts() {
  const items = getContacts();
  contactList.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No contacts yet. Tap + to add one.";
    contactList.appendChild(empty);
    return;
  }

  for (const contact of items) {
    const row = document.createElement("div");
    row.className = "contact-item";

    const meta = document.createElement("div");
    meta.className = "contact-meta";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = (contact.name[0] || "?").toUpperCase();

    const textWrap = document.createElement("div");
    const nameEl = document.createElement("div");
    nameEl.className = "contact-name";
    nameEl.textContent = contact.name;

    const phoneEl = document.createElement("div");
    phoneEl.className = "contact-phone";
    phoneEl.textContent = contact.phone;

    textWrap.append(nameEl, phoneEl);
    meta.append(avatar, textWrap);

    const actions = document.createElement("div");
    actions.className = "contact-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "chip-btn edit";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditDialog(contact));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "chip-btn delete";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => openDeleteDialog(contact));

    actions.append(editBtn, delBtn);
    row.append(meta, actions);
    contactList.appendChild(row);
  }
}

function enterMain() {
  const user = getUser();
  activeUserLabel.textContent = `Signed in as @${user.username}`;
  renderContacts();
  showScreen(mainScreen);
}

function openAddDialog() {
  dialogMode = "add";
  activeContactId = null;
  dialogTitle.textContent = "Add Contact";
  dialogFormBody.classList.remove("hidden");
  dialogConfirmText.classList.add("hidden");
  contactNameInput.value = "";
  contactPhoneInput.value = "";
  dialogConfirmBtn.textContent = "Save";
  dialogConfirmBtn.className = "dialog-btn primary";
  dialogOverlay.classList.remove("hidden");
  contactNameInput.focus();
}

function openEditDialog(contact) {
  dialogMode = "edit";
  activeContactId = contact.id;
  dialogTitle.textContent = "Edit Contact";
  dialogFormBody.classList.remove("hidden");
  dialogConfirmText.classList.add("hidden");
  contactNameInput.value = contact.name;
  contactPhoneInput.value = contact.phone;
  dialogConfirmBtn.textContent = "Save";
  dialogConfirmBtn.className = "dialog-btn primary";
  dialogOverlay.classList.remove("hidden");
  contactNameInput.focus();
}

function openDeleteDialog(contact) {
  dialogMode = "delete";
  activeContactId = contact.id;
  dialogTitle.textContent = `Delete ${contact.name}?`;
  dialogFormBody.classList.add("hidden");
  dialogConfirmText.classList.remove("hidden");
  dialogConfirmText.textContent = `Are you sure you want to remove ${contact.name} (${contact.phone})?`;
  dialogConfirmBtn.textContent = "Delete";
  dialogConfirmBtn.className = "dialog-btn danger";
  dialogOverlay.classList.remove("hidden");
}

function closeDialog() {
  dialogOverlay.classList.add("hidden");
  dialogMode = null;
  activeContactId = null;
}

dialogCancelBtn.addEventListener("click", closeDialog);

dialogConfirmBtn.addEventListener("click", () => {
  const items = getContacts();

  if (dialogMode === "add") {
    const name = contactNameInput.value.trim();
    const phone = contactPhoneInput.value.trim();
    if (!name || !phone) {
      showToast("Nama dan Nomor Telepon harus diisi");
      return;
    }
    items.push({ id: Date.now(), name, phone });
    saveContacts(items);
    renderContacts();
    closeDialog();
    showToast("Contact saved");
  } else if (dialogMode === "edit") {
    const name = contactNameInput.value.trim();
    const phone = contactPhoneInput.value.trim();
    if (!name || !phone) {
      showToast("Nama dan Phone harus diisi");
      return;
    }
    const updated = items.map((c) => (c.id === activeContactId ? { ...c, name, phone } : c));
    saveContacts(updated);
    renderContacts();
    closeDialog();
    showToast("Contact updated");
  } else if (dialogMode === "delete") {
    const filtered = items.filter((c) => c.id !== activeContactId);
    saveContacts(filtered);
    renderContacts();
    closeDialog();
    showToast("Contact deleted");
  }
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (!username || !password) {
    showToast("Please fill all fields");
    return;
  }

  const saved = getUser();
  if (username === saved.username && password === saved.password) {
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN, "true");
    enterMain();
  } else {
    showToast("Invalid credentials");
  }
});

fillDemoBtn.addEventListener("click", () => {
  const saved = getUser();
  loginUsername.value = saved.username;
  loginPassword.value = saved.password;
  showToast("Demo credentials filled");
});

goRegisterBtn.addEventListener("click", () => {
  showScreen(registerScreen);
});

goLoginBtn.addEventListener("click", () => {
  showScreen(loginScreen);
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = regUsername.value.trim();
  const password = regPassword.value.trim();
  const confirm = regConfirmPassword.value.trim();

  if (!username || !password || !confirm) {
    showToast("Please fill all fields");
    return;
  }

  if (password !== confirm) {
    showToast("Passwords do not match");
    return;
  }

  if (password.length < 4) {
    showToast("Password must be at least 4 characters");
    return;
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ username, password }));
  showToast("Registration successful");
  loginUsername.value = username;
  loginPassword.value = "";
  showScreen(loginScreen);
});

logoutBtn.addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEYS.LOGGED_IN, "false");
  loginPassword.value = "";
  showScreen(loginScreen);
});

addFab.addEventListener("click", openAddDialog);

resetBtn.addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(DEFAULT_CONTACTS));
  localStorage.setItem(STORAGE_KEYS.LOGGED_IN, "false");
  loginUsername.value = "";
  loginPassword.value = "";
  closeDialog();
  showScreen(loginScreen);
  showToast("Demo data reset");
});

seedIfEmpty();
if (localStorage.getItem(STORAGE_KEYS.LOGGED_IN) === "true") {
  enterMain();
} else {
  showScreen(loginScreen);
}
