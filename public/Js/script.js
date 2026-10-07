// Form validation & Interactive Tax Switch Logic
(() => {
  'use strict'

  // Bootstrap client-side form validation
  const forms = document.querySelectorAll('.needs-validation')
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })

  // Functional Tax Switch Toggle
  const taxSwitch = document.getElementById("flexSwitchCheckDefault");
  if (taxSwitch) {
    // Check saved user preference from localStorage
    const savedTaxPref = localStorage.getItem("nesthunt_show_tax");
    if (savedTaxPref === "true") {
      taxSwitch.checked = true;
      applyTaxToggle(true);
    }

    taxSwitch.addEventListener("change", () => {
      const isChecked = taxSwitch.checked;
      localStorage.setItem("nesthunt_show_tax", isChecked);
      applyTaxToggle(isChecked);
    });
  }

  function applyTaxToggle(showTax) {
    const taxInfoElements = document.querySelectorAll(".tax-info");
    const basePriceElements = document.querySelectorAll(".base-price");
    const priceTaxElements = document.querySelectorAll(".price-tax");

    taxInfoElements.forEach(el => {
      if (showTax) {
        el.classList.remove("d-none");
      } else {
        el.classList.add("d-none");
      }
    });

    basePriceElements.forEach(el => {
      if (showTax) {
        el.classList.add("d-none");
      } else {
        el.classList.remove("d-none");
      }
    });

    priceTaxElements.forEach(el => {
      if (showTax) {
        el.classList.remove("d-none");
      } else {
        el.classList.add("d-none");
      }
    });
  }
})()