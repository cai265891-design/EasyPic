import { Project, TaskStatus } from '@/types';
import { sleep } from './utils';

// In-memory storage for mock projects
let memory: Record<string, Project> = {};

/**
 * Generate a mock project with demo data
 */
export async function projectDemo(id: string = 'demo-001'): Promise<Project> {
  if (memory[id]) return memory[id];

  const proj: Project = {
    id,
    name: 'Stainless Steel Water Bottle',
    status: 'analyzing',
    createdAt: new Date().toISOString(),
    images: [
      {
        id: 'img-orig',
        type: 'original',
        url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&h=1200&fit=crop',
        width: 1200,
        height: 1200,
        fileSize: 320000,
      },
      {
        id: 'img-main',
        type: 'main',
        url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=2000&h=2000&fit=crop',
        width: 2000,
        height: 2000,
        fileSize: 540000,
      },
      {
        id: 'img-life',
        type: 'lifestyle',
        url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=2000&h=2000&fit=crop',
        width: 2000,
        height: 2000,
        fileSize: 540000,
      },
      {
        id: 'img-detl',
        type: 'detail',
        url: 'https://images.unsplash.com/photo-1603073203252-35dedc2c1179?w=2000&h=2000&fit=crop',
        width: 2000,
        height: 2000,
        fileSize: 540000,
      },
      {
        id: 'img-dim',
        type: 'dimension',
        url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=2000&h=2000&fit=crop',
        width: 2000,
        height: 2000,
        fileSize: 540000,
      },
      {
        id: 'img-feat',
        type: 'feature',
        url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=2000&h=2000&fit=crop',
        width: 2000,
        height: 2000,
        fileSize: 540000,
      },
    ],
    copywriting: {
      title: 'Premium Stainless Steel Water Bottle – 32oz, Leak-Proof, Double-Wall Insulated, BPA-Free',
      bulletPoints: [
        '🌡️ TEMPERATURE CONTROL: Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours, perfect for all-day hydration',
        '💧 100% LEAK-PROOF: Innovative screw-on lid with silicone seal prevents spills and leaks, safe for bags and backpacks',
        '🌿 SAFE & DURABLE: Made from food-grade 18/8 stainless steel, BPA-free, rust-proof, and built to last through years of daily use',
        '🚗 PERFECT SIZE: 32oz capacity fits most car cup holders, ideal for gym, office, hiking, and travel - stays by your side wherever you go',
        '✨ EASY TO CLEAN: Wide mouth opening allows for easy filling and cleaning, dishwasher safe (hand wash recommended for longevity)',
      ],
      description: `<p>Introducing the ultimate hydration solution for your active lifestyle. Our Premium Stainless Steel Water Bottle combines cutting-edge insulation technology with sleek, durable design to keep your beverages at the perfect temperature all day long.</p>

<p><strong>Why Choose Our Bottle?</strong></p>
<ul>
<li>Advanced double-wall vacuum insulation technology</li>
<li>Premium 18/8 food-grade stainless steel construction</li>
<li>Eco-friendly and reusable - reduce plastic waste</li>
<li>Condensation-free exterior stays dry to the touch</li>
<li>Powder-coated finish for enhanced grip</li>
</ul>

<p><strong>Perfect For:</strong></p>
<p>Gym workouts, office use, outdoor adventures, daily commutes, hot yoga sessions, camping trips, and more. This versatile bottle adapts to your lifestyle needs.</p>

<p><strong>Care Instructions:</strong></p>
<p>For best results, hand wash with warm soapy water. Not recommended for carbonated beverages or hot liquids above 185°F.</p>`,
      language: 'en',
    },
    analysis: {
      category: 'drinkware',
      keywords: ['stainless steel', 'insulated', 'water bottle', '32oz'],
      productType: 'Water Bottle',
      mainColor: 'Silver',
      material: 'Stainless Steel',
      keyFeatures: ['Double-wall insulation', 'Leak-proof lid', 'BPA-free'],
      detailPoints: ['Cap seal', 'Interior coating', 'Bottom grip'],
      suggestedScenes: ['Gym workout', 'Office desk', 'Outdoor hiking'],
    },
  };

  memory[id] = proj;
  return proj;
}

/**
 * Simulate task status progression from analyzing -> completed
 */
export async function progressTicker(id: string): Promise<void> {
  const steps: TaskStatus[] = ['analyzing', 'writing', 'generating', 'completed'];

  for (const status of steps) {
    await sleep(2000); // 2 seconds per step
    if (memory[id]) {
      memory[id].status = status;
      console.log(`Mock: Project ${id} status updated to ${status}`);
    }
  }
}

/**
 * Reset mock memory (useful for testing)
 */
export function resetMockData(): void {
  memory = {};
}

/**
 * Get all mock projects
 */
export function getAllMockProjects(): Project[] {
  return Object.values(memory);
}
