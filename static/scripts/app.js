/**
 * HomePage - Help section
 */
class Help {
  constructor($el) {
    this.$el = $el;
    this.$buttonsContainer = $el.querySelector(".help--buttons");
    this.$slidesContainers = $el.querySelectorAll(".help--slides");
    this.currentSlide = this.$buttonsContainer.querySelector(".active").parentElement.dataset.id;
    this.institutionsPage = {current: 1};
    this.institutionsData = {};
    this.institutionsType = "F";
    this.init();
  }

  init() {
    this.generateInstitutionsList(this.institutionsPage.current, this.institutionsType);
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
    const types= {1: "F", 2: "OP", 3: "ZL"};
    this.institutionsType = types[this.currentSlide];
    this.generateInstitutionsList(1, types[this.currentSlide]);
    // this.addPagination();
  }

  // Pagination
  addPagination() {
    const parent = this.$slidesContainers[this.currentSlide - 1].querySelector("ul.help--slides-pagination");
    const li = document.createElement("li");
    for (let i = 1; i <= this.institutionsPage.num_pages; i++) {
      const a = document.createElement("a");
      a.className = `btn btn--small btn--without-border${i === this.institutionsPage.current ? ' active' : ''}`;
      a.setAttribute("data-page", `${i}`);
      a.innerText = `${i}`;
      li.appendChild(a);
    }
    if (parent.firstElementChild) parent.firstElementChild.remove();
    parent.appendChild(li);
  }

  /**
   * TODO: callback to page change event
   */
  changePage(e) {
    e.preventDefault();
    const page = e.target.dataset.page;
    console.log(page);
    this.generateInstitutionsList(page, this.institutionsType);
  }

  async fetchInstitutionsData(page = 1, type = "") {
    const response = await fetch(`institutions.json?page=${page}&type=${type}`, {
      method: "get",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    });
    return await response.json();
  }

  generateInstitutionsList(page = 1, type = "") {
    this.fetchInstitutionsData(page, type).then(json => {
      this.institutionsPage = json.page;
      this.institutionsData = JSON.parse(json.data);
      // console.log(this.institutionsPage);
      // console.log(this.institutionsData);
      const parent = this.$slidesContainers[this.currentSlide-1].querySelector("ul.help--slides-items");
      while (parent.firstElementChild) parent.firstElementChild.remove();
      for (const i in this.institutionsData) {
        const li = document.createElement("li");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const title = document.createElement("div");
        const subtitle = document.createElement("div");
        const categories = document.createElement("div");
        col1.className = col2.className = "col";
        title.className = "title";
        subtitle.className = "subtitle";
        title.innerText = this.institutionsData[i].fields.name;
        subtitle.innerText = this.institutionsData[i].fields.description;
        categories.className = "text";
        categories.innerText = json.categories[i].join(", ");
        li.appendChild(col1).appendChild(title).appendChild(subtitle);
        li.appendChild(col2).appendChild(categories);
        parent.appendChild(li);
        this.addPagination();
      }
    });
  }
}

const helpSection = document.querySelector("#help");
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
    this.categories = {}; // {category.id: [checked, category.name]}
    this.selectedCategories = [];
    this.institutions = []; // list of institutions with relevant categories
    this.bags = 0;
    this.dest = {}; // {institution.id: institution.name}
    this.address = {}; // {input.name: input.value}

    this.init();
  }

  /**
   * Init all methods
   */
  init() {
    // disable all "next" buttons
    this.$next.forEach(btn => btn.disabled = true);
    this.events();
    this.updateForm();
  }

  /**
   * All events that are happening in form
   */
  events() {

    // first step
    this.$form.querySelectorAll("#step1-id").forEach(box => {
      this.categories[box.value] = [box.checked, box.parentElement.querySelector("#step1-desc").innerText];
      box.addEventListener("click", (e) => {
        this.categories[e.target.value][0] = e.target.checked;
        this.$next[0].disabled = !Object.values(this.categories).some(e => e[0] === true);
      });
    });

    // second step
    this.$form.querySelector("#step2-input").addEventListener("input", e => {
      this.bags = parseInt(e.target.value);
      this.$next[1].disabled = !parseInt(e.target.value) > 0 || isNaN(parseInt(e.target.value));
    });

    // fourth step
    [...this.$form.querySelector('div[data-step="4"]').getElementsByTagName("input")].forEach(i => {
      this.address[i.name] = i.value;
      i.addEventListener("change", e => {
        this.address[e.target.name] = e.target.value;
        this.$next[3].disabled = Object.values(this.address).some(i => i === "");
      });
    });

    // Next step
    this.$next.forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        this.currentStep++;
        this.updateForm();
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

  /**
   * Update form front-end
   * Show next or previous section etc.
   */
  updateForm() {
    this.$step.innerText = this.currentStep;

    if (this.currentStep === 2) {
      this.selectedCategories = Object.entries(this.categories).filter(([_, v]) => v[0]).map(e => e[0]);
      this.getInstitutions(this.selectedCategories);
    }
    if (this.currentStep === 3) {
      const parent = form.querySelector('div[data-step="3"]');
      let lastChild = parent.children[0];
      for (const i of this.institutions) {
        const div = document.createElement("div");
        div.setAttribute("class", "form-group form-group--checkbox");
        div.innerHTML =
          `         <label>
            <input id="step3-input" type="radio" name="organization" value="${i.pk}"/>
            <span class="checkbox radio"></span>
            <span class="description">
              <div id="step3-dest" class="title">${i.fields.name}</div>
              <div class="subtitle">${i.fields.description}</div>
            </span>
          </label>
`;
        parent.insertBefore(div, lastChild.nextSibling);
        lastChild = div;
      }
      this.$form.querySelectorAll("#step3-input").forEach(i => i.addEventListener("click", e => {
        this.dest = {[e.target.value]: e.target.parentElement.querySelector("#step3-dest").innerText};
        this.$next[2].disabled = false;
      }));
    }

    // TODO: Validation

    this.slides.forEach(slide => {
      slide.classList.remove("active");

      if (slide.dataset.step === this.currentStep.toString()) {
        slide.classList.add("active");
      }
    });

    this.$stepInstructions[0].parentElement.parentElement.hidden = this.currentStep >= 6;
    this.$step.parentElement.hidden = this.currentStep >= 6;

    // summary steps 1 and 2
    let bag = "worek";
    let contains = "zawiera";
    if (this.bags !== 1) {
      const r10 = this.bags % 10;
      const r100 = this.bags % 100;
      bag = (r10 > 4 || r10 < 2 || (11 < r100 < 15)) ? "worków" : "worki";
      if (!(r10 > 4 || r10 < 2 || (11 < r100 < 15))) contains = "zawierają";
    }
    const categories = Object.values(this.categories).filter(c => c[0]).map(c => c[1]).join(", ");
    document.getElementById("step6-what").innerText = `${this.bags} ${bag} ${contains}:\n${categories}.`;
    // summary step 3
    const iName = this.dest[Object.keys(this.dest)[0]];
    document.getElementById("step6-whom").innerText = `Dla ${iName}.`;
    // summary step 4
    this.address["more-info"] = this.$form.querySelector("textarea[name='more_info']").value || "Brak uwag";
    const address = Object.keys(this.address).map(key => `<li>${this.address[key]}</li>`);
    document.getElementById("step6-address").innerHTML = address.slice(0, -3).join("\n");
    document.getElementById("step6-pickup").innerHTML = address.slice(-3).join("\n");
  }

  /**
   * Submit form
   *
   * TODO: validation, send data to server
   */
  submit(e) {
    e.preventDefault();
    this.currentStep++;
    this.addDonation();
  }

  addDonation() {
    const data = new FormData();
    data.append("quantity", this.bags);
    data.append("categories", this.selectedCategories);
    data.append("institution_id", Object.keys(this.dest)[0]);
    data.append("address", this.address["address"]);
    data.append("phone_number", this.address["phone"]);
    data.append("city", this.address["city"]);
    data.append("zip_code", this.address["postcode"]);
    data.append("pick_up_date", this.address["data"]);
    data.append("pick_up_time", this.address["time"]);
    data.append("pick_up_comment", this.address["more-info"]);

    fetch("/add-donation/", {
      method: "post",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: data
    })
      .then((res) => {
        return res.json()
      })
      .then(json => {
        console.log(json);
        window.location.href = "/form-confirmation/"
      })
      .catch(err => {
        this.currentStep = 1;
      });
  }

  getInstitutions(categories) {
    const data = new FormData();
    data.append("categories", categories);

    fetch("/institutions/", {
      method: "post",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
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

function getCookie(name) {
  let cookie = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return cookie ? cookie[2] : null;
}

const trIsTaken = document.querySelectorAll("tr[data-is-taken]");
trIsTaken.forEach(tr => {
  trBgColor(tr);
  tr.addEventListener("click", e => {
    const data = new FormData();
    data.append("id", e.target.parentElement.dataset.id);
    fetch("/is-taken/", {
      method: "post",
      headers: {"X-CSRFToken": getCookie("csrftoken"),},
      body: data
    })
      .then((res) => res.json())
      .then(() => location.reload())
      .catch(err => console.log(err));
  });
});

function trBgColor(tr) {
  tr.style.backgroundColor = (tr.dataset.isTaken === "1") ? "lightgray" : "white";
}
