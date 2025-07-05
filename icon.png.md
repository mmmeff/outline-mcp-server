# Icon Requirements for Outline Knowledge Base Extension

This file describes the requirements for the `icon.png` file that should be included in the DXT extension.

## Icon Specifications

### File Requirements
- **Filename**: `icon.png`
- **Format**: PNG with transparency support
- **Size**: 512x512 pixels (recommended)
- **Color Depth**: 32-bit RGBA
- **Background**: Transparent

### Design Guidelines

The icon should represent the Outline Knowledge Base Extension and be recognizable at various sizes.

#### Suggested Design Elements

1. **Primary Symbol**: A combination of:
   - Document/page icon to represent knowledge base
   - Search magnifying glass to represent search functionality
   - Connection/link symbol to represent integration

2. **Color Scheme**:
   - Primary: Outline brand blue (#2D7FF9) or similar
   - Secondary: Light gray (#F8F9FA) for highlights
   - Accent: Dark gray (#1A1A1A) for contrast

3. **Style**:
   - Modern, flat design
   - Clean lines and minimal detail
   - Scalable vector-style appearance
   - Consistent with Claude Desktop's design language

#### Icon Concept Description

The icon could feature:
- A stylized document or book symbol in the center
- A subtle magnifying glass overlay to indicate search
- Clean, rounded corners consistent with modern UI design
- The Outline "O" symbol integrated if licensing permits

### Creating the Icon

To create the actual `icon.png` file:

1. **Use vector graphics software** like:
   - Adobe Illustrator
   - Figma
   - Sketch
   - Inkscape (free)

2. **Export settings**:
   - 512x512 pixels at 72 DPI
   - PNG format with transparency
   - Ensure the icon is centered and uses the full canvas

3. **Test at different sizes**:
   - 16x16 (system tray)
   - 32x32 (small UI elements)
   - 64x64 (medium UI elements)
   - 128x128 (large UI elements)
   - 256x256 (high DPI displays)

### Installation

Once created, place the `icon.png` file in the root directory of the extension, alongside `manifest.json`.

The manifest already references this icon:
```json
{
  "icon": "icon.png"
}
```

### Alternative

If you cannot create a custom icon, you can temporarily use:
1. A simple document icon from an icon library
2. The default Claude Desktop extension icon
3. A combination of existing icons

### Note

This description file (`icon.png.md`) should be **removed** once the actual `icon.png` file is created and placed in the project.