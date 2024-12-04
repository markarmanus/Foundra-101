## The Gift of Simplicity

In today’s digital age, we often encounter websites filled with technical terms and jargon that can be difficult to understand. Whether you’re buying a gift for a loved one, diving into a new hobby, or reading AWS developer documentation, it’s easy to feel overwhelmed by unfamiliar terminology.

Foundra-101 is a tool that simplifies this experience, translating complex content into clear, concise language while maintaining the website’s original structure and style. With this tool, navigating the web becomes effortless, empowering you to become an expert in any topic.

## Running Locally

To run the project locally, follow these steps:

1. **Clone the Repository**
2. Run `npm install` to install dependencies.
3. Run `npm run build` to build the project.
4. Open **Manage Extensions** in Google Chrome.
5. Enable **Developer Mode** in the top-right corner.
6. Click **Load Unpacked**.
7. Select the `build` folder generated at the root of the repository.

> **NOTE:** To enable hot-reloading for the extension, replace step 3 with:  
> `NODE_ENV=development npx vite build --watch`

The extension should now appear in Chrome and be ready for use!

## Development

Its required before changing any code that all the developers are using the same linting configuration, to confirm this please make sure you have following 2 extensions installed on your VS Code

1. **Prettier - Code Formatter**
2. **Prettier ESLint**
3. **ESLint**

## Code Design

The repo is split mainly into 3 folders

- **ExtensionRuntime**
- **TabRuntime**
- **BackgroundRuntime**

These folders represent the distinct environments where the code operates, enabling seamless communication between components and reducing the likelihood of bugs.

The project is built with **Vite** and **React**, leveraging **TypeScript** for a consistent, strongly typed development experience.
