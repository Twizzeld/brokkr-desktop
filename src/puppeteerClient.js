import puppeteer from "puppeteer";
import { core } from "./mappings";
let browser;
let page;

// Get or Create the browser instance
async function getBrowser() {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    defaultViewport: null,
    args: ["--window-size=1200,800", "--window-position=0,0"],
  });

  return browser;
}

/**
 * Return the current page. If the page is not available, it will create a new one.
 */
async function getPage() {
  if (page) return page;

  try {
    if (!browser) browser = await getBrowser();
    page = (await browser.pages())[0];
    return page;
  } catch (error) {
    // For any error, try to close the browser and open a new one
    try {
      if (browser) browser.close();
    } catch (e) {}

    browser = await getBrowser();
    page = (await browser.pages())[0];

    return page;
  }
}

/**
 * Login to the AUJS website
 */
export async function login() {
  const url = process.env.AUJS_URL;
  const username = process.env.AUJS_USERNAME;
  const password = process.env.AUJS_PASSWORD;

  page = await getPage();

  // check if we are already logged in
  const userIcon = await page.$(".fa-user");
  if (userIcon) return;

  await page.goto(url);
  await page.waitForNetworkIdle({ timeout: 5000 });
  await page.locator("#btnLoginOptions").click();
  await page.waitForNetworkIdle({ timeout: 5000 });

  await page.focus('[formcontrolname="database"]');
  await page.keyboard.press("Enter");
  await timeout(500);
  await page.keyboard.press("Enter");

  await page.locator('[formcontrolname="username"]').fill(username);
  await page.locator('[formcontrolname="password"]').fill(password);
  await timeout(500);
  await page.locator("[type=submit]").click();
}

export async function newOrderForm() {
  await page.waitForNetworkIdle({ timeout: 5000 });
  let selector;
  let element;
  // Click on the "Operations" tab
  selector = "xpath///*[contains(text(),' Operations ')]";
  element = await page.locator(selector);
  await element.click();

  // Click on the "Concrete" tab
  selector = "xpath///*[contains(text(),' Concrete ')]";
  element = await page.locator(selector);
  await element.click();

  // Click on the "Order Entry" tab
  selector = "xpath///*[contains(text(),'Order Entry')]";
  element = await page.locator(selector);
  await element.click();
  await page.waitForNetworkIdle({ timeout: 5000 });

  return null;
}

export async function fillOrderForm(order) {
  // Done
  const customerName = order.filter((item) => item.name === "Customer Name")[0].value;
  const customerMap = core["Customer Name"];
  await setComboBox(customerMap.aujs, customerName);

  // const requestedShipDate = order["Requested Ship Date"].value;
  // const shipDateMap = core["Requested Ship Date"];
  // await setTextField(shipDateMap.aujs, requestedShipDate);

  // Done
  const email = order.filter((item) => item.name === "Email")[0].value;
  const emailMap = core["Email"];
  await setTextField(emailMap.aujs, email);

  // Done
  const addressNotes = order.filter((item) => item.name === "Address")[0].value;
  const addressMap = core["AddressNotes"];
  await setTextField(addressMap.aujs, addressNotes);

  const addressField = order.filter((item) => item.name === "Address")[0].value;
  const addressFieldMap = core["AddressField"];
  await setTextField(addressFieldMap.aujs, addressField);

  // // "Phone Number" is part of the Dispatch Notes

  // Done
  const description = order.filter((item) => item.name === "Strength (PSI)")[0].value;
  const descriptionValue = `Description: ${description}`;
  const descriptionMap = core["Strength (PSI)"];
  await setComboBox(descriptionMap.aujs, descriptionValue, 0);

  // Start time can not be set until Concrete Product "Number" is set
  const requestedShipTime = order.filter((item) => item.name === "Requested Ship Time")[0].value;
  const shipTimeMap = core["Requested Ship Time"];
  await setTextField(shipTimeMap.aujs, requestedShipTime);

  // Done
  const quantity = order.filter((item) => item.name === "Quantity")[0].value;
  const quantityMap = core["Quantity"];
  await setTextField(quantityMap.aujs, quantity);

  // Done
  const usage = order.filter((item) => item.name === "Usage")[0].value;
  const usageMap = core["Usage"];
  await setDropdown(usageMap.aujs, usage);

  // Done
  const slump = Number.parseInt(order.filter((item) => item.name === "Slump")[0].value);
  const slumpMap = core["Slump"];
  await timeout(1000); // Not sure why this is needed but it fails to set the value without a delay.
  await setTextField(slumpMap.aujs, slump);

  /* Need to throw notification to user when this fails */
  const typeOfMesh = order.filter((item) => item.name === "Type of Mesh")[0].value;
  const typeOfMeshMap = core["Type of Mesh"];
  await setComboBox(typeOfMeshMap.aujs, typeOfMesh, 1);

  // Done
  const spacing = order.filter((item) => item.name === "Spacing")[0].value;
  const spacingMap = core["Spacing"];
  await setTextField(spacingMap.aujs, spacing);

  /* Manual Entry for the quote field */
  /* Method of Placement not used in AUJS ticket */

  // job number
  /*
   *  This is over-written if Job Number (via the address search) is set. If the Job Number is not set,
   *  the phone number will will be used as entered.
   */
  const phone = order.filter((item) => item.name === "Phone")[0].value;
  const phoneMap = core["Phone"];
  await setTextField(phoneMap.aujs, phone);

  // field notes

  // Done
  // dispatch notes
  const jobContactName = order.filter((item) => item.name === "Job Contact Name")[0].value;
  const phoneNumber = order.filter((item) => item.name === "Phone Number")[0].value;
  const dispatchNotes = `${jobContactName} | ${phoneNumber}`;
  const dispatchMap = core["Dispatch Notes"];
  await setTextField(dispatchMap.aujs, dispatchNotes);

  // console.log(order);
}

async function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setTextField(fieldName, value) {
  console.log("fieldName", fieldName);
  console.log("value", value);
  try {
    const selector = await page.evaluate(
      (name, value) => {
        const textarea = `acs-note[title="${name}"] textarea`;
        const input = `[formcontrolname="${name}"]`;
        const selector = document.querySelector(textarea) ? textarea : input;
        const element = document.querySelector(selector);
        element.value = value;
      },
      fieldName,
      value
    );
  } catch (error) {
    console.error(error);
  } finally {
    await timeout(100);
  }

  return;
}

async function setComboBox(fieldName, value, index = 0) {
  console.log("fieldName", fieldName);
  try {
    const elements = await page.$$(`[formcontrolname="${fieldName}"]`);
    const elementInput = elements[index];
    const ancestor = await page.evaluateHandle(
      (child, ancestorSelector) => {
        return child.closest(ancestorSelector);
      },
      elementInput,
      "mat-form-field"
    );

    // Open the combobox search modal
    const searchIcon = await ancestor.$(".fa-search");
    await searchIcon.click();
    await timeout(1000);

    // Fill the search input
    const filterInput = await page.$(".mat-dialog-content input");
    await filterInput.type(value);
    await filterInput.press("Enter");
    await timeout(1000);

    // Click on the first result
    await page.evaluate(() => {
      document.querySelector(".mat-dialog-content mat-row").click();
    });
  } catch (error) {
    console.error("Error in setComboBox", error);
    // console.error(error);
  } finally {
    await timeout(100);
  }

  return;
}

async function setDropdown(fieldName, value) {
  console.log("fieldName", fieldName);
  try {
    const elementInput = await page.$(`[formcontrolname="${fieldName}"]`);
    const ancestor = await page.evaluateHandle(
      (child, ancestorSelector) => {
        return child.closest(ancestorSelector);
      },
      elementInput,
      "mat-form-field"
    );

    // Open the dropdown list
    const searchIcon = await ancestor.$(".mat-select-arrow");
    await searchIcon.click();
    await timeout(100);

    // Click on the first result
    await page.evaluate((value) => {
      const element = $("mat-option").filter(function () {
        return $(this).text().trim() === value;
      });
      element.click();
    }, value);
  } catch (error) {
    console.error(error);
  } finally {
    await timeout(100);
  }

  return;
}
