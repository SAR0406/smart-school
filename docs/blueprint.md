# **App Name**: SchoolZen

## Core Features:

- Class Selector: Class selector dropdown that populates the classes from `/get_all_classes` endpoint.
- Current Period Info: Displays the current period information using data from `/get_current_period` endpoint, with an emoji to indicate status.
- Today's Schedule: Displays today's schedule in a table format using `/get_day_schedule` data, along with a button to view the full week.
- Full Week Schedule: Displays a tabbed view of the full week's schedule using data from `/get_full_week` endpoint, from Monday to Sunday.
- AI Assistant: A versatile AI assistant that responds to a wide array of student needs by means of various `tool` to deliver chat responses, generate code, define terms, emulate a personal 'Jarvis'-style assistant, provide clear explanations, create quizzes, summarize content, provide constructive feedback, and produce detailed study notes, all tailored to enhance the learning experience.
- AI Interface: A chat interface allowing users to choose from various AI functions such as chat, code generation, definition, Jarvis mode, explanation, quiz, summary, feedback, and notes, with persistent chat history stored in localStorage.
- Subject Search: A search feature that allows users to search for periods by subject using the `/search_periods_by_subject` endpoint, displaying the results grouped by day, with time slots and subject names.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) for a sense of intelligence and focus.
- Background color: Light gray (#F2F0F7), almost white, creating a clean and modern backdrop.
- Accent color: Blue-purple (#5067A4), a complementary hue that offers visual interest without overwhelming the user.
- Headline font: 'Space Grotesk', a sans-serif for headlines and shorter texts. Body font: 'Inter', a sans-serif for body text.
- Simple line icons to represent different functions and subjects.
- Card-based layout with a minimal and clean design, optimized for mobile responsiveness.
- Subtle animations and transitions to enhance user experience.