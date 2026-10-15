const USERS_URL = "https://jsonplaceholder.typicode.com/users";

const loadButton = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusMessage = document.getElementById("status");
const usersList = document.getElementById("users-list");

let users = [];

function renderUsers(list) {
  usersList.replaceChildren();

  if (list.length === 0) {
    statusMessage.textContent = filterInput.value.trim()
      ? "No users match your filter."
      : (users.length === 0 ? "No users loaded yet." : "No users to display.");
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach((user) => {
    const item = document.createElement("li");
    item.className = "user-card";

    const name = document.createElement("h2");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.textContent = `Email: ${user.email}`;

    const city = document.createElement("p");
    city.textContent = `City: ${user.address?.city ?? "Not provided"}`;

    const company = document.createElement("p");
    company.textContent = `Company: ${user.company?.name ?? "Not provided"}`;

    item.append(name, email, city, company);
    fragment.appendChild(item);
  });

  usersList.appendChild(fragment);
}

async function loadUsers() {
  loadButton.disabled = true;
  statusMessage.textContent = "Loading users…";
  usersList.replaceChildren();

  try {
    const response = await fetch(USERS_URL);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("The API returned an unexpected response.");
    }

    users = data;
    const query = filterInput.value.trim().toLowerCase();
    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(query)
    );

    statusMessage.textContent = `Loaded ${users.length} users.`;
    renderUsers(filteredUsers);
    if (filteredUsers.length === 0 && query) {
      statusMessage.textContent = "No users match your filter.";
    }
  } catch (error) {
    users = [];
    usersList.replaceChildren();
    statusMessage.textContent = `Error loading users: ${error.message}. Please try again.`;
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  const query = filterInput.value.trim().toLowerCase();
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(query)
  );
  renderUsers(filteredUsers);
});

