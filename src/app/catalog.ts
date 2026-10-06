export interface Product {
	id: string;
	name: string;
	type: string;
	price: number;
	image: string;
	alt: string;
	description: string;
	featured?: boolean;
}

export const PRODUCTS: Product[] = [
	{
		id: 'fix_it-classic',
		name: 'Glucofix Herbal Capsule',
		type: 'Botanical supplement · Capsules',
		price: 0,
		image: '/fixit.jpeg',
		alt: 'Glucofix Herbal Capsule green bottle',
		description: 'A research-based botanical formulation made for everyday wellness support.',
		featured: true,
	},
	{
		id: 'glucofix-balance',
		name: 'Glucofix Herbal Capsule',
		type: 'Botanical supplement · Capsules',
		price: 0,
		image: '/product%202.PNG',
		alt: 'Glucofix Herbal Capsule blue bottle',
		description: 'Plant-based support developed with quality, consistency, and care in mind.',
	},
	{
		id: 'phytogold-tea',
		name: 'PhytoGold Tea',
		type: 'Botanical infusion · 60 g',
		price: 0,
		image: '/product%203.PNG',
		alt: 'PhytoGold Tea botanical wellness tea',
		description: 'A scientifically formulated herbal infusion for overall vitality and wellness.',
	},
];

export const formatPrice = (value: number): string =>
	new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
