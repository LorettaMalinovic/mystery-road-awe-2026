import { state } from "../state.js";
import { evidenceMentionsPerson } from "../utils.js";
import { navigateTo } from "../router.js";
import { renderEvidenceList } from "./evidence.js";

export const switchPeopleTab = (tab) => {
  state.currentPeopleTab = tab;
  const peoplePanel = document.getElementById("peoplePanel");
  const locationsPanel = document.getElementById("locationsPanel");
  const peopleTabBtn = document.getElementById("tabPeopleBtn");
  const locationsTabBtn = document.getElementById("tabLocationsBtn");

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");
    locationsPanel.classList.add("hidden");
    peopleTabBtn.classList.add("active");
    locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");
    locationsPanel.classList.remove("hidden");
    peopleTabBtn.classList.remove("active");
    locationsTabBtn.classList.add("active");
  }
};

const countEvidenceForPerson = (person) => {
  let count = 0;
  for (const item of state.allEvidence) {
    if (evidenceMentionsPerson(item, person)) count++;
  }
  return count;
};

export function renderPeople() {
  const container = document.getElementById("peoplePanel");
  let html = "";
  for (const person of state.allPeople) {
    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html += '<img class="person-avatar" src="' + person.avatar + '" alt="Portrait of ' + person.name + '">';
    html += "<div><h3>" + person.name + "</h3><div class=\"person-role\">" + person.role + "</div></div>";
    html += "</div>";
    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    for (const responsibility of person.responsibilities) {
      html += "<li>" + responsibility + "</li>";
    }
    html += "</ul>";
    html += '<div class="person-statement">&ldquo;' + person.statement + '&rdquo;</div>';
    html += "<p>" + count + " related evidence item" + (count === 1 ? "" : "s") + " &mdash; ";
    html += '<button type="button" class="evidence-count-link" data-person-id="' + person.id + '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  const links = container.querySelectorAll(".evidence-count-link");
  for (const link of links) {
    link.addEventListener("click", (e) => {
      const personId = e.target.getAttribute("data-person-id");
      document.getElementById("filterPerson").value = personId;
      navigateTo("evidence");
      setTimeout(() => {
        renderEvidenceList();
      }, 0);
    });
  }
}

export function renderLocations() {
  const container = document.getElementById("locationsPanel");
  let html = "";
  for (const loc of state.allLocations) {
    html += '<div class="location-card">';
    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";
    html += "<p>" + loc.description + "</p>";
    html += "<p><strong>Contains:</strong></p><ul>";
    for (const item of loc.contains) {
      html += "<li>" + item + "</li>";
    }
    html += "</ul></div>";
  }
  container.innerHTML = html;
}

export const setupPeopleListeners = () => {
  document.getElementById("tabPeopleBtn").addEventListener("click", () => switchPeopleTab("people"));
  document.getElementById("tabLocationsBtn").addEventListener("click", () => switchPeopleTab("locations"));
};
