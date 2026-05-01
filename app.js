const scanTypeButtons = document.querySelectorAll("[data-scan-type]");
const contextButtons = document.querySelectorAll("[data-context]");
const photoInputs = document.querySelectorAll("[data-photo]");
const runScanButton = document.querySelector("#runScan");
const resultTitle = document.querySelector("#resultTitle");
const identificationSummary = document.querySelector("#identificationSummary");
const qualityLabel = document.querySelector("#qualityLabel");
const visualIndicators = document.querySelector("#visualIndicators");
const safetyFactors = document.querySelector("#safetyFactors");
const riskLevels = document.querySelectorAll(".level");
const scanStatus = document.querySelector("#scanStatus");
const resultPanel = document.querySelector(".result-panel");
const scanPanel = document.querySelector("#scanPanel");
const scannerWorkspace = document.querySelector("#scanner");
const scanAgainButton = document.querySelector("#scanAgain");
const paywall = document.querySelector("#paywall");
const closePaywall = document.querySelector("#closePaywall");
const pricingCards = document.querySelectorAll("[data-plan]");

let selectedScanType = "Tree";
let selectedContexts = new Set();

const examples = {
  Tree: {
    name: "Tree or woody plant",
    identity: [
      "Exact species identification needs the production AI plant ID engine connected.",
      "Best accuracy comes from leaf/needle detail, bark, full tree shape, flowers, fruit, cones, and location.",
      "This prototype does not claim a species name from your photos yet."
    ],
    indicators: [
      "Review full-tree lean, canopy dieback, dead branches, and branch attachment points",
      "Review bark/stem photos for cracks, cavities, fungal growth, pests, or decay",
      "Review base/root photos for root plate lifting, soil movement, girdling roots, or trunk flare damage"
    ]
  },
  Plant: {
    name: "Plant",
    identity: [
      "Exact species identification needs the production AI plant ID engine connected.",
      "Best accuracy comes from leaf shape, flowers, fruit, stem, growth habit, and location.",
      "This prototype does not claim a species name from your photos yet."
    ],
    indicators: [
      "Review possible toxicity, thorn, allergy, invasive, and contact-irritation risk",
      "Review whether the plant is near children, pets, walkways, or public access",
      "No tree fall-risk structure detected from current scan type"
    ]
  },
  "Shrub/Vine": {
    name: "Shrub or vine",
    identity: [
      "Exact species identification needs the production AI plant ID engine connected.",
      "Best accuracy comes from leaves, flowers, fruit, bark/stem texture, climbing pattern, and location.",
      "This prototype does not claim a species name from your photos yet."
    ],
    indicators: [
      "Review invasive spread, thorn, toxicity, allergy, and obstruction risk",
      "Review whether vine growth is pulling on fences, gutters, railings, or utility areas",
      "Close-up stem, attachment, and support photos improve the assessment"
    ]
  },
  "Not Sure": {
    name: "Vegetation assessment",
    identity: [
      "The production AI engine should first classify whether this is a tree, shrub, vine, weed, or other vegetation.",
      "Best accuracy comes from multiple angles and close-ups of leaves, bark/stem, flowers, fruit, cones, and the full subject.",
      "This prototype does not claim a species name from your photos yet."
    ],
    indicators: [
      "Visible hazard signs should be assessed separately from plant identity",
      "If woody structure is present, review lean, dead limbs, trunk defects, and root plate condition",
      "If non-woody vegetation is present, review toxicity, thorns, allergens, invasive risk, and public contact"
    ]
  }
};

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scrollTarget).scrollIntoView({ behavior: "smooth" });
  });
});

scanTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    scanTypeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    selectedScanType = button.dataset.scanType;
  });
});

contextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const context = button.dataset.context;
    if (selectedContexts.has(context)) {
      selectedContexts.delete(context);
      button.classList.remove("active");
      return;
    }

    selectedContexts.add(context);
    button.classList.add("active");
  });
});

photoInputs.forEach((input) => {
  input.addEventListener("change", () => {
    input.closest("label").classList.toggle("has-file", input.files.length > 0);
    updateScanStatus();
  });
});

runScanButton.addEventListener("click", () => {
  const photoCount = Array.from(photoInputs).filter((input) => input.files.length > 0).length;
  if (!photoCount) {
    scanStatus.textContent = "Add at least one photo before running an assessment.";
    scanStatus.classList.add("needs-photo");
    return;
  }

  const hasHighExposure = Array.from(selectedContexts).some((context) =>
    ["Near house", "Near sidewalk/road", "Near power lines", "Play or school area", "Near parking"].includes(context)
  );
  const risk = chooseRisk(photoCount, hasHighExposure);
  const quality = chooseQuality(photoCount);
  const result = examples[selectedScanType];

  resultTitle.textContent = `${result.name}: ${risk} risk`;
  identificationSummary.innerHTML = result.identity.map((item) => `<li>${item}</li>`).join("");
  qualityLabel.textContent = quality;
  visualIndicators.innerHTML = result.indicators.map((item) => `<li>${item}</li>`).join("");
  safetyFactors.innerHTML = buildSafetyFactors(hasHighExposure);
  riskLevels.forEach((level) => level.classList.toggle("active", level.textContent === risk));
  scanStatus.textContent = `Assessment updated using ${photoCount} photo${photoCount === 1 ? "" : "s"}.`;
  scanStatus.classList.remove("needs-photo");
  resultPanel.classList.remove("updated");
  resultPanel.hidden = false;
  scanPanel.hidden = true;
  scannerWorkspace.classList.add("report-mode");
  void resultPanel.offsetWidth;
  resultPanel.classList.add("updated");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

scanAgainButton.addEventListener("click", () => {
  resultPanel.hidden = true;
  scanPanel.hidden = false;
  scannerWorkspace.classList.remove("report-mode");
  scanPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll("[data-paywall]").forEach((button) => {
  button.addEventListener("click", () => {
    openPaywall();
  });
});

pricingCards.forEach((card) => {
  card.addEventListener("click", () => handlePlanSelection(card.dataset.plan));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePlanSelection(card.dataset.plan);
    }
  });
});

closePaywall.addEventListener("click", closeModal);
paywall.addEventListener("click", (event) => {
  if (event.target === paywall) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

function chooseRisk(photoCount, hasHighExposure) {
  if (selectedScanType === "Plant") return hasHighExposure ? "Moderate" : "Low";
  if (photoCount <= 1 && hasHighExposure) return "High";
  if (photoCount <= 1) return "Moderate";
  if (photoCount >= 4 && hasHighExposure) return "Moderate";
  if (photoCount >= 4) return "Low";
  return hasHighExposure ? "High" : "Moderate";
}

function chooseQuality(photoCount) {
  if (photoCount >= 4) return "Strong";
  if (photoCount >= 2) return "Fair";
  return "Limited";
}

function buildSafetyFactors(hasHighExposure) {
  const factors = Array.from(selectedContexts);
  if (!factors.length) {
    return "<li>No location context selected. Add nearby structures, roads, play areas, parking, or open-area context for a better public safety assessment.</li>";
  }

  const mapped = factors.map((factor) => `<li>${factor} selected</li>`);
  if (hasHighExposure) {
    mapped.push("<li>Public exposure increases the importance of professional confirmation when visible defects are present</li>");
  }

  return mapped.join("");
}

function closeModal() {
  paywall.classList.remove("show");
  paywall.setAttribute("aria-hidden", "true");
}

function openPaywall() {
  paywall.classList.add("show");
  paywall.setAttribute("aria-hidden", "false");
}

function handlePlanSelection(plan) {
  if (plan === "Free") {
    document.querySelector("#scanner").scrollIntoView({ behavior: "smooth" });
    return;
  }

  openPaywall();
}

function updateScanStatus() {
  const photoCount = Array.from(photoInputs).filter((input) => input.files.length > 0).length;
  scanStatus.classList.remove("needs-photo");
  scanStatus.textContent = photoCount
    ? `${photoCount} photo${photoCount === 1 ? "" : "s"} added. More photos can improve the assessment.`
    : "No photos added yet.";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app still runs if offline caching is unavailable.
    });
  });
}
