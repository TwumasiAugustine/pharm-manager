---
applyTo: '**/*.ts'
---
Maintain consistent code style and structure across the project. Follow these guidelines:
1. **File Naming**: Use kebab-case for file names (e.g., `patient-record.ts`).
2. **Function Naming**: Use camelCase for function names (e.g., `calculateDosage`).
3. **Variable Naming**: Use camelCase for variable names (e.g., `patientName`, `medicationList`).
4. **Constants**: Use UPPER_SNAKE_CASE for constants (e.g., `MAX_DOSAGE_LIMIT`).
5. **Indentation**: Use 4 spaces for indentation.
6. **Line Length**: Limit lines to 80 characters for better readability.
7. **Comments**: Use JSDoc style for function comments and inline comments for complex logic.
8. **Imports**: Group imports logically (e.g., external libraries, internal modules).
9. **Error Handling**: Use try-catch blocks for error handling and provide meaningful error messages.
10. **Modularization**: Keep functions small and focused on a single task. Avoid large monolithic functions.
11. **Performance**: Optimize for performance where necessary, but prioritize readability and maintainability.
12. **Scalability**: The code should be scalable to accommodate future features like prescription management, inventory tracking, and patient history.
13. **PWA Compliance**: Ensure that the code adheres to PWA standards for offline capabilities and responsiveness.
14. **Reference MD file to use**: Use the provided `pharmacy_management_software.md` as a reference for project structure and functionality.
16. **Type Safety**: Use reusable types and TypeScript features like interfaces and types to ensure type safety across the application.
17. **Consistent UI and UX**: Follow the design guidelines provided in the `pharmacy_management_software.md` to ensure a consistent user interface and experience.
18. **Use package.json**: Always check for available packages in the `package.json` file and leverage and use all installed packages in the `package.json` file to manage project dependencies, scripts, and metadata effectively.
19. **Folder Structure**: Maintain a modular folder structure for both frontend and backend, ensuring clear separation of concerns (e.g., controllers, services, routes, utils, types, middlewares).
20. **Bug Fixes**: Always check `client` and `server` to find the root cause of bugs and fix them in the appropriate place such as `hooks`, `api` etc. Do not suggest code that has been deleted or is no longer relevant.
21. **Break Larger Components and Functions**: If a component or function is becoming too large or complex, break it down into smaller, reusable components or functions. This will improve readability, maintainability, and testability.
22. **Read Codebase**: Always read the codebase to understand existing patterns and practices before making changes. This will help maintain consistency and avoid introducing new issues.
