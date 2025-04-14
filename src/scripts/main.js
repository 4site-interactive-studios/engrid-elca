export const customScript = function (App, EnForm) {
  const observerConfig = {
    attributes: true,
    attributeFilter: ["placeholder", "aria-required"],
    subtree: true,
  };

  const updatePlaceholder = (field) => {
    if (field.name === "transaction.donationAmt.other") {
      return; // Exclude specific field
    }

    const isFieldRequired =
      field.required ||
      field.getAttribute("aria-required") === "true" ||
      field.closest(".en__component--formblock.i-required");
    const placeholder = field.getAttribute("placeholder");

    if (placeholder) {
      if (isFieldRequired && !placeholder.endsWith("*")) {
        field.setAttribute("placeholder", `${placeholder}*`);
      } else if (!isFieldRequired && placeholder.endsWith("*")) {
        field.setAttribute("placeholder", placeholder.slice(0, -1));
      }
    }
  };

  // Set specific placeholders
  const creditCardField = document.querySelector(
    'input[name="supporter.creditCardHolderName"]'
  );
  if (creditCardField) {
    creditCardField.setAttribute("placeholder", "Card Holder Name");
  }

  const accountHolderField = document.querySelector(
    'input[name="supporter.NOT_TAGGED_79"]'
  );
  if (accountHolderField) {
    accountHolderField.setAttribute("placeholder", "Account Holder's Name");
  }

  // Update required fields
  const fields = document.querySelectorAll(
    "input[placeholder], textarea[placeholder]"
  );
  fields.forEach((field) => {
    updatePlaceholder(field);

    // Observe placeholder and aria-required changes
    const observer = new MutationObserver(() => updatePlaceholder(field));
    observer.observe(field, observerConfig);
  });

  // Add placeholder to the Mobile Phone Field
  let enFieldMobilePhone = document.querySelectorAll(
    "input#en__field_supporter_phoneNumber2"
  )[0];
  if (enFieldMobilePhone) {
    enFieldMobilePhone.placeholder = "Mobile / Phone (Optional)";
  }

  // Function to update placeholders dynamically
  function updatePlaceholders() {
    const donationFields = document.querySelectorAll(
      ".en__field--donationAmt .en__field__item"
    );

    donationFields.forEach((field, index) => {
      const input = field.querySelector(
        "input[name='transaction.donationAmt.other']"
      );

      if (input) {
        const placeholder =
          index === 4 || index === 7 ? "Enter Other Amount" : "Other";

        // Set initial placeholder
        input.placeholder = placeholder;

        // Use focusin to clear placeholder
        input.addEventListener("focusin", function () {
          this.placeholder = ""; // Always clear placeholder on focus
        });

        // Use focusout to restore placeholder only if value and visual content are empty
        input.addEventListener("focusout", function () {
          if (!this.value && isVisuallyEmpty(this)) {
            this.placeholder = placeholder; // Restore only when value and pseudo-content are empty
          }
        });
      }
    });
  }

  // Helper function to check if input is visually empty
  function isVisuallyEmpty(input) {
    // Check if the ::before pseudo-element has visible content
    const beforeContent = window
      .getComputedStyle(input, "::before")
      .getPropertyValue("content");
    return (
      beforeContent === "none" ||
      beforeContent === '""' ||
      beforeContent.trim() === ""
    ); // Adjust based on your styles
  }

  // Set up MutationObserver (same as before)
  const targetNode = document.querySelector(".en__field--donationAmt");
  if (targetNode) {
    const observer = new MutationObserver(updatePlaceholders);

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });

    updatePlaceholders();
  }

  // Function to handle mobile phone number opt-in checkbox
  function setupPhoneOptInCheckbox() {
    // console.log("Setting up mobile phone opt-in checkbox functionality");
    const mobilePhoneInput = document.querySelector(
      'input[name="supporter.phoneNumber2"]'
    );
    const optInCheckbox = document.querySelector(
      'input[name="supporter.questions.829861"]'
    );

    // console.log("Mobile phone input found:", mobilePhoneInput);
    // console.log("Mobile opt-in checkbox found:", optInCheckbox);

    if (mobilePhoneInput && optInCheckbox) {
      // Initial check when page loads
      if (mobilePhoneInput.value && mobilePhoneInput.value.trim() !== "") {
        // console.log("Initial mobile phone value exists, checking opt-in box");
        optInCheckbox.checked = true;
      } else {
        // console.log("No initial mobile phone value, unchecking opt-in box");
        optInCheckbox.checked = false;
      }

      // Add event listeners for input changes
      mobilePhoneInput.addEventListener("input", function () {
        // console.log("Mobile phone input changed:", this.value);
        if (this.value && this.value.trim() !== "") {
          // console.log("Setting mobile opt-in checkbox to checked");
          optInCheckbox.checked = true;
        } else {
          // console.log("Setting mobile opt-in checkbox to unchecked");
          optInCheckbox.checked = false;
        }
      });

      // Also listen for change events (for autofill, etc.)
      mobilePhoneInput.addEventListener("change", function () {
        // console.log("Mobile phone input change event:", this.value);
        if (this.value && this.value.trim() !== "") {
          // console.log(
          //   "Setting mobile opt-in checkbox to checked (from change event)"
          // );
          optInCheckbox.checked = true;
        } else {
          // console.log(
          //   "Setting mobile opt-in checkbox to unchecked (from change event)"
          // );
          optInCheckbox.checked = false;
        }
      });
    } else {
      // console.log("Could not find mobile phone input or opt-in checkbox");
    }
  }

  // Call the function to set up the mobile phone opt-in checkbox behavior only for multistep forms
  // console.log("Checking if multistep form before initializing phone opt-in");
  if (document.body.getAttribute("data-engrid-subtheme") === "multistep") {
    // console.log(
    //   "Multistep form detected, initializing mobile phone opt-in checkbox setup"
    // );
    setupPhoneOptInCheckbox();
  }
};
