import { wallconParser, coreParser } from "./parseEmail";
import "./index.css";

let company = "core";

// Function to change the selected tab to wallcon
document.querySelector(".wallconTab").addEventListener("click", function (event) {
  // Set the company to wallcon
  company = "wallcon";

  // Clear all fields
  document.querySelector("textarea").value = "";
  resetAllForms();

  // Make core tab inactive
  document.querySelector(".coreTab").classList.remove("is-active");
  document.querySelector("#core").classList.add("hidden-tab");
  // Make wallcon tab active
  document.querySelector(".wallconTab").classList.add("is-active");
  document.querySelector("#wallcon").classList.remove("hidden-tab");
});

// Function to change the selected tab to core
document.querySelector(".coreTab").addEventListener("click", function (event) {
  // Set the company to core
  company = "core";

  // Clear all fields
  document.querySelector("textarea").value = "";
  resetAllForms();

  // Make wallcon tab active
  document.querySelector(".wallconTab").classList.remove("is-active");
  document.querySelector("#wallcon").classList.add("hidden-tab");
  // Make core tab inactive
  document.querySelector(".coreTab").classList.add("is-active");
  document.querySelector("#core").classList.remove("hidden-tab");
});

// Textarea onChange event
document.querySelector("textarea").addEventListener("input", function (event) {
  // Reset form on textarea changes
  document.querySelector(".validate").setAttribute("style", "color: black");
  document.querySelector(".email-error").setAttribute("hidden", true);
  resetAllForms();

  const email = event.target.value;
  let fields = {};

  try {
    if (company === "core") {
      fields = coreParser(email);
    } else {
      fields = wallconParser(email);
      // console.log(fields);
    }
  } catch (error) {
    console.error(error);
    return;
  }

  // Update the fields in the UI
  for (const key in fields) {
    let _key = key;
    if (key.includes("Method of Placement")) _key = "Method of Placement";

    if (fields.hasOwnProperty(key)) {
      // console.log(_key);
      const element = document.querySelector(`[id="${company}"] [name="${_key}"]`);
      if (element) {
        element.value = fields[key];
      }
    }
  }
});

// Validate Button onClick event
document.querySelector(".validate").addEventListener("click", function () {
  validateFields();
});

// input onChange event
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", function () {
    validateFields();
  });
});

// Run Button onClick event
document.querySelector(".run").addEventListener("click", function () {
  document.querySelector(".run").setAttribute("disabled", true);
  document.querySelector(".run").setAttribute("style", "color: black");
  document.querySelector(".validate").setAttribute("style", "color: black");

  submitOrder();
});

// Function to submit the order
async function submitOrder() {
  const fields = document.querySelectorAll(`[id=${company}] input`);
  const values = [];

  fields.forEach((field) => {
    const value = field.value;
    const name = field.name;
    values.push({ name, value });
  });

  window.api.submitOrder(values).then((result) => {
    console.log(result); // Output: Processed: Hello from Renderer!
  });
}

// Function to validate all fields
function validateFields() {
  document.querySelector(".run").setAttribute("disabled", true);
  const inputs = document.querySelectorAll(`[id=${company}] input`);
  let isValid = true;

  inputs.forEach((input) => {
    if (input.value.trim() === "") {
      isValid = false;
    }
  });

  if (isValid) {
    document.querySelector(".validate").setAttribute("style", "color: green");
    document.querySelector(".email-error").setAttribute("hidden", true);
    document.querySelector(".run").removeAttribute("disabled");
    document.querySelector(".run").setAttribute("style", "color: blue");
  } else {
    document.querySelector(".email-error").removeAttribute("hidden");
    document.querySelector(".validate").setAttribute("style", "color: red");
  }
}

// Function to reset all forms
function resetAllForms() {
  document.querySelector(".validate").setAttribute("style", "color: black");
  document.querySelector(".email-error").setAttribute("hidden", true);
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.value = "";
  });
}

// FOR TESTING ONLY
document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    document.querySelector("textarea").value = `
Customer Information
Customer Name

Fiesta Concrete
Requested Ship Date

03/04/2024
Requested Ship Time

08:00 am
Phone

(623) 696-6759
Email

rdearth@fiesta-az.com<mailto:rdearth@fiesta-az.com>
Job
Address

Ironwood and Ray rd
Apache Junction AZ
Map It<https://maps.google.com/maps?q=3DIronwood+and+Ray+rd+Apache+Junction=
+AZ>
Job Contact Name

Elmer
Phone Number

(623) 518-8144
Product
Strength (PSI)

MAG A
Quantity

22yds
Usage

Flatwork
Slump

7"
Type of Mesh

Micro Fiber: Mitigate Plastic Shrinkage Cracking
Schedule
Spacing

45 minutes
Method of Placement (ei. Wheel barrow, Grout pump, Boom pump, machine, chut=
e pour, crane and bucket)

Chute pour
Notes

Monday to Friday same time, location and yardage. Thank you. `;
  }
  document.querySelector("textarea").dispatchEvent(new Event("input"));
};
