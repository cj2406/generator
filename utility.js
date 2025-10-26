import dayjs from 'https://unpkg.com/dayjs@1.11.11/esm/index.js';

export class Timetable {
  constructor() {
    // Load selected department & courses
    const savedCourses = localStorage.getItem("selectedCourses");
    this.classData = savedCourses
      ? JSON.parse(savedCourses)
      : [
          { code: "GST-221", units: 2, type: "general" },
          { code: "IFT-213", units: 3, type: "computer" },
          { code: "SEN-203", units: 2, type: "engineering" },
          { code: "MTH-202", units: 2, type: "math" },
          { code: "PHY-104", units: 3, type: "science" },
        ];

    this.departmentName = localStorage.getItem("selectedDepartment") || "General";
    this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    this.container = document.querySelector(".timetable-js");
    this.courseFrequency = {};

    // Venue mapping by course type
    this.venues = {
      computer: ["Bucodel Lab 1", "SAT-F201 ", "New-horizon rm 2"],
      engineering: ["Eng Block 1", "Eng Block 2"],
      math: ["Math Lecture Hall 3", "Room 202"],
      science: ["Science Hall 1", "Physics Lab"],
      general: ["Emerald Activity Hall A", "Saphire-Activity Hall ","SAT-A001 ", "SAT-B102 "],
    };
  }

  // --- TIME RANGE ---
  getTimeRange(startHour, units) {
    const start = dayjs().hour(startHour).minute(0);
    const end = start.add(units, "hour");
    return `${start.format("h:mm A")} - ${end.format("h:mm A")}`;
  }

  // --- PICK RANDOM COURSE (no repeats in same day, max 2/week) ---
  pickRandomCourse(usedToday) {
    const shuffled = [...this.classData].sort(() => Math.random() - 0.5);
    for (const cls of shuffled) {
      const weeklyCount = this.courseFrequency[cls.code] || 0;
      if (!usedToday.has(cls.code) && weeklyCount < 2) {
        this.courseFrequency[cls.code] = weeklyCount + 1;
        usedToday.add(cls.code);
        return cls;
      }
    }
    return null;
  }

  // --- GENERATE CLASSES PER DAY (2–4) ---
  generateDayColumns() {
    const classCount = Math.floor(Math.random() * 3) + 2; // 2–4 per day
    let startHour = 8;
    let columns = "";
    const usedToday = new Set();

    for (let i = 0; i < classCount; i++) {
      const cls = this.pickRandomCourse(usedToday);
      if (!cls) {
        columns += `<td></td>`;
        continue;
      }

      // Assign a random venue based on course type
      const venueOptions = this.venues[cls.type] || this.venues.general;
      const venue = venueOptions[Math.floor(Math.random() * venueOptions.length)];
      const timeRange = this.getTimeRange(startHour, cls.units);

      columns += `
        <td>
          <div><strong>${cls.code}</strong></div>
          <div>${timeRange}</div>
          <div>${venue}</div>
        </td>
      `;
      startHour += cls.units;
    }

    // Fill to 4 total
    for (let i = classCount; i < 4; i++) {
      columns += `<td></td>`;
    }

    return columns;
  }

  // --- BUILD TABLE HTML ---
  buildTimetableHTML(id) {
    this.courseFrequency = {};
    let html = `
      <div class="timetable-wrapper spacing" data-id="${id}">
        <div class="timetable-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h3>${this.departmentName.toUpperCase()} Timetable</h3>
          <div>
            <button class="btn-export export" data-id="${id}" >Export</button>
            <button class="btn-delete delete" data-id="${id}" >Delete</button>
          </div>
        </div>
        <table class="timetable" border="1">
          <thead>
            <tr>
              <th>Day</th>
              <th colspan="4">Classes</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.days.forEach(day => {
      html += `
        <tr>
          <td class="day">${day}</td>
          ${this.generateDayColumns()}
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
    return html;
  }

  // --- STORAGE ---
  saveTimetables(timetables) {
    localStorage.setItem("timetables", JSON.stringify(timetables));
  }

  loadTimetables() {
    return JSON.parse(localStorage.getItem("timetables")) || [];
  }

  // --- RENDER ---
  renderAllTimetables() {
    const timetables = this.loadTimetables();
    this.container.innerHTML = "";
    timetables.forEach(tb => {
      this.container.innerHTML += tb.html;
    });
    this.attachHandlers();
  }

  addNewTimetable() {
    const timetables = this.loadTimetables();
    const id = Date.now();
    const html = this.buildTimetableHTML(id);
    timetables.push({ id, html });
    this.saveTimetables(timetables);
    this.renderAllTimetables();
  }

  // --- HANDLERS ---
  attachHandlers() {
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = parseInt(e.target.dataset.id);
        this.deleteTimetable(id);
      });
    });

    document.querySelectorAll(".btn-export").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = parseInt(e.target.dataset.id);
        this.exportTimetable(id);
      });
    });
  }

deleteTimetable(id) {
  let timetables = this.loadTimetables();
  timetables = timetables.filter(tb => tb.id !== id);
  this.saveTimetables(timetables);
  this.renderAllTimetables();
  this.updateCounter(); // ✅ Update the counter immediately
}


  exportTimetable(id) {
    const timetables = this.loadTimetables();
    const selected = timetables.find(tb => tb.id === id);
    if (!selected) return;

    const blob = new Blob([selected.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.departmentName}_Timetable_${id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearAllTimetables() {
    localStorage.removeItem("timetables");
    this.container.innerHTML = "";
  }

  updateCounter() {
  const timetables = this.loadTimetables();
  const counter = document.getElementById("timetable-count");
  if (counter) counter.textContent = `(${timetables.length})`;
}

init() {
  const generateBtn = document.querySelector(".btn-js");
  const clearBtn = document.querySelector(".btn-clear");

  if (generateBtn) generateBtn.addEventListener("click", () => {
    this.addNewTimetable();
    this.updateCounter();
  });

  if (clearBtn) clearBtn.addEventListener("click", () => {
    this.clearAllTimetables();
    this.updateCounter();
  });

  this.renderAllTimetables();
  this.updateCounter(); // ← update count on page load
}

}
