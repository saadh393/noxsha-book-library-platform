This project is about publishing a book. There is an admin panel for the admin and a frontend for the frontend user. From the admin, it's supposed to control all the content on the frontend. The database is MongoDB, and for the storage we will be using ImageKit.

The table below shows the existing files in that project and the purpose of each file so that you don't have to go through each and every file to understand the project structure. When you are working, you are only allowed to see particular files when you have an explicit need for that file.

| Path                                       | Purpose                                                                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **README.md**                              | Project overview and setup instructions.                                                                                               |
| **.env.example**                           | Template for required environment variables.                                                                                           |
| **app/**                                   | Next.js App Router pages, layouts, and API routes.                                                                                     |
| **app/page.tsx**                           | Public landing/home page entry.                                                                                                        |
| **app/layout.tsx**                         | Root layout and shared wrappers for the app.                                                                                           |
| **app/globals.css**                        | Global stylesheet.                                                                                                                     |
| **app/admin/**                             | Admin UI routes (dashboard and login).                                                                                                 |
| **app/books/**                             | Public book listing and detail pages.                                                                                                  |
| **app/api/**                               | REST endpoints for auth, books, categories, downloads, payments, reviews, settings, social links, storage, highlights, and navigation. |
| **components/**                            | Reusable UI components for home, books, and admin views.                                                                               |
| **lib/**                                   | Shared app utilities (API, auth, DB, storage, pricing, revalidation, serializers, site content, types).                                |
| **database/seed<example>.mjs**             | Data seed script/template for initial content.                                                                                         |
| **public/**                                | Static assets (e.g., logo).                                                                                                            |
| **next.config.mjs**                        | Next.js configuration.                                                                                                                 |
| **tailwind.config.js / postcss.config.js** | Styling pipeline configuration.                                                                                                        |
| **tsconfig.json / next-env.d.ts**          | TypeScript configuration and Next.js type declarations.                                                                                |
| **package.json / lockfiles**               | Dependencies and npm scripts.                                                                                                          |

Coding Rule -

- Write Reuseable Code, Before writing any function you first search for if similar function already exists
- Separation of Concern - Write Pure functions is Separate file as Utility to ensure the Main logic Looks Organized
- Readable - Make code readable
- Write code what doen't broke existing codebase
- Handle errors explicitly and consistently — avoid silent failures, use centralized error handling (middleware in Node.js), and return predictable error structures
- Keep components focused and single-purpose
- Write code for readability over cleverness

Focus on solving the problem, Change files only related with solving current problem
