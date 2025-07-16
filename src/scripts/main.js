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
      const labelEl = enField.querySelector(".en__field__label");
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
    const skipFields = [
      "en__field--donationAmt",
      "en__field--recurrfreq",
    ];
    if ([...field.classList].some((className) => skipFields.includes(className))) {
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
  const upsell = document.querySelector('.upsell-message');
  const recurrField = document.querySelector('.en__field--recurrfreq');
  if (upsell && recurrField) {
    // Inserting it at the end and using CSS to handle order to prevent disrupting i-X field helpers
    recurrField.parentElement?.insertAdjacentElement('beforeend', upsell);
  }
};
