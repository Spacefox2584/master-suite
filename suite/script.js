// 🔑 Supabase connection
const supabaseUrl = "https://qbfppzfxwgklsvjogyzy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZnBwemZ4d2drbHN2am9neXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDQyNDUsImV4cCI6MjA3NDEyMDI0NX0.PIiVc0ZPLKS2bvNmWTXynfdey30KhqPUTDkXYMp1qRs";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  await loadTools();
  setupUI();
  loadChangelog();
});

// Load tools.json dynamically into nav
async function loadTools() {
  const res = await fetch("tools.json");
  const tools = await res.json();
  const navTools = document.getElementById("nav-tools");

  tools.forEach(tool => {
    const btn = document.createElement("button");
    btn.textContent = tool.name;
    btn.onclick = () => loadTool(tool.id, btn);
    navTools.appendChild(btn);
  });

  // Select the first tool by default
  if (tools.length > 0) loadTool(tools[0].id, navTools.firstChild);
}

function loadTool(toolId, btn) {
  // Hide all tool iframes
  document.querySelectorAll(".tool-frame").forEach(frame => frame.classList.add("hidden"));

  // Show the selected one
  const frame = document.getElementById(`${toolId}-frame`);
  if (frame) frame.classList.remove("hidden");

  // Update nav highlight
  document.querySelectorAll("#nav-tools button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

// UI setup
function setupUI() {
  const toggle = document.getElementById("themeToggle");
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  document.getElementById("changelogBtn").onclick = () => openModal("changelogModal");
  document.getElementById("suggestBtn").onclick = () => openModal("suggestModal");
  document.getElementById("submitSuggestion").onclick = submitSuggestion;
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// Changelog
async function loadChangelog() {
  const { data, error } = await supabase.from("changelog").select("*").order("timestamp", { ascending: false });
  if (error) {
    console.error("Failed to load changelog", error);
    return;
  }
  const list = document.getElementById("changelogList");
  list.innerHTML = "";
  data.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.version} - ${entry.description} (${new Date(entry.timestamp).toLocaleString()})`;
    list.appendChild(li);
  });
}

// Suggest Tool
async function submitSuggestion() {
  const text = document.getElementById("suggestText").value.trim();
  if (!text) return alert("Please enter a suggestion");

  const { error } = await supabase.from("tool_suggestions").insert([{ suggestion: text }]);
  if (error) {
    alert("Error submitting suggestion: " + error.message);
  } else {
    alert("Suggestion submitted!");
    document.getElementById("suggestText").value = "";
    closeModal("suggestModal");
  }
}
