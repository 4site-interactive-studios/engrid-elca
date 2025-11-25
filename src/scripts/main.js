export const customScript = function (App, EnForm) {
  /*
   * Updates the label of a field to indicate if it is required.
   * @param {HTMLElement} field - The ".en__field" element to update.
   */
  function updateLabel(field) {
    const fieldEl = field.querySelector(".en__field__input");

    let isFieldRequired =
      fieldEl.required ||
      fieldEl.getAttribute("aria-required") === "true" ||
      field.classList.contains("en__mandatory") ||
      fieldEl.closest(".en__component--formblock.i-required");

    const enField = fieldEl.closest(".en__field");
    const enForm = enField?.parentElement;

    if (enForm) {
      // Check if field is required based on its parent's iX-required class
      const index = [...enForm.children].indexOf(enField);
      if (enForm.classList.contains(`i${index + 1}-required`)) {
        isFieldRequired = true;
      }

      // Update the label to reflect the required status
      const labelEl = enField.querySelector(
        ".en__component--formblock:not(.give-by-select) .en__field__label"
      );
      if (labelEl) {
        const label = labelEl.textContent.trim();
        if (isFieldRequired && !label.endsWith("*")) {
          labelEl.textContent = `${label}*`;
        } else if (!isFieldRequired && label.endsWith("*")) {
          labelEl.textContent = label.slice(0, -1);
        }
      }
    }
  }

  // Update the label of each field based on its required status
  const fields = document.querySelectorAll(".en__field");
  fields.forEach((field) => {
    const skipFields = ["en__field--donationAmt", "en__field--recurrfreq"];
    if (
      [...field.classList].some((className) => skipFields.includes(className))
    ) {
      return;
    }

    updateLabel(field);
    const observer = new MutationObserver(() => updateLabel(field));
    observer.observe(field, {
      childList: true,
      subtree: true,
    });
  });

  /*
   * Clears and sets a placeholder for the "Other Amount" input field when it is focused or blurred.
   */
  function handleOtherAmtPlaceholder() {
    const donationFields = document.querySelectorAll(
      ".en__field--donationAmt .en__field__item"
    );

    donationFields.forEach((field) => {
      const input = field.querySelector(
        "input[name='transaction.donationAmt.other']"
      );
      if (input) {
        const placeholder = "Custom Amount";
        input.placeholder = placeholder;
        input.addEventListener("focusin", function () {
          this.placeholder = "";
        });
        input.addEventListener("focusout", function () {
          if (!this.value && isVisuallyEmpty(this)) {
            this.placeholder = placeholder;
          }
        });
      }
    });
  }

  function isVisuallyEmpty(input) {
    // Check if the ::before pseudo-element has visible content
    const beforeContent = window
      .getComputedStyle(input, "::before")
      .getPropertyValue("content");
    return (
      beforeContent === "none" ||
      beforeContent === '""' ||
      beforeContent.trim() === ""
    );
  }

  const targetNode = document.querySelector(".en__field--donationAmt");
  if (targetNode) {
    const observer = new MutationObserver(handleOtherAmtPlaceholder);
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });
    handleOtherAmtPlaceholder();
  }

  // Add upsell message below the recurring selector
  const upsell = document.querySelector(".upsell-message");
  const recurrField = document.querySelector(".en__field--recurrfreq");
  if (upsell && recurrField) {
    // Inserting it at the end and using CSS to handle order to prevent disrupting i-X field helpers
    recurrField.parentElement?.insertAdjacentElement("beforeend", upsell);
  }

  /**
   * Function to rearrange eCard related elements on the page.
   * Moves .en__ecarditems__action to come after .en__ecardmessage and
   * moves .en__ecardrecipients__futureDelivery to come after .en__ecardrecipients.
   */
  function rearrangeEcardElements() {
    // Get the elements
    const ecardItemsAction = document.querySelector(".en__ecarditems__action");
    const ecardMessage = document.querySelector(".en__ecardmessage");
    const ecardRecipientsFutureDelivery = document.querySelector(
      ".en__ecardrecipients__futureDelivery"
    );
    const ecardRecipients = document.querySelector(".en__ecardrecipients");

    // Move .en__ecarditems__action so it comes after .en__ecardmessage
    if (ecardItemsAction && ecardMessage) {
      ecardMessage.insertAdjacentElement("afterend", ecardItemsAction);
    }

    // Move .en__ecardrecipients__futureDelivery so it comes after .en__ecardrecipients
    if (ecardRecipientsFutureDelivery && ecardRecipients) {
      ecardRecipients.insertAdjacentElement(
        "afterend",
        ecardRecipientsFutureDelivery
      );
    }
  }

  // Call the function
  rearrangeEcardElements();

  // On eCard pages, change the label of the "Add contact" button
  const ecardAddRecipeintButton = document.querySelector(
    ".en__ecarditems__addrecipient"
  );

  if (ecardAddRecipeintButton) {
    ecardAddRecipeintButton.textContent = "Add recipient";
  }

  // On eCard pages, add a label to the recipients list
  const ecardRecipientList = document.querySelector(
    ".en__ecardrecipients__list"
  );

  if (ecardRecipientList) {
    const label = document.createElement("h2");
    label.textContent = "Recipients list";
    label.id = "recipients-list-label";
    label.setAttribute("for", "en__ecardrecipients__list");
    ecardRecipientList.setAttribute("aria-labelledby", "recipients-list-label");

    ecardRecipientList.parentNode.insertBefore(label, ecardRecipientList);
  }

  //On eCard pages, move the "Add recipients" button out of its current wrapper and add supporting button classes
  const addRecipientButton = document.querySelector(
    ".en__ecarditems__addrecipient"
  );
  const emailDiv = document.querySelector(".en__ecardrecipients__email");

  if (addRecipientButton && emailDiv) {
    addRecipientButton.classList.add("button");
    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("en__ecardrecipients__button");

    // Remove the button from its current position
    addRecipientButton.parentNode.removeChild(addRecipientButton);

    // Wrap the button with the new div
    wrapperDiv.appendChild(addRecipientButton);

    // Insert the wrapped button after the email div
    emailDiv.parentNode.insertBefore(wrapperDiv, emailDiv.nextSibling);
  }

  // On eCard pages, when the "Add recipients" button is clicked, remove any values in the Add Recipient Name and Email field
  // Hide the recipients list header and list until there are recipients added
  // On eCard pages, simulate full field errors on the eCard Recipient name field and email field

  const addRecipientButton2 = document.querySelector(
    ".en__ecarditems__addrecipient"
  );
  const nameInput = document.querySelector(".en__ecardrecipients__name input");
  const emailInput = document.querySelector(
    ".en__ecardrecipients__email input"
  );
  const recipientsList = document.querySelector(".en__ecardrecipients__list");
  const recipientsListLabel = document.querySelector("#recipients-list-label");
  const emailParent = document.querySelector(".en__ecardrecipients__email");
  const nameParent = document.querySelector(".en__ecardrecipients__name");

  if (
    addRecipientButton2 &&
    nameInput &&
    emailInput &&
    recipientsList &&
    recipientsListLabel &&
    emailParent &&
    nameParent
  ) {
    let previousRecipientCount = document.querySelectorAll(
      ".en__ecardrecipients__recipient .ecardrecipient__email"
    ).length;

    const clearInputs = () => {
      let currentRecipientCount = document.querySelectorAll(
        ".en__ecardrecipients__recipient .ecardrecipient__email"
      ).length;

      if (currentRecipientCount > previousRecipientCount) {
        nameInput.value = "";
        emailInput.value = "";
      }

      previousRecipientCount = currentRecipientCount;
    };

    addRecipientButton2.addEventListener("click", clearInputs);
    addRecipientButton2.addEventListener("touchend", clearInputs);
    addRecipientButton2.addEventListener("keydown", clearInputs);

    const toggleElementsVisibility = () => {
      const displayValue = recipientsList.innerHTML.trim() ? "block" : "none";
      recipientsListLabel.style.display = displayValue;
      recipientsList.style.display = displayValue;
    };

    // Initially set the visibility of the label and the recipients list
    toggleElementsVisibility();

    // Create a MutationObserver instance to monitor changes in the content of the recipients list
    const listObserver = new MutationObserver(toggleElementsVisibility);

    // Start observing the recipients list for changes in its content
    listObserver.observe(recipientsList, { childList: true, subtree: true });

    const toggleValidationClass = (element, parent) => (mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          if (element.classList.contains("invalid")) {
            parent.classList.add("en__field--validationFailed");
          } else {
            parent.classList.remove("en__field--validationFailed");
          }
        }
      }
    };

    // Create MutationObserver instances to monitor changes in the input's attributes
    const inputObserver1 = new MutationObserver(
      toggleValidationClass(emailInput, emailParent)
    );
    const inputObserver2 = new MutationObserver(
      toggleValidationClass(nameInput, nameParent)
    );

    // Start observing the inputs for changes in their attributes
    inputObserver1.observe(emailInput, { attributes: true });
    inputObserver2.observe(nameInput, { attributes: true });
  }

  /**
   * Handles dynamic visibility of donation dedication fields.
   *
   * When "Dedicate this donation" is checked, the honoree and notification sections appear.
   * When it’s unchecked, all related fields (including notification options) are hidden and reset.
   * Also ensures no errors occur if any expected elements are missing in the DOM.
   */
  const dedicateCheckbox = document.querySelector(
    "#en__field_transaction_inmem"
  );
  const notifyYesRadio = document.querySelector(
    "#en__field_supporter_NOT_TAGGED_971"
  );
  const notifyNoRadio = document.querySelector(
    "#en__field_supporter_NOT_TAGGED_970"
  );
  const notifySections = document.querySelectorAll(
    ".engrid__supporterNOT_TAGGED_97-Paper"
  );

  function updateDedicationFields() {
    const isDedicated = dedicateCheckbox.checked;

    if (!isDedicated) {
      notifyYesRadio.checked = false;
      notifyNoRadio.checked = true;
      notifySections.forEach((section) => {
        section.style.display = "none";
      });
    }
  }

  function updateNotifyFields() {
    if (notifyYesRadio.checked && dedicateCheckbox.checked) {
      notifySections.forEach((section) => {
        section.style.display = "block";
      });
    } else {
      notifySections.forEach((section) => {
        section.style.display = "none";
      });
    }
  }

  if (
    dedicateCheckbox &&
    notifyYesRadio &&
    notifyNoRadio &&
    notifySections.length > 0
  ) {
    dedicateCheckbox.addEventListener("change", updateDedicationFields);
    notifyYesRadio.addEventListener("change", updateNotifyFields);
    notifyNoRadio.addEventListener("change", updateNotifyFields);

    updateDedicationFields();
    updateNotifyFields();
  }

  /*  Start EN: In Honor / In Memory UI sync
    Behavior
    - On load, read checkbox name="transaction.inmem".
    - If checked and no radio in name="transaction.othamt4" is selected, select the first enabled radio.
    - If unchecked, clear all radios.
    - When radios change, update label and placeholder of #en__field_transaction_honname:
        * in-honor   -> "Person to be Honored"
        * in-memory  -> "Person to be Remembered"
      When none selected, restore the original label/placeholder captured at init.
  */

  (function () {
    const SEL = {
      inMemCheckbox: 'input[name="transaction.inmem"]',
      tributeRadios: 'input[name="transaction.othamt4"]',
      honInput: "#en__field_transaction_honname",
      honLabel: 'label[for="en__field_transaction_honname"]',
    };

    const COPY = {
      honor: {
        label: "Person to be Honored",
        placeholder: "Person to be Honored",
      },
      memory: {
        label: "Person to be Remembered",
        placeholder: "Person to be Remembered",
      },
    };

    const log = (message) => {
      if (typeof App !== "undefined" && typeof App.log === "function") {
        App.log("[inmem] " + message);
      }
    };

    const $inMem = document.querySelector(SEL.inMemCheckbox);
    const $radios = Array.from(document.querySelectorAll(SEL.tributeRadios));
    const $honInput = document.querySelector(SEL.honInput);
    const $honLabel = document.querySelector(SEL.honLabel);

    if (!$inMem || $radios.length === 0 || !$honInput || !$honLabel) {
      log(
        "Required elements missing | Data: ",
        JSON.stringify({
          hasCheckbox: !!$inMem,
          radios: $radios.length,
          hasInput: !!$honInput,
          hasLabel: !!$honLabel,
        })
      );
      return;
    }

    const ORIGINAL = {
      label: $honLabel.textContent.trim(),
      placeholder: $honInput.getAttribute("placeholder") || "",
    };

    function getSelectedRadio() {
      return $radios.find((r) => r.checked);
    }

    function firstEnabledRadio() {
      return $radios.find((r) => !r.disabled);
    }

    function setRadioChecked(radio, checked) {
      if (!radio || radio.disabled) return;
      if (radio.checked === checked) return;
      radio.checked = checked;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function clearAllRadios() {
      $radios.forEach((r) => {
        if (r.checked) {
          r.checked = false;
          r.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }

    function updateHonField(mode) {
      if (mode === "in-honor") {
        $honLabel.textContent = COPY.honor.label;
        $honInput.setAttribute("placeholder", COPY.honor.placeholder);
        log("Hon field set for honor");
      } else if (mode === "in-memory") {
        $honLabel.textContent = COPY.memory.label;
        $honInput.setAttribute("placeholder", COPY.memory.placeholder);
        log("Hon field set for memory");
      } else {
        $honLabel.textContent = ORIGINAL.label;
        $honInput.setAttribute("placeholder", ORIGINAL.placeholder);
        log("Hon field restored to original");
      }
    }

    function syncFromState() {
      log("Sync start | Data: " + JSON.stringify({ inMem: $inMem.checked }));
      if ($inMem.checked) {
        let selected = getSelectedRadio();
        if (!selected) {
          const first = firstEnabledRadio();
          if (first) {
            log(
              "No radio selected, selecting first enabled | Data: " +
                first.value
            );
            setRadioChecked(first, true);
            selected = first;
          }
        }
        updateHonField(selected ? selected.value : null);
      } else {
        log("Checkbox off, clearing radios and restoring field");
        clearAllRadios();
        updateHonField(null);
      }
    }

    $inMem.addEventListener("change", syncFromState);

    $radios.forEach((r) => {
      r.addEventListener("change", function (e) {
        if (e.target.checked) {
          updateHonField(e.target.value);
        } else if (!$radios.some((x) => x.checked)) {
          updateHonField(null);
        }
      });
    });

    syncFromState();
  })();
  /*  End EN: In Honor / In Memory UI sync */

  /* 
    Start Split Gift
      Handle Input Defaults and Reset Behavior
    
    Behavior:
    - Loop through the Split Gift number inputs and set value to 0.00 if empty
    - Add step="0.01" and min="0" to those number inputs 
    - If one of those number inputs looses focus, and has no value, set it to 0.00
    - If the user deselects the Split Gift checkbox, set the now hidden number input values to 0.00
  */
  const splitGiftNumberInputs = document.querySelectorAll(
    ".engrid__supporterquestions401021-Y input[type='number']"
  );
  splitGiftNumberInputs.forEach((input) => {
    input.setAttribute("step", "0.01");
    input.setAttribute("min", "0");
    if (
      (input.value || "").trim() === "" ||
      (input.value || "0").trim() === "0"
    ) {
      input.value = "0.00";
      input.setAttribute("data-value", "0.00");
    }
    input.addEventListener("blur", function () {
      if ((this.value || "").trim() === "") {
        this.value = "0.00";
        this.setAttribute("data-value", "0.00");
      }
    });
  });
  const splitGiftCheckbox = document.querySelector(
    "#en__field_supporter_questions_401021"
  );
  if (splitGiftCheckbox) {
    splitGiftCheckbox.addEventListener("change", function () {
      if (!this.checked) {
        splitGiftNumberInputs.forEach((input) => {
          input.value = "0.00";
          input.setAttribute("data-value", "0.00");
        });
      }
    });
  }
  /* End Split Gift  */
};
