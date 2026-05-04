const scanTypeButtons = document.querySelectorAll("[data-scan-type]");
const contextButtons = document.querySelectorAll("[data-context]");
const photoInputs = document.querySelectorAll("[data-photo]");
const runScanButton = document.querySelector("#runScan");
const resultTitle = document.querySelector("#resultTitle");
const identificationSummary = document.querySelector("#identificationSummary");
const qualityLabel = document.querySelector("#qualityLabel");
const visualIndicators = document.querySelector("#visualIndicators");
const safetyFactors = document.querySelector("#safetyFactors");
const hazardFlags = document.querySelector("#hazardFlags");
const riskLevels = document.querySelectorAll(".level");
const scanStatus = document.querySelector("#scanStatus");
const resultPanel = document.querySelector(".result-panel");
const scanPanel = document.querySelector("#scanPanel");
const scannerWorkspace = document.querySelector("#scanner");
const scanAgainButton = document.querySelector("#scanAgain");
const paywall = document.querySelector("#paywall");
const closePaywall = document.querySelector("#closePaywall");
const pricingCards = document.querySelectorAll("[data-plan]");
const plantIdEndpoint = window.TREERISK_PLANT_ID_ENDPOINT || "";

let selectedScanType = "Tree";
let selectedContexts = new Set();

const examples = {
  Tree: {
    name: "Tree or woody plant",
    identity: [
      "Best accuracy comes from leaf/needle detail, bark, full tree shape, flowers, fruit, cones, and location.",
      "Species identification will appear here when the submitted photos return a confident match."
    ],
    indicators: []
  },
  Plant: {
    name: "Plant",
    identity: [
      "Best accuracy comes from leaf shape, flowers, fruit, stem, growth habit, and location.",
      "Species identification will appear here when the submitted photos return a confident match."
    ],
    indicators: []
  },
  "Shrub/Vine": {
    name: "Shrub or vine",
    identity: [
      "Best accuracy comes from leaves, flowers, fruit, bark/stem texture, climbing pattern, and location.",
      "Species identification will appear here when the submitted photos return a confident match."
    ],
    indicators: []
  },
  "Not Sure": {
    name: "Vegetation assessment",
    identity: [
      "The app will first try to identify whether this is a tree, shrub, vine, weed, or other vegetation.",
      "Best accuracy comes from multiple angles and close-ups of leaves, bark/stem, flowers, fruit, cones, and the full subject.",
      "Species identification will appear here when the submitted photos return a confident match."
    ],
    indicators: []
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

runScanButton.addEventListener("click", async () => {
  const photoCount = Array.from(photoInputs).filter((input) => input.files.length > 0).length;
  if (!photoCount) {
    scanStatus.textContent = "Add at least one photo before running an assessment.";
    scanStatus.classList.add("needs-photo");
    return;
  }

  runScanButton.disabled = true;
  runScanButton.textContent = "Analyzing...";
  scanStatus.textContent = "Analyzing photos and checking plant ID...";
  scanStatus.classList.remove("needs-photo");

  const hasHighExposure = Array.from(selectedContexts).some((context) =>
    ["Near house", "Near sidewalk/road", "Near power lines", "Play or school area", "Near parking"].includes(context)
  );
  const photoTypes = getUploadedPhotoTypes();
  const plantId = await identifyPlant();
  const risk = chooseRisk(photoCount, hasHighExposure, photoTypes);
  const quality = chooseQuality(photoCount);
  const result = examples[selectedScanType];
  const resultName = plantId.primaryName || result.name;

  resultTitle.textContent = `${resultName}: ${risk} risk`;
  identificationSummary.innerHTML = buildIdentificationSummary(result, plantId);
  qualityLabel.textContent = quality;
  visualIndicators.innerHTML = buildVisualIndicators(photoTypes, plantId);
  safetyFactors.innerHTML = buildSafetyFactors(hasHighExposure);
  hazardFlags.innerHTML = buildHazardFlags(photoTypes, hasHighExposure, plantId);
  riskLevels.forEach((level) => level.classList.toggle("active", level.textContent === risk));
  scanStatus.textContent = plantId.statusMessage || `Assessment updated using ${photoCount} photo${photoCount === 1 ? "" : "s"}.`;
  scanStatus.classList.remove("needs-photo");
  resultPanel.classList.remove("updated");
  resultPanel.hidden = false;
  scanPanel.hidden = true;
  scannerWorkspace.classList.add("report-mode");
  void resultPanel.offsetWidth;
  resultPanel.classList.add("updated");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  runScanButton.disabled = false;
  runScanButton.textContent = "Run Assessment";
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

function chooseRisk(photoCount, hasHighExposure, photoTypes) {
  const hasDamagePhoto = photoTypes.has("Damage/decay");
  const hasBasePhoto = photoTypes.has("Base/roots");
  const hasCanopyPhoto = photoTypes.has("Canopy/branches");
  const hasStructuralPhotos = hasBasePhoto && hasCanopyPhoto;

  if (selectedScanType === "Plant") return hasHighExposure ? "Moderate" : "Low";
  if (hasDamagePhoto && hasHighExposure) return "High";
  if (hasDamagePhoto) return "Moderate";
  if (hasHighExposure && (!hasStructuralPhotos || photoCount <= 2)) return "Moderate";
  return "Low";
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

function getUploadedPhotoTypes() {
  return new Set(
    Array.from(photoInputs)
      .filter((input) => input.files.length > 0)
      .map((input) => input.dataset.photo)
  );
}

function buildVisualIndicators(photoTypes, plantId) {
  const items = [];
  const speciesName = plantId.primaryName || "the submitted plant/tree";

  if (photoTypes.has("Full view")) {
    items.push(`Full-view photo submitted for overall shape and clearance review of ${speciesName}.`);
  } else {
    items.push("No full-view photo submitted, so lean, overall shape, and clearance cannot be reviewed from the current photo set.");
  }

  if (photoTypes.has("Leaf/detail")) {
    items.push("Leaf/detail photo submitted for species identification support.");
  }

  if (photoTypes.has("Bark/stem")) {
    items.push("Bark/stem photo submitted for trunk or stem surface review.");
  }

  if (photoTypes.has("Base/roots")) {
    items.push("Base/root photo submitted for root flare, soil movement, and trunk-base context.");
  } else if (selectedScanType !== "Plant") {
    items.push("No base/root photo submitted, so root plate lifting or trunk-base defects are not flagged from the current photos.");
  }

  if (photoTypes.has("Canopy/branches")) {
    items.push("Canopy/branch photo submitted for branch structure and dead-limb review.");
  } else if (selectedScanType !== "Plant") {
    items.push("No canopy/branch photo submitted, so canopy dieback or dead-limb concerns are not flagged from the current photos.");
  }

  if (photoTypes.has("Damage/decay")) {
    items.push("Damage/decay photo submitted. Treat any visible cracks, cavities, fungal growth, exposed rot, or broken limbs as reasons to confirm with a licensed arborist.");
  } else {
    items.push("No damage/decay photo submitted, so decay, disease, cracks, cavities, and broken-limb concerns are not flagged from the current photos.");
  }

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function buildHazardFlags(photoTypes, hasHighExposure, plantId) {
  const flags = [];
  const speciesName = plantId.primaryName || "this plant/tree";

  if (selectedScanType === "Tree" || selectedScanType === "Not Sure") {
    if (photoTypes.has("Damage/decay")) {
      flags.push(`Possible structural concern to verify for ${speciesName} because a damage/decay photo was submitted.`);
    } else {
      flags.push("No structural damage flag is raised from the current photo set.");
    }

    if (hasHighExposure) {
      flags.push("Public exposure selected. Even a low visual risk should be monitored more carefully near people, buildings, vehicles, roads, sidewalks, play areas, or utility lines.");
    }
  }

  if (selectedScanType === "Plant" || selectedScanType === "Shrub/Vine" || selectedScanType === "Not Sure") {
    flags.push("Check species-specific toxicity, thorn, allergy, invasive, and pet/child contact risks after confirming the identification.");
  }

  if (!flags.length) {
    flags.push("No extra hazard flags are raised from the current inputs.");
  }

  flags.push("This is an AI-assisted recommendation from submitted photos and available data, not a licensed arborist inspection.");
  return flags.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

async function identifyPlant() {
  if (!plantIdEndpoint) {
    return {
      primaryName: "",
      statusMessage: "Assessment complete. Plant ID backend is not connected yet.",
      items: [
        "The safety assessment still uses photo count and selected public safety context.",
        "For best ID results, include leaf/needle detail, bark or stem, full view, flowers, fruit, or cones when available."
      ]
    };
  }

  const files = Array.from(photoInputs)
    .filter((input) => input.files.length > 0)
    .slice(0, 5);
  const formData = new FormData();
  files.forEach((input) => {
    formData.append("images", input.files[0]);
    formData.append("organs", mapPhotoToOrgan(input.dataset.photo));
  });

  try {
    const response = await fetch(plantIdEndpoint, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      return {
        primaryName: "",
        statusMessage: `Plant ID failed with status ${response.status}. Try again with clearer photos or check the connection.`,
        items: [
          "Pl@ntNet did not return an identification.",
          "Confirm the backend is deployed and its Pl@ntNet API secret is set.",
          "The hazard assessment below is still a recommendation based on submitted photos and location context."
        ]
      };
    }

    const data = await response.json();
    const matches = Array.isArray(data.results) ? data.results.slice(0, 3) : [];
    if (!matches.length) {
      return {
        primaryName: "",
        statusMessage: "Plant ID returned no confident match. Add clearer leaf, bark, flower, fruit, or full-view photos.",
        items: [
          "No likely species match was returned.",
          "Try again with better lighting and close-ups of leaves, bark/stem, flowers, fruit, cones, and the full plant/tree."
        ]
      };
    }

    const primary = matches[0];
    const primaryName = formatSpeciesName(primary);
    const items = primaryName
      ? [
          `Likely species: ${primaryName}`,
          `Identification strength: ${formatScore(primary.score)}`,
          ...matches
            .slice(1)
            .map((match) => {
              const name = formatSpeciesName(match);
              return name ? `Alternative match: ${name} (${formatScore(match.score)})` : "";
            })
            .filter(Boolean)
        ]
      : [
          "No specific species name was returned.",
          "Try again with clearer leaf, bark, flower, fruit, cone, and full-view photos."
        ];

    return {
      primaryName,
      statusMessage: `Plant ID complete using ${files.length} photo${files.length === 1 ? "" : "s"}.`,
      items
    };
  } catch (error) {
    return {
      primaryName: "",
      statusMessage: "Plant ID could not connect. Check internet access and try again.",
      items: [
        "The app could not reach the plant ID backend from this browser.",
        "The hazard assessment below is still a recommendation based on submitted photos and location context.",
        "The API key is intentionally not stored in public app code."
      ]
    };
  }
}

function buildIdentificationSummary(fallbackResult, plantId) {
  const items = plantId.items && plantId.items.length ? plantId.items : fallbackResult.identity;
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function mapPhotoToOrgan(photoType) {
  if (photoType === "Leaf/detail") return "leaf";
  if (photoType === "Bark/stem") return "bark";
  if (photoType === "Canopy/branches") return "leaf";
  if (photoType === "Damage/decay") return "bark";
  return "auto";
}

function formatSpeciesName(match) {
  const species = match?.species || {};
  const scientificName = species.scientificNameWithoutAuthor || species.scientificName || "Unknown species";
  const commonNames = Array.isArray(species.commonNames) ? species.commonNames.filter(Boolean) : [];
  if (scientificName === "Unknown species" && !commonNames.length) return "";
  return commonNames.length ? `${commonNames[0]} (${scientificName})` : scientificName;
}

function formatScore(score) {
  if (typeof score !== "number") return "available, but not scored";
  if (score >= 0.65) return "Strong";
  if (score >= 0.35) return "Fair";
  return "Limited";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
