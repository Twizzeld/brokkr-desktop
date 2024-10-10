function wallconParser(email) {
  const trimmedEmail = email.trim();
  const lines = trimmedEmail.split("\n");
  const fieldRegex = /^(.+?)\s*:\s*(.+)$/;
  const fields = {};

  lines.forEach((line) => {
    const match = line.match(fieldRegex);
    if (match) {
      const field = match[1].trim();
      const value = match[2].trim();
      fields[field] = value;
    }
  });

  return fields;
}

function coreParser(email) {
  // Utility function to remove empty lines and specific headers
  const prepareLines = email
    .split("\n")
    .filter(
      (line) =>
        line.trim() !== "" &&
        ![
          "Customer Information",
          "Job",
          "Product",
          "Schedule",
          "Map It",
          "e pour, crane and bucket)",
        ].includes(line.trim())
    );

  // Combine the array into an object
  let newObject = {};

  for (let i = 0; i < prepareLines.length; i += 2) {
    const key = prepareLines[i];
    const value = prepareLines[i + 1];

    // The Address value is a combination of the next two lines
    if (key === "Address") {
      const cityState = prepareLines[i + 2];
      const length = cityState.length;
      const city = cityState.slice(0, length - 3);
      const state = cityState.slice(length - 2, length);
      const addressValue = `${prepareLines[i + 1]}, ${city}, ${state}`;
      newObject[key] = addressValue;
      i += 1; // Skip the next two lines since they are already combined
    } else {
      newObject[key] = value;
    }
  }

  return newObject;
}

export { wallconParser, coreParser };
