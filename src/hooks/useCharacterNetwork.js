import { useQuery } from '@tanstack/react-query';

export function useCharacterNetwork() {
  return useQuery({
    queryKey: ['characterNetwork'],
    queryFn: async () => {
      const response = await fetch('/api/characters/network');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    initialData: {
      nodes: [
        { 
          id: 1, 
          name: "Local Shop Owner", 
          group: 1, 
          role: "Business Owner",
          traits: { 
            openness: 0.8, 
            conscientiousness: 0.7, 
            extraversion: 0.9, 
            agreeableness: 0.8, 
            stability: 0.6 
          },
          connections: [
            { id: 2, name: "Community Teacher" },
            { id: 3, name: "Youth Mentor" }
          ]
        },
        { 
          id: 2, 
          name: "Community Teacher", 
          group: 2, 
          role: "Educator",
          traits: { 
            openness: 0.7, 
            conscientiousness: 0.9, 
            extraversion: 0.6, 
            agreeableness: 0.9, 
            stability: 0.8 
          },
          connections: [
            { id: 1, name: "Local Shop Owner" },
            { id: 3, name: "Youth Mentor" }
          ]
        },
        { 
          id: 3, 
          name: "Youth Mentor", 
          group: 2, 
          role: "Mentor",
          traits: { 
            openness: 0.9, 
            conscientiousness: 0.8, 
            extraversion: 0.7, 
            agreeableness: 0.9, 
            stability: 0.7 
          },
          connections: [
            { id: 1, name: "Local Shop Owner" },
            { id: 2, name: "Community Teacher" }
          ]
        }
      ],
      links: [
        { source: 1, target: 2, value: 0.8 },
        { source: 2, target: 3, value: 0.9 },
        { source: 3, target: 1, value: 0.7 }
      ]
    }
  });
}