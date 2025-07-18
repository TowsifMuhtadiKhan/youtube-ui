# YouTube Shorts UI Clone

This project is a simple clone of YouTube's Shorts UI, implemented using React and Material-UI. It demonstrates how to display YouTube Shorts videos in a responsive, scrollable layout with infinite scroll functionality that loads new videos as the user scrolls down. This UI can be integrated with a backend API to fetch actual video data in a real-world application.

## Project Overview

- **UI Layout**: The UI mimics the YouTube Shorts layout, displaying embedded YouTube Shorts videos within an interactive scrollable container.
- **Infinite Scroll**: When the user scrolls to the bottom of the screen, more Shorts videos are loaded, mimicking the infinite scrolling experience.
- **Responsive Design**: The layout adapts to different screen sizes (mobile, tablet, desktop), making the user experience consistent across devices.

## Key Features

- Embedded YouTube Shorts videos using `iframe`.
- Scrollable container with infinite scrolling to load more videos as the user scrolls.
- Mobile-first responsive design, with the sidebar collapsing on smaller screens.
- Uses Material-UI for styling and responsive layouts.
- The app is set up with React and React Router for navigation.

## Technologies Used

- **React**: JavaScript library for building user interfaces.
- **Material-UI**: A React component library for faster and easier web development.
- **React Router**: For handling navigation between different views (Home, Shorts, etc.).
- **CSS (via Material-UI's `sx` prop)**: For custom styling and layout adjustments.

## How to Set Up and Run the Project

### 1. Clone the repository

First, clone this repository to your local machine:

```bash
git clone https://github.com/your-username/shorts-ui-clone.git
