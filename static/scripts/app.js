/**
 * HomePage - Help section
 */
class Help {
  constructor($el) {
    this.$el = $el;
    this.$buttonsContainer = $el.querySelector(".help--buttons");
    this.$slidesContainers = $el.querySelectorAll(".help--slides");
    this.currentSlide = this.$buttonsContainer.querySelector(".active").parentElement.dataset.id;
    this.init();
  }

  init() {
    this.events();
  }

  events() {
    /**
     * Slide buttons
     */
    this.$buttonsContainer.addEventListener("click", e => {
      if (e.target.classList.contains("btn")) {
        this.changeSlide(e);
      }
    });

    /**
     * Pagination buttons
     */
    this.$el.addEventListener("click", e => {
      if (e.target.classList.contains("btn") && e.target.parentElement.parentElement.classList.contains("help--slides-pagination")) {
        this.changePage(e);
      }
    });
  }

  changeSlide(e) {
    e.preventDefault();
    const $btn = e.target;

    // Buttons Active class change
    [...this.$buttonsContainer.children].forEach(btn => btn.firstElementChild.classList.remove("active"));
    $btn.classList.add("active");

    // Current slide
    this.currentSlide = $btn.parentElement.dataset.id;

    // Slides active class change
    this.$slidesContainers.forEach(el => {
      el.classList.remove("active");

      if (el.dataset.id === this.currentSlide) {
        el.classList.add("active");
      }
    });
  }

  /**
   * TODO: callback to page change event
   */
  changePage(e) {
    e.preventDefault();
    const page = e.target.dataset.page;

    console.log(page);
  }
}

const helpSection = document.querySelector(".help");
if (helpSection !== null) {
  new Help(helpSection);
}

/**
 * Form Select
 */
class FormSelect {
  constructor($el) {
    this.$el = $el;
    this.options = [...$el.children];
    this.init();
  }

  init() {
    this.createElements();
    this.addEvents();
    this.$el.parentElement.removeChild(this.$el);
  }

  createElements() {
    // Input for value
    this.valueInput = document.createElement("input");
    this.valueInput.type = "text";
    this.valueInput.name = this.$el.name;

    // Dropdown container
    this.dropdown = document.createElement("div");
    this.dropdown.classList.add("dropdown");

    // List container
    this.ul = document.createElement("ul");

    // All list options
    this.options.forEach((el, i) => {
      const li = document.createElement("li");
      li.dataset.value = el.value;
      li.innerText = el.innerText;

      if (i === 0) {
        // First clickable option
        this.current = document.createElement("div");
        this.current.innerText = el.innerText;
        this.dropdown.appendChild(this.current);
        this.valueInput.value = el.value;
        li.classList.add("selected");
      }

      this.ul.appendChild(li);
    });

    this.dropdown.appendChild(this.ul);
    this.dropdown.appendChild(this.valueInput);
    this.$el.parentElement.appendChild(this.dropdown);
  }

  addEvents() {
    this.dropdown.addEventListener("click", e => {
      const target = e.target;
      this.dropdown.classList.toggle("selecting");

      // Save new value only when clicked on li
      if (target.tagName === "LI") {
        this.valueInput.value = target.dataset.value;
        this.current.innerText = target.innerText;
      }
    });
  }
}

document.querySelectorAll(".form-group--dropdown select").forEach(el => {
  new FormSelect(el);
});

/**
 * Hide elements when clicked on document
 */
document.addEventListener("click", function (e) {
  const target = e.target;
  const tagName = target.tagName;

  if (target.classList.contains("dropdown")) return false;

  if (tagName === "LI" && target.parentElement.parentElement.classList.contains("dropdown")) {
    return false;
  }

  if (tagName === "DIV" && target.parentElement.classList.contains("dropdown")) {
    return false;
  }

  document.querySelectorAll(".form-group--dropdown .dropdown").forEach(el => {
    el.classList.remove("selecting");
  });
});

/**
 * Switching between form steps
 */
class FormSteps {
  constructor(form) {
    this.$form = form;
    this.$next = form.querySelectorAll(".next-step");
    this.$prev = form.querySelectorAll(".prev-step");
    this.$step = form.querySelector(".form--steps-counter span");
    this.currentStep = 1;

    this.$stepInstructions = form.querySelectorAll(".form--steps-instructions p");
    const $stepForms = form.querySelectorAll("form > div");
    this.slides = [...this.$stepInstructions, ...$stepForms];
    this.institutions = [];

    this.init();
  }

  /**
   * Init all methods
   */
  init() {
    this.events();
    this.updateForm();
  }

  /**
   * All events that are happening in form
   */
  events() {
    // disable all "next" buttons
    this.$next.forEach(btn => btn.disabled = true)

    // first step
    const chk1 = this.$form.querySelectorAll("#step1-chk");
    chk1.forEach(box => box.addEventListener("click", e => this.step1(chk1)));

    // second step
    const input = this.$form.querySelector("#step2-input");
    input.addEventListener("change", e => this.step2(input));
    input.addEventListener("keydown", e => this.step2(input));

    // Next step
    this.$next.forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        this.currentStep++;
        this.updateForm();
        if (this.currentStep === 2) {
          const categories = [...chk1].filter(box => box.checked).map(box => box.value);
          if (categories.length > 0) this.getInstitutions(categories);
        }
        if (this.currentStep === 3) {
          const parent = document.querySelector('div[data-step="3"]');
          let lastChild = parent.children[0];
          for (const i of this.institutions) {
            const div = document.createElement("div");
            div.setAttribute("class", "form-group form-group--checkbox");
            div.innerHTML =
              `            <label>
              <input id="step3-input" type="radio" name="organization" value="${i.pk}"/>
              <span class="checkbox radio"></span>
              <span class="description">
                  <div class="title">${i.fields.name}</div>
                  <div class="subtitle">${i.fields.description}</div>
                </span>
            </label>
`
            parent.insertBefore(div, lastChild.nextSibling);
            lastChild = div;
          }
          const inputs = this.$form.querySelectorAll("#step3-input");
          inputs.forEach(i => i.addEventListener("click", () => this.$next[2].disabled = false))
        }
      });
    });

    // Previous step
    this.$prev.forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        this.currentStep--;
        this.updateForm();
      });
    });

    // Form submit
    this.$form.querySelector("form").addEventListener("submit", e => this.submit(e));
  }

  // Make button active if any checkbox selected for step 1
  step1(chk) {
    this.$next[0].disabled = ![...chk].some(e => e.checked === true);
  }

  // Make button active if number of bags > 0
  step2(input) {
    this.$next[1].disabled = !parseInt(input.value) > 0 || isNaN(parseInt(input.value));
  }

  /**
   * Update form front-end
   * Show next or previous section etc.
   */
  updateForm() {
    this.$step.innerText = this.currentStep;

    // TODO: Validation

    this.slides.forEach(slide => {
      slide.classList.remove("active");

      if (slide.dataset.step === this.currentStep.toString()) {
        slide.classList.add("active");
      }
    });

    this.$stepInstructions[0].parentElement.parentElement.hidden = this.currentStep >= 6;
    this.$step.parentElement.hidden = this.currentStep >= 6;

    // TODO: get data from inputs and show them in summary
  }

  /**
   * Submit form
   *
   * TODO: validation, send data to server
   */
  submit(e) {
    e.preventDefault();
    this.currentStep++;
    this.updateForm();
  }

  getCookie(name) {
    let cookie = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
    return cookie ? cookie[2] : null;
  }

  getInstitutions(categories) {
    const data = new FormData();
    data.append("categories", categories);

    fetch("/institutions/", {
      method: "post",
      headers: {
        "X-CSRFToken": this.getCookie("csrftoken"),
      },
      body: data
    })
      .then((res) => {
        return res.json()
      })
      .then(json => {
        this.institutions = [];
        for (const i of json) this.institutions.push(i);
      })
      .catch(err => {
        console.log(err);
      });
  }

}

const form = document.querySelector(".form--steps");
if (form !== null) {
  new FormSteps(form);
}
