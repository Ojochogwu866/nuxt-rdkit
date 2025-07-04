# RDKit + Nuxt Integration

A simple example of integrating RDKit.js with Nuxt 3 for chemical structure visualization.

## Features

- 🧪 Render molecular structures from SMILES
- 📱 Responsive SVG output
- ⚡ Client-side rendering with Nuxt SPA mode
- 🎨 Clean Vue 3 + TypeScript implementation

## Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/Ojochogwu866/nuxt-rdkit.git
   cd rdkit-nuxt-example
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Use the component**
   ```vue
   <MoleculeViewer smiles="CCO" />
   ```

## Configuration

The project uses RDKit via CDN (configured in `nuxt.config.ts`):

```typescript
export default defineNuxtConfig({
  ssr: false, // Required for RDKit
  app: {
    head: {
      script: [
        { src: 'https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js', defer: true }
      ]
    }
  }
});
```

## Example SMILES

- Ethanol: `CCO`
- Benzene: `c1ccccc1`
- Caffeine: `CN1C=NC2=C1C(=O)N(C(=O)N2C)C`

## Stack

- **Nuxt 3** - Vue.js framework
- **RDKit.js** - Cheminformatics toolkit
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Article

Read the full integration guide: [How to Configure RDKit in Your Nuxt Project](https://medium.com/@Ojochogwu/how-to-configure-rdkit-in-your-nuxt-project-7ea162b9c415)

## License

MIT
