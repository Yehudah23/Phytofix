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
		id: 'fix_it',
		name: 'FIX-IT HERBAL CAPSULE',
		type: 'Garden care',
		price: 25000,
		image: '/fix-it.PNG',
		alt: 'Fix-It plant care product',
		description: 'Targeted care to help your plants thrive.',
		featured: true,
	},
	{
		id: 'phytogold-tea',
		name: 'PHYTOGOLD TEA',
		type: 'Botanical infusion',
		price: 8500,
		image: '/product%203.PNG',
		alt: 'PhytoGold Tea',
		description: '',
	},
	{
		id: 'glucofix',
		name: 'GLUCOFIX HERBAL CAPSULE',
		type: 'Supplement',
		price: 25000,
		image: '/product%202.PNG',
		alt: 'Glucofix product',
		description: '',
	},
];

export const formatPrice = (value: number): string =>
	new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
