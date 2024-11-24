import type { Pattern } from '../types/patterns';

export const patterns: Pattern[] = [
  // Previous patterns 1-10 remain unchanged
  {
    id: 1,
    name: "Independent Regions",
    description: "Metropolitan regions will not come to balance until each one is small and autonomous enough to be an independent sphere of culture.",
    context: "The power of cities and metropolitan regions to generate and sustain human culture has been understood for centuries.",
    problem: "Metropolitan regions are too large, too chaotic, and too fragmented to generate coherent culture.",
    solution: "Divide metropolitan regions into smaller, autonomous regions with distinct cultural identities.",
    broaderPatterns: [],
    narrowerPatterns: [2, 3, 4],
    examples: [
      "Historic Italian city-states",
      "Swiss cantons",
      "Ancient Greek city-states"
    ]
  },
  {
    id: 2,
    name: "City Country Fingers",
    description: "When a city is growing too fast, the process of growth damages the countryside and cuts the citizens off from nature.",
    context: "Metropolitan areas are expanding into surrounding countryside.",
    problem: "Urban sprawl destroys natural land and disconnects people from nature.",
    solution: "Keep interlocking fingers of city and country, even at the smallest scale. The urban fingers should never be more than one mile wide, while the rural fingers should never be less than one mile wide.",
    broaderPatterns: [1],
    narrowerPatterns: [5, 6, 7],
    examples: [
      "Copenhagen's Finger Plan",
      "Portland's Urban Growth Boundary",
      "Stockholm's green wedges"
    ]
  },
  {
    id: 3,
    name: "Agricultural Valleys",
    description: "Valleys are unique agricultural and ecological regions that support the surrounding urban areas.",
    context: "Urban development threatens productive agricultural land.",
    problem: "Industrial agriculture and urban sprawl are destroying fertile valleys.",
    solution: "Preserve agricultural valleys as distinct units. Never build on flood plains; keep housing on hillsides and rough ground.",
    broaderPatterns: [1],
    narrowerPatterns: [8, 9],
    examples: [
      "Napa Valley, California",
      "Loire Valley, France",
      "Po Valley, Italy"
    ]
  },
  {
    id: 4,
    name: "Mosaic of Subcultures",
    description: "The homogeneity of modern cities kills all variety of lifestyles and arrests the growth of individual character.",
    context: "Cities need to support diverse communities and ways of life.",
    problem: "Modern urban planning tends to create uniform, monotonous environments.",
    solution: "Create a mosaic of different subcultures in the city, each with its own spatial territory and its own characteristic lifestyle.",
    broaderPatterns: [1],
    narrowerPatterns: [10, 11],
    examples: [
      "London's distinct neighborhoods",
      "New York's ethnic enclaves",
      "Tokyo's specialized districts"
    ]
  },
  {
    id: 5,
    name: "Green Commons",
    description: "People need access to green spaces for their physical and emotional well-being.",
    context: "Urban development often prioritizes buildings over open spaces.",
    problem: "Dense urban areas lack accessible green spaces for community use.",
    solution: "Create a network of green commons throughout the city, each within walking distance of surrounding neighborhoods.",
    broaderPatterns: [2],
    narrowerPatterns: [12, 13],
    examples: [
      "Boston Common",
      "Central Park, New York",
      "Hyde Park, London"
    ]
  },
  {
    id: 6,
    name: "Connected Play",
    description: "Children need to be able to explore and play freely in their environment.",
    context: "Modern cities often separate children's play areas from daily life.",
    problem: "Isolated playgrounds don't provide rich, connected play experiences.",
    solution: "Create a connected network of play spaces that allow children to move freely between different types of activities.",
    broaderPatterns: [2],
    narrowerPatterns: [14, 15],
    examples: [
      "Amsterdam's woonerf streets",
      "Copenhagen's integrated play spaces",
      "Barcelona's superblocks"
    ]
  },
  {
    id: 7,
    name: "Local Transport Areas",
    description: "Heavy traffic destroys the sense of community in urban neighborhoods.",
    context: "Cities struggle to balance transportation needs with livable communities.",
    problem: "Through traffic in residential areas creates noise, pollution, and safety hazards.",
    solution: "Create local transport areas that protect neighborhoods from through traffic while maintaining local access.",
    broaderPatterns: [2],
    narrowerPatterns: [16, 17],
    examples: [
      "Barcelona's superblocks",
      "Dutch woonerf zones",
      "London's low traffic neighborhoods"
    ]
  },
  {
    id: 8,
    name: "Food Web",
    description: "Local food systems are essential for community resilience and environmental sustainability.",
    context: "Industrial food systems disconnect people from their food sources.",
    problem: "Communities lack access to fresh, local food and agricultural knowledge.",
    solution: "Create a web of local food production, processing, and distribution within the region.",
    broaderPatterns: [3],
    narrowerPatterns: [18, 19],
    examples: [
      "Cuban urban agriculture",
      "Vermont's food system",
      "Japanese local food cooperatives"
    ]
  },
  {
    id: 9,
    name: "Sacred Ground",
    description: "Communities need places that connect them to the natural and cultural history of their region.",
    context: "Modern development often erases historical and natural landmarks.",
    problem: "People lose their connection to place when sacred spaces are destroyed.",
    solution: "Identify and protect sacred spaces that embody the spirit of the place and its people.",
    broaderPatterns: [3],
    narrowerPatterns: [20],
    examples: [
      "Native American sacred sites",
      "Ancient European stone circles",
      "Japanese shrine forests"
    ]
  },
  {
    id: 10,
    name: "Community of Faith",
    description: "Spiritual communities need physical spaces that support their practices and traditions.",
    context: "Religious and spiritual groups are important parts of the urban fabric.",
    problem: "Modern planning often neglects the spatial needs of faith communities.",
    solution: "Create spaces that support religious and spiritual practices while connecting to the broader community.",
    broaderPatterns: [4],
    narrowerPatterns: [21],
    examples: [
      "Medieval European church squares",
      "Islamic neighborhood mosques",
      "Buddhist temple communities"
    ]
  },
  // Adding patterns 11-20
  {
    id: 11,
    name: "Local Centers",
    description: "People need identifiable local centers to anchor their communities and daily activities.",
    context: "Modern cities often lack clear focal points for community life.",
    problem: "Without local centers, communities become fragmented and lose their identity.",
    solution: "Create a network of local centers at major intersections or natural gathering points, each with its own character and amenities.",
    broaderPatterns: [4],
    narrowerPatterns: [22, 23],
    examples: [
      "Traditional town squares",
      "Neighborhood main streets",
      "Village greens"
    ]
  },
  {
    id: 12,
    name: "Community Gardens",
    description: "Urban residents need opportunities to grow food and connect with nature.",
    context: "Dense urban areas often lack access to gardening spaces.",
    problem: "People in cities are disconnected from food production and natural cycles.",
    solution: "Create a network of community gardens within walking distance of every neighborhood.",
    broaderPatterns: [5],
    narrowerPatterns: [24, 25],
    examples: [
      "German allotment gardens",
      "UK victory gardens",
      "American community gardens"
    ]
  },
  {
    id: 13,
    name: "Urban Wilderness",
    description: "Cities need wild spaces where nature can thrive with minimal human intervention.",
    context: "Urban development often eliminates natural habitats.",
    problem: "Manicured parks don't provide the ecological benefits of wild spaces.",
    solution: "Preserve and create urban wilderness areas that support native ecosystems.",
    broaderPatterns: [5],
    narrowerPatterns: [26, 27],
    examples: [
      "London's Hampstead Heath",
      "Stockholm's Royal National City Park",
      "Portland's Forest Park"
    ]
  },
  {
    id: 14,
    name: "Adventure Playground",
    description: "Children need spaces where they can create and modify their play environment.",
    context: "Most playgrounds are fixed structures with limited play possibilities.",
    problem: "Standard playgrounds don't support creative, self-directed play.",
    solution: "Create adventure playgrounds where children can build, dig, and modify their environment.",
    broaderPatterns: [6],
    narrowerPatterns: [28, 29],
    examples: [
      "Berkeley Adventure Playground",
      "Danish junk playgrounds",
      "Tokyo Play Park"
    ]
  },
  {
    id: 15,
    name: "Neighborhood Learning Web",
    description: "Learning should be integrated into the fabric of daily life.",
    context: "Education is often confined to formal institutions.",
    problem: "Traditional schools can't provide all the learning opportunities people need.",
    solution: "Create a network of learning opportunities throughout the neighborhood.",
    broaderPatterns: [6],
    narrowerPatterns: [30, 31],
    examples: [
      "Community workshops",
      "Tool libraries",
      "Skill-sharing networks"
    ]
  },
  {
    id: 16,
    name: "Public Transport Nodes",
    description: "Public transport needs to be easily accessible and well-integrated with community life.",
    context: "Transit stations are often isolated from community activities.",
    problem: "Poor integration of transit reduces its use and community benefits.",
    solution: "Create active, mixed-use nodes around public transport stations.",
    broaderPatterns: [7],
    narrowerPatterns: [32, 33],
    examples: [
      "Japanese station areas",
      "Copenhagen Metro stations",
      "Portland Transit malls"
    ]
  },
  {
    id: 17,
    name: "Bike Network",
    description: "Cycling needs to be safe, convenient, and integrated with other transport modes.",
    context: "Cities struggle to accommodate increasing bicycle use.",
    problem: "Fragmented bike infrastructure discourages cycling.",
    solution: "Create a comprehensive network of bike routes that connects all parts of the city.",
    broaderPatterns: [7],
    narrowerPatterns: [34, 35],
    examples: [
      "Dutch cycling infrastructure",
      "Copenhagen bike lanes",
      "Portland bike boulevards"
    ]
  },
  {
    id: 18,
    name: "Market Network",
    description: "Local food systems need places for direct producer-consumer interaction.",
    context: "Industrial food distribution disconnects producers from consumers.",
    problem: "Lack of local markets limits access to fresh, local food.",
    solution: "Create a network of markets at different scales throughout the region.",
    broaderPatterns: [8],
    narrowerPatterns: [36, 37],
    examples: [
      "European market halls",
      "Asian wet markets",
      "Farmers' market networks"
    ]
  },
  {
    id: 19,
    name: "Food Processing",
    description: "Local food systems need facilities for processing and preserving food.",
    context: "Small-scale food producers lack access to processing facilities.",
    problem: "Without local processing, food systems remain dependent on industrial facilities.",
    solution: "Create shared facilities for food processing at the neighborhood and community scale.",
    broaderPatterns: [8],
    narrowerPatterns: [38, 39],
    examples: [
      "Community kitchens",
      "Food innovation centers",
      "Cooperative processing facilities"
    ]
  },
  {
    id: 20,
    name: "Sacred Sites",
    description: "Communities need to preserve and honor places of spiritual significance.",
    context: "Development pressure threatens sacred and cultural sites.",
    problem: "Loss of sacred sites damages community identity and cultural continuity.",
    solution: "Identify, protect, and provide access to sacred sites while respecting their sanctity.",
    broaderPatterns: [9],
    narrowerPatterns: [40, 41],
    examples: [
      "Indigenous sacred lands",
      "Historic temples and shrines",
      "Natural pilgrimage sites"
    ]
  }
];