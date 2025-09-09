# Bow-Bow-Ties Website

A modern Next.js website for premium pet bow ties and accessories, inspired by the original repository from divisham21-cyber/Bow-Bow-Ties.

## Features

- 🎀 **Premium Pet Accessories**: Stylish bow ties designed for pets
- 🎨 **Modern Design**: Clean, responsive design with Tailwind CSS
- ⚡ **Next.js 15**: Built with the latest Next.js framework
- 🔧 **TypeScript**: Full type safety throughout the application
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🛒 **E-commerce Ready**: Product catalog with filtering capabilities

## Tech Stack

- **Framework**: Next.js 15.0.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.3.5
- **UI**: React 18.2.0
- **Build Tool**: Next.js with SWC

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository or use this code
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
bow-bow-ties-website/
├── pages/
│   ├── _app.tsx          # App component with global styles
│   └── index.tsx         # Homepage
├── styles/
│   └── globals.css       # Global styles with Tailwind
├── public/               # Static assets
├── components/           # Reusable React components (future)
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── postcss.config.js     # PostCSS configuration
```

## Features Implemented

### Homepage
- **Hero Section**: Eye-catching banner with call-to-action buttons
- **Product Catalog**: Grid layout showcasing bow tie products
- **Category Filtering**: Filter products by category
- **About Section**: Information about the brand and quality
- **Responsive Navigation**: Mobile-friendly header navigation
- **Footer**: Contact information and quick links

### Products
- Product cards with images, descriptions, and pricing
- Interactive category filtering
- Hover effects and smooth transitions
- Add to cart functionality (UI ready)

### Styling
- Custom color palette with primary (orange) and secondary (blue) themes
- Responsive design with mobile-first approach
- Custom CSS components for buttons and cards
- Smooth animations and transitions

## Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:
- **Primary**: Orange tones for main branding
- **Secondary**: Blue tones for accents

### Content
- Update product data in `pages/index.tsx`
- Modify company information in the footer
- Add new sections by editing the homepage

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

## Future Enhancements

- [ ] Shopping cart functionality
- [ ] Product detail pages
- [ ] User authentication
- [ ] Payment integration
- [ ] Admin panel for product management
- [ ] Customer reviews and ratings
- [ ] Search functionality
- [ ] Wishlist feature

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the original Bow-Bow-Ties repository by divisham21-cyber
- Built with Next.js and Tailwind CSS
- Icons and emojis used for visual appeal
