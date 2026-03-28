import { createEuropePmcScraper } from "../core/factories.js";

const topics = [
  ["europepmc-pandemic-preparedness", "Europe PMC Pandemic Preparedness", "Recent Europe PMC records about pandemic preparedness.", "\"pandemic preparedness\"", ["europepmc", "pandemic-preparedness"]],
  ["europepmc-vaccination", "Europe PMC Vaccination", "Recent Europe PMC records about vaccination.", "vaccination", ["europepmc", "vaccination"]],
  ["europepmc-tuberculosis", "Europe PMC Tuberculosis", "Recent Europe PMC records about tuberculosis.", "tuberculosis", ["europepmc", "tuberculosis"]],
  ["europepmc-malaria", "Europe PMC Malaria", "Recent Europe PMC records about malaria.", "malaria", ["europepmc", "malaria"]],
  ["europepmc-hiv", "Europe PMC HIV", "Recent Europe PMC records about HIV.", "HIV", ["europepmc", "hiv"]],
  ["europepmc-diabetes", "Europe PMC Diabetes", "Recent Europe PMC records about diabetes.", "diabetes", ["europepmc", "diabetes"]],
  ["europepmc-cardiology", "Europe PMC Cardiology", "Recent Europe PMC records about cardiology.", "cardiology", ["europepmc", "cardiology"]],
  ["europepmc-neuroscience", "Europe PMC Neuroscience", "Recent Europe PMC records about neuroscience.", "neuroscience", ["europepmc", "neuroscience"]],
  ["europepmc-immunology", "Europe PMC Immunology", "Recent Europe PMC records about immunology.", "immunology", ["europepmc", "immunology"]],
  ["europepmc-virology", "Europe PMC Virology", "Recent Europe PMC records about virology.", "virology", ["europepmc", "virology"]],
  ["europepmc-geriatrics", "Europe PMC Geriatrics", "Recent Europe PMC records about geriatrics.", "geriatrics", ["europepmc", "geriatrics"]],
  ["europepmc-primary-care", "Europe PMC Primary Care", "Recent Europe PMC records about primary care.", "\"primary care\"", ["europepmc", "primary-care"]],
  ["europepmc-surgery-outcomes", "Europe PMC Surgery Outcomes", "Recent Europe PMC records about surgery outcomes.", "\"surgery outcomes\"", ["europepmc", "surgery-outcomes"]],
  ["europepmc-rare-diseases", "Europe PMC Rare Diseases", "Recent Europe PMC records about rare diseases.", "\"rare diseases\"", ["europepmc", "rare-diseases"]],
  ["europepmc-public-health-surveillance", "Europe PMC Public Health Surveillance", "Recent Europe PMC records about public-health surveillance.", "\"public health surveillance\"", ["europepmc", "public-health-surveillance"]],
  ["europepmc-climate-and-health", "Europe PMC Climate And Health", "Recent Europe PMC records about climate and health.", "\"climate and health\"", ["europepmc", "climate-and-health"]],
  ["europepmc-medical-education", "Europe PMC Medical Education", "Recent Europe PMC records about medical education.", "\"medical education\"", ["europepmc", "medical-education"]],
  ["europepmc-infectious-disease-modelling", "Europe PMC Infectious Disease Modelling", "Recent Europe PMC records about infectious-disease modelling.", "\"infectious disease modeling\" OR \"infectious disease modelling\"", ["europepmc", "infectious-disease-modelling"]],
  ["europepmc-respiratory-health", "Europe PMC Respiratory Health", "Recent Europe PMC records about respiratory health.", "\"respiratory health\"", ["europepmc", "respiratory-health"]],
  ["europepmc-community-health", "Europe PMC Community Health", "Recent Europe PMC records about community health.", "\"community health\"", ["europepmc", "community-health"]],
  ["europepmc-health-equity", "Europe PMC Health Equity", "Recent Europe PMC records about health equity.", "\"health equity\"", ["europepmc", "health-equity"]],
  ["europepmc-maternal-and-newborn-health", "Europe PMC Maternal And Newborn Health", "Recent Europe PMC records about maternal and newborn health.", "\"maternal and newborn health\"", ["europepmc", "maternal-and-newborn-health"]],
  ["europepmc-child-health", "Europe PMC Child Health", "Recent Europe PMC records about child health.", "\"child health\"", ["europepmc", "child-health"]],
  ["europepmc-global-health", "Europe PMC Global Health", "Recent Europe PMC records about global health.", "\"global health\"", ["europepmc", "global-health"]],
  ["europepmc-occupational-health", "Europe PMC Occupational Health", "Recent Europe PMC records about occupational health.", "\"occupational health\"", ["europepmc", "occupational-health"]],
] as const;

const europePmcExpansionPack = topics.map(([id, name, description, query, defaultTags]) =>
  createEuropePmcScraper({
    id,
    name,
    category: "academic",
    description,
    homepage: "https://europepmc.org/",
    sourceName: "Europe PMC",
    query,
    defaultTags: [...defaultTags],
    defaults: {
      query,
    },
    params: [
      {
        key: "query",
        description: "Europe PMC search query override.",
        example: query.replaceAll("\"", ""),
      },
    ],
  }),
);

export default europePmcExpansionPack;
