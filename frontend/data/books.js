/**
 * Temporary mock dataset for LibraHub catalog (Step 2).
 * Isolated in data/ directory for straightforward replacement with MongoDB collections in future steps.
 * Includes at least 12 realistic books with consistent metadata, unique IDs, and ISBNs.
 */

export const INITIAL_BOOKS = [
  {
    id: "lib-101",
    title: "Algorithmic Elegance",
    subtitle: "Computational Theory and the Art of Software Design",
    author: "Dr. Anna L. Chen & Prof. Marcus J. Wright",
    category: "Computer Science",
    isbn: "978-0-13-468599-1",
    publisher: "Turing Academic Press",
    publicationYear: 2024,
    pages: 584,
    language: "English",
    shelfLocation: "3rd Floor · Tech Stacks A-12",
    totalCopies: 8,
    availableCopies: 5,
    isFeatured: true,
    createdAt: "2026-03-28T10:00:00Z",
    coverImage: "/src/assets/images/book_cover_code_1791722207290.jpg",
    description: "An authoritative exploration of modern algorithms, computational geometry, and scalable architecture. Dr. Chen and Prof. Wright deconstruct complex algorithmic paradigms into intuitive mental models, bridging foundational algorithmic rigor with modern distributed computing practices.",
    tableOfContents: [
      "1. Foundations of Computational Complexity",
      "2. Distributed Graph Decompositions",
      "3. Cache-Oblivious Data Structures",
      "4. Quantum-Resistant Cryptography",
      "5. Synthesis and High-Performance Systems"
    ]
  },
  {
    id: "lib-102",
    title: "Cosmic Architecture",
    subtitle: "Speculative Geometries and Interplanetary Habitats",
    author: "Eliza Reed",
    category: "Science Fiction",
    isbn: "978-1-59780-845-3",
    publisher: "Orion Stellar Imprint",
    publicationYear: 2023,
    pages: 412,
    language: "English",
    shelfLocation: "2nd Floor · Fiction Wing F-04",
    totalCopies: 6,
    availableCopies: 2,
    isFeatured: true,
    createdAt: "2026-03-24T14:30:00Z",
    coverImage: "/src/assets/images/book_cover_sci_fi_1791722173562.jpg",
    description: "A sweeping speculative masterpiece detailing humanity's first self-assembling deep orbital habitats across the Jovian moon system. Eliza Reed marries rigorous orbital mechanics with profound existential human drama as generations adapt to life within revolving synthetic biosphere rings.",
    tableOfContents: [
      "1. The Lagrangian Threshold",
      "2. Tensile Megastructures",
      "3. Biospheric Balancing Acts",
      "4. The Quiet Horizon",
      "5. Beyond the Van Allen Belts"
    ]
  },
  {
    id: "lib-103",
    title: "Form & Balance",
    subtitle: "Reflections on Minimalist Architecture & Design",
    author: "Elias Roth",
    category: "Architecture & Design",
    isbn: "978-3-8365-7281-2",
    publisher: "Bauhaus Monograph House",
    publicationYear: 2024,
    pages: 368,
    language: "English",
    shelfLocation: "1st Floor · Design Studio D-08",
    totalCopies: 5,
    availableCopies: 4,
    isFeatured: true,
    createdAt: "2026-03-22T08:15:00Z",
    coverImage: "/src/assets/images/book_cover_design_1791722185090.jpg",
    description: "Elias Roth investigates the architectural synthesis of raw daylight, honest structural materials, and negative spatial volume. Examining modernist and contemporary European and East Asian architectural practices, this book presents a manifesto for enduring, calm spatial experiences.",
    tableOfContents: [
      "1. The Poetry of Proportion",
      "2. Structural Candor: Timber and Cast Concrete",
      "3. Lighting as an Architectural Material",
      "4. Minimalist Urban Interventions",
      "5. Designing for Tactile Permanence"
    ]
  },
  {
    id: "lib-104",
    title: "Echoes of Antiquity",
    subtitle: "Classical Philosophy and the Roots of Democratic Reason",
    author: "Aurelia Vance",
    category: "Literature & History",
    isbn: "978-0-19-953556-9",
    publisher: "Athenaeum Press",
    publicationYear: 2022,
    pages: 496,
    language: "English",
    shelfLocation: "3rd Floor · Humanities H-19",
    totalCopies: 7,
    availableCopies: 0,
    isFeatured: true,
    createdAt: "2026-02-18T11:20:00Z",
    coverImage: "/src/assets/images/book_cover_history_1791722197470.jpg",
    description: "A gripping scholarly reappraisal of Mediterranean political discourse from Solon to Cicero. Vance draws startling parallels between classical civic experiments and modern democratic dilemmas, highlighting the fragility and enduring virtue of civic stewardship.",
    tableOfContents: [
      "1. The Agora and the Voice of the Many",
      "2. Rhetoric versus Truth in Athenian Courts",
      "3. The Roman Res Publica and Oligarchic Drift",
      "4. Epictetus on Inner Freedom in Turbulent Empires",
      "5. The Civic Inheritance of Modernity"
    ]
  },
  {
    id: "lib-105",
    title: "The Sovereign Mind",
    subtitle: "Epistemology, Cognitive Autonomy, and Moral Clarity",
    author: "Julian Sterling",
    category: "Philosophy",
    isbn: "978-0-691-18231-5",
    publisher: "Princeton Academic Classics",
    publicationYear: 2023,
    pages: 340,
    language: "English",
    shelfLocation: "3rd Floor · Philosophy Wing P-02",
    totalCopies: 4,
    availableCopies: 3,
    isFeatured: false,
    createdAt: "2026-03-12T16:45:00Z",
    coverImage: "/src/assets/images/book_cover_history_1791722197470.jpg",
    description: "How does the individual retain intellectual clarity amidst torrential streams of algorithmic consensus? Sterling builds a rigorous framework for epistemic hygiene, deliberative stillness, and ethical decision-making in high-velocity societies.",
    tableOfContents: [
      "1. Information Density and Intellectual Fatigue",
      "2. The Anatomy of Deliberation",
      "3. Epistemic Humility as Cognitive Power",
      "4. Moral Grounding Across Epochs",
      "5. The Unhurried Mind"
    ]
  },
  {
    id: "lib-106",
    title: "Capital & Cohesion",
    subtitle: "Economic Networks in the Post-Global Era",
    author: "Siddharth Nair & Elena Rostova",
    category: "Business & Economics",
    isbn: "978-0-674-98745-6",
    publisher: "Harvard University Press",
    publicationYear: 2024,
    pages: 448,
    language: "English",
    shelfLocation: "2nd Floor · Economics E-11",
    totalCopies: 5,
    availableCopies: 1,
    isFeatured: false,
    createdAt: "2026-03-19T09:30:00Z",
    coverImage: "/src/assets/images/book_cover_code_1791722207290.jpg",
    description: "A data-driven investigation into industrial policy, localized supply chain resilience, and sovereign wealth allocation. Nair and Rostova provide an indispensable roadmap for executives and economic planners navigating multipolar trade landscapes.",
    tableOfContents: [
      "1. The Unwinding of Frictionless Commerce",
      "2. Critical Material Geography",
      "3. Strategic State Capitalism",
      "4. Digital Sovereign Currencies",
      "5. Equitable Domestic Growth"
    ]
  },
  {
    id: "lib-107",
    title: "The Distributed Ledger Blueprint",
    subtitle: "Consensus Mechanisms, Cryptographic Proofs, and System Verification",
    author: "Mateo Silva",
    category: "Computer Science",
    isbn: "978-1-492-05481-8",
    publisher: "O'Reilly Media",
    publicationYear: 2023,
    pages: 520,
    language: "English",
    shelfLocation: "3rd Floor · Tech Stacks A-18",
    totalCopies: 9,
    availableCopies: 6,
    isFeatured: false,
    createdAt: "2026-01-14T13:00:00Z",
    coverImage: "/src/assets/images/book_cover_code_1791722207290.jpg",
    description: "From Byzantine Fault Tolerance to recursive Zero-Knowledge rollups, this deep engineering guide analyzes the mathematical principles and practical trade-offs required to engineer fault-tolerant decentralized networks at scale.",
    tableOfContents: [
      "1. State Machine Replication Fundamentals",
      "2. Asynchronous Consensus Protocols",
      "3. Zero-Knowledge Proof Primitives",
      "4. Network Topologies and P2P Gossip",
      "5. Formal Verification of Smart Contracts"
    ]
  },
  {
    id: "lib-108",
    title: "Chronicles of the Silk Meridian",
    subtitle: "Caravans, Cultural Transmissions, and Forgotten Oases",
    author: "Soraya Kabbaj",
    category: "Literature & History",
    isbn: "978-0-307-47472-8",
    publisher: "Pantheon Books",
    publicationYear: 2021,
    pages: 612,
    language: "English",
    shelfLocation: "3rd Floor · Humanities H-07",
    totalCopies: 3,
    availableCopies: 2,
    isFeatured: false,
    createdAt: "2025-11-20T10:15:00Z",
    coverImage: "/src/assets/images/book_cover_history_1791722197470.jpg",
    description: "Soraya Kabbaj retraces five thousand kilometers of desert and alpine mountain passes, bringing alive the merchants, translators, astronomers, and pilgrims who created Eurasia's first great web of intellectual exchange.",
    tableOfContents: [
      "1. The Turquoise Passes of Sogdiana",
      "2. Monasteries of the Taklamakan Edge",
      "3. Paper, Silk, and Astronomy",
      "4. The Great Caravanserais",
      "5. Legacies Written in Clay and Stone"
    ]
  },
  {
    id: "lib-109",
    title: "Neural Foundations & Deep Cognition",
    subtitle: "Mathematical Principles of Transformer Architectures",
    author: "Dr. Kenji Takahashi",
    category: "Computer Science",
    isbn: "978-0-262-04582-7",
    publisher: "MIT Press",
    publicationYear: 2025,
    pages: 640,
    language: "English",
    shelfLocation: "3rd Floor · Tech Stacks A-05",
    totalCopies: 6,
    availableCopies: 4,
    isFeatured: true,
    createdAt: "2026-03-30T17:10:00Z",
    coverImage: "/src/assets/images/book_cover_code_1791722207290.jpg",
    description: "A comprehensive treatise on statistical learning theory, high-dimensional latent manifolds, and attention dynamics. Dr. Takahashi provides both formal convergence theorems and practical engineering insights for multi-modal model architectures.",
    tableOfContents: [
      "1. Linear Algebra in High Dimensions",
      "2. Non-Convex Optimization Dynamics",
      "3. Self-Attention Mechanics & Scaled Dot-Products",
      "4. Interpretability and Representation Alignment",
      "5. Generalization Bounds in Overparameterized Regimes"
    ]
  },
  {
    id: "lib-110",
    title: "Urban Vernaculars: Timber & Modernity",
    subtitle: "Regenerative Construction and Structural Aesthetics",
    author: "Astrid Lindholm",
    category: "Architecture & Design",
    isbn: "978-3-03778-651-2",
    publisher: "Lars Müller Publishers",
    publicationYear: 2023,
    pages: 380,
    language: "English",
    shelfLocation: "1st Floor · Design Studio D-14",
    totalCopies: 4,
    availableCopies: 0,
    isFeatured: false,
    createdAt: "2026-02-05T09:20:00Z",
    coverImage: "/src/assets/images/book_cover_design_1791722185090.jpg",
    description: "Examining mass timber engineering across Alpine and Nordic municipal projects. Astrid Lindholm advocates for bioclimatic envelope design, circular life-cycle accountability, and acoustic tranquility in dense metropolitan centers.",
    tableOfContents: [
      "1. The Carbon Economics of Timber",
      "2. Glulam and Cross-Laminated Structural Logic",
      "3. Fire Engineering and Acoustic Decoupling",
      "4. Urban Case Studies from Helsinki to Zurich",
      "5. The Poetics of Unfinished Wood"
    ]
  },
  {
    id: "lib-111",
    title: "Solaris Drift",
    subtitle: "Encounters at the Edge of Known Radiance",
    author: "Devon M. Calloway",
    category: "Science Fiction",
    isbn: "978-0-7653-8201-6",
    publisher: "Tor Books",
    publicationYear: 2024,
    pages: 464,
    language: "English",
    shelfLocation: "2nd Floor · Fiction Wing F-12",
    totalCopies: 7,
    availableCopies: 3,
    isFeatured: false,
    createdAt: "2026-03-01T15:00:00Z",
    coverImage: "/src/assets/images/book_cover_sci_fi_1791722173562.jpg",
    description: "When an automated deep-space relay picks up non-repeating acoustic pulses emanating from an ancient brown dwarf star, an eclectic crew of computational linguists and exobiologists sets out on a voyage that redefines human perception.",
    tableOfContents: [
      "1. The Brown Dwarf Signal",
      "2. Relay Outpost Sigma-7",
      "3. Resonances in the Plasma Sea",
      "4. The Language of Stellar Flares",
      "5. The Return Orbit"
    ]
  },
  {
    id: "lib-112",
    title: "Ethics for the Technological Age",
    subtitle: "Agency, Moral Responsibility, and Autonomous Systems",
    author: "Prof. Clara Benitez",
    category: "Philosophy",
    isbn: "978-0-19-886912-2",
    publisher: "Oxford University Press",
    publicationYear: 2025,
    pages: 390,
    language: "English",
    shelfLocation: "3rd Floor · Philosophy Wing P-09",
    totalCopies: 5,
    availableCopies: 5,
    isFeatured: false,
    createdAt: "2026-03-29T11:40:00Z",
    coverImage: "/src/assets/images/book_cover_history_1791722197470.jpg",
    description: "What constitutes ethical accountability when algorithms make consequential life decisions? Prof. Benitez combines virtue ethics and normative political philosophy to establish concrete guardrails for human agency in automated governance.",
    tableOfContents: [
      "1. The Distribution of Moral Responsibility",
      "2. Algorithmic Paternalism vs Human Dignity",
      "3. Privacy as a Structural Democratic Condition",
      "4. Autonomous Weapons and Moral Hazards",
      "5. Civic Stewardship in the Machine Age"
    ]
  },
  {
    id: "lib-113",
    title: "Behavioral Markets & Macro Resilience",
    subtitle: "Heuristics, Liquidity Spirals, and Institutional Stability",
    author: "Nathaniel Thorne",
    category: "Business & Economics",
    isbn: "978-0-300-24819-7",
    publisher: "Yale University Press",
    publicationYear: 2022,
    pages: 432,
    language: "English",
    shelfLocation: "2nd Floor · Economics E-04",
    totalCopies: 4,
    availableCopies: 2,
    isFeatured: false,
    createdAt: "2025-10-10T14:10:00Z",
    coverImage: "/src/assets/images/book_cover_code_1791722207290.jpg",
    description: "An empirical critique of rational expectation equilibria during systemic financial shocks. Nathaniel Thorne demonstrates how behavioral herd mechanics interact with collateral constraints to trigger rapid market volatility.",
    tableOfContents: [
      "1. The Fragility of Efficient Price Discovery",
      "2. Information Cascades in Credit Markets",
      "3. Central Bank Interventions and Moral Hazard",
      "4. Sovereign Debt Contagion Mechanisms",
      "5. Engineering Robust Financial Architecture"
    ]
  },
  {
    id: "lib-114",
    title: "The Cartography of Empires",
    subtitle: "Maps, Surveys, and the Construction of Territorial Power",
    author: "Prof. Henrik van der Meer",
    category: "Literature & History",
    isbn: "978-1-108-49214-0",
    publisher: "Cambridge University Press",
    publicationYear: 2020,
    pages: 560,
    language: "English",
    shelfLocation: "3rd Floor · Humanities H-14",
    totalCopies: 3,
    availableCopies: 0,
    isFeatured: false,
    createdAt: "2025-08-15T08:00:00Z",
    coverImage: "/src/assets/images/book_cover_history_1791722197470.jpg",
    description: "A monumental cartographic history analyzing how early modern maritime powers used trigonometric surveys, marine charts, and boundary demarcation to establish geopolitical dominance across five continents.",
    tableOfContents: [
      "1. The Geometry of the Open Sea",
      "2. The Dutch East India Company Cartographers",
      "3. Mercator, Rhumb Lines, and Distortion",
      "4. The Great Trigonometrical Survey",
      "5. Imagined Boundaries and Lived Realities"
    ]
  }
];

// Dynamically derived list of unique categories with 'All Categories' leading
export const CATEGORIES = [
  "All Categories",
  ...Array.from(new Set(INITIAL_BOOKS.map((b) => b.category)))
];

export const LIBRARY_STATS = [
  { label: "Catalog Titles", value: "24,800+", description: "Physical volumes & digital monographs" },
  { label: "Active Patrons", value: "8,450+", description: "Researchers, students & community members" },
  { label: "Circulation Rate", value: "94.2%", description: "Active monthly resource utilization" },
  { label: "Study Chambers", value: "32", description: "Acoustically quiet research environments" }
];

/**
 * Helper to fetch a book by ID.
 * Returns null if not found.
 */
export function getBookById(id) {
  if (!id) return null;
  return INITIAL_BOOKS.find((b) => b.id.toLowerCase() === String(id).toLowerCase()) || null;
}

/**
 * Helper to get related books by category, excluding current book ID.
 */
export function getRelatedBooks(bookId, category, limit = 3) {
  return INITIAL_BOOKS
    .filter((b) => b.id !== bookId && b.category === category)
    .slice(0, limit);
}
