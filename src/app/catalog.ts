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
		name: 'Fix-It',
		type: 'Garden care',
		price: 0,
		image: '/fix-it.PNG',
		alt: 'Fix-It plant care product',
		description: 'Targeted care to help your plants thrive.',
		featured: true,
	},
	{
		id: 'phytogold-tea',
		name: 'PhytoGold Tea',
		type: 'Botanical infusion',
		price: 0,
		image: '/product%203.PNG',
		alt: 'PhytoGold Tea',
		description: '',
	},
	{
		id: 'glucofix',
		name: 'Glucofix',
		type: 'Supplement',
		price: 0,
		image: '/product%202.PNG',
		alt: 'Glucofix product',
		description: '',
	},
];

export const formatPrice = (value: number): string =>
	new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
