# Appointment Booking System

A full-stack web application for managing appointments built with React and Node.js.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)

## Features
# User Roles
- Can view past or upcoming appointments based on the current date.
- Can modify the appointment schedule.
- Can delete their own schedule.

# Admin Roles
- Can view all users' appointments.
- Can edit the date and time of an appointment.
- Can delete any user's appointment.

# System Functionality
- The user must log in as either a "User" or an "Admin" to access the portal containing appointment details.
- Both the Admin and User receive a JWT token, which remains valid for one day.
- The Admin can only modify the date and time of an appointment, while the User can update the description and the person's name.
- Users can only view their own appointments, whereas the Admin has access to all appointments.
- A time slot cannot be booked more than once.
- Past dates cannot be selected when scheduling an appointment.

## Technologies Used
### Frontend
- React.js
- React Router
- Axios
- Material UI/Tailwind CSS (specify which one you're using)

### Backend
- Node.js
- Express.js
- MongoDB/PostgreSQL (specify which one you're using)
- JWT Authentication

## Prerequisites
Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB/PostgreSQL (depending on your database choice)

## Installation


```1. Clone the repository
bash
git clone https://github.com/Sakeen07/Appointment-Booking-System.git
cd Appointment-Booking-System

2. cd client
npm install

3. cd ../server
npm install

4. cd client
npm start

The frontend will run on http://localhost:3000

5. cd server
npm start
# OR if using nodemon
npm run dev

# Project Structure

appointment-booking-system/
├── client/                 # Frontend React application
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── package.json
└── README.md
