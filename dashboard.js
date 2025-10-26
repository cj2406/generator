const departmentSelect = document.getElementById("department-select");
const courseSection = document.getElementById("course-section");
const courseList = document.getElementById("course-list");
const deptName = document.getElementById("dept-name");

// Define available departments & courses
const departmentCourses = {
  cs: [
    { code: "CSC-101", units: 2 },
    { code: "CSC-201", units: 3 },
    { code: "CSC-301", units: 2 },
    { code: "MTH-102", units: 2 },
    { code: "GST-221", units: 2 },
  { code: "IFT-213", units: 3 },
  { code: "SEN-203", units: 2 },
  { code: "MTH-202", units: 1 },
  { code: "PHY-104", units: 2 }


  ],
  math: [
    { code: "MTH-101", units: 2 },
    { code: "MTH-202", units: 3 },
    { code: "STA-203", units: 2 },
  ],
  eng: [
    { code: "ENG-101", units: 3 },
    { code: "ENG-203", units: 2 },
    { code: "PHY-201", units: 2 },
  ],
  bio: [
    { code: "BIO-101", units: 3 },
    { code: "BIO-202", units: 2 },
    { code: "CHE-203", units: 2 },
  ],
};

// When department changes
departmentSelect.addEventListener("change", () => {
  const selected = departmentSelect.value;

  if (!selected) {
    courseSection.style.display = "none";
    return;
  }

  const deptText = departmentSelect.options[departmentSelect.selectedIndex].text;
  deptName.textContent = deptText;

  const courses = departmentCourses[selected];
  courseList.innerHTML = "";

  courses.forEach(course => {
    const li = document.createElement("li");
    li.textContent = `${course.code} (${course.units} units)`;
    courseList.appendChild(li);
  });

  courseSection.style.display = "block";

  // Save department and course list for Timetable Generator
  localStorage.setItem("selectedDepartment", deptText);
  localStorage.setItem("selectedCourses", JSON.stringify(courses));

  // Instantly go to timetable page
  setTimeout(() => { 
    window.location.href = "timetable.html";
   },8000)
  
});
