Overview

The Faculty Timetable Management System is a mobile application built with React Native and Firebase, designed to manage faculty timetables and leave applications in an organized and user-friendly manner. The system allows faculty members to view their own timetables, apply for leaves, and provides admin users (HR, HOD, Principal) with the ability to manage timetables, approve or reject leave applications, and oversee overall faculty leave statuses.

Key Features

Faculty Timetable Upload: Allows administrators to upload CSV files containing weekly timetables for faculties. The uploaded timetables are parsed and stored in the Firestore database.

Individual Faculty View: Faculties can log in to view their own weekly timetables, with the ability to select and view timetables by date.

Admin Timetable View: Administrators (HR, HOD, Principal) can view timetables for all faculties. Admin users can browse faculty lists, select specific dates, and view detailed schedules.

Role-Based Access: Users with specific roles (admin, faculty) have different access rights, ensuring that only authorized users can manage or view certain timetables.

Leave Application and Management:

Faculty members can apply for different types of leaves (Casual, Medical, Maternity, etc.).
HODs, HR personnel, and Principals can view, approve, or reject leave requests.
Leave types and the number of leaves allowed per year are managed and updated for each faculty member.
A faculty member’s leave history is tracked and stored in Firestore.

Date Filtering: Only upcoming and valid dates are displayed for timetable views, allowing users to focus on future schedules.

Technology Stack

React Native Expo: The core framework for building the mobile application.

Firebase Firestore: For real-time storage of timetable and leave data in a structured format.

Firebase Authentication: Handles secure user sign-in for both faculty and admin users.

Firebase Storage: For uploading and storing CSV files containing timetables.

Document Picker: Used for selecting CSV files to upload.


Leave Application Process


Faculty Leave Application:

Faculty members can log in and submit leave requests, choosing from predefined leave types (Casual, Medical, Maternity).

Each leave request includes details like the start date, end date, reason for leave, and type of leave.

Admin Leave Management:

HODs, HR personnel, and Principals are notified of pending leave requests and can view the details.
They have the authority to approve or reject leave applications, based on their role.
Once a decision is made, the leave status is updated, and the faculty member is notified of the decision.
Leave Types:

The system tracks the total number of leaves available for each faculty member for different leave types:

Casual Leave: Limited casual leave days per year.
Medical Leave: Allowed for medical reasons, with proof where required.
Maternity Leave: Special leave for faculty members under maternity conditions.
Leave balances are updated automatically based on approved or rejected applications.
Project Structure
The project includes the following key components:

SignInScreen: Allows users (faculty and admins) to log in securely.

FacultyDashboard: Displays the faculty's own timetable and provides access to the leave application feature.

AdminDashboard: Allows admin users to manage timetables and leave requests for all faculty members.

UploadTimetable: A feature where admins can upload timetables in CSV format, which are parsed and saved into Firestore.

FacultyTimetable: Displays the weekly timetable for an individual faculty member, allowing them to view details by date.

AdminTimetable: Admin view of timetables where they can select a faculty member, choose a date, and view specific timetable details.

LeaveApplicationScreen: Faculty members can submit leave requests for approval by the HOD, HR, or Principal.

LeaveManagementScreen: Admins can view, approve, or reject leave applications based on their roles.

Features in Development
Notification System: Notify faculties of upcoming schedules and leave application status.

UI/UX Enhancements: Ongoing UI improvements for a better user experience.

How It Works

File Upload: Admin users upload a CSV file containing timetable data using the file picker feature. The file is then parsed, and the timetable information is saved in Firestore, under subcollections for each faculty.
Timetable Viewing: Faculty and admin users can view the timetable through a clean and easy-to-navigate interface. Faculties only see their own timetables, while admin users can browse timetables for all faculties.
Leave Management: Faculty members can apply for leaves via the Leave Application screen. Admin users (HOD, HR, Principal) manage the leave requests, with the ability to approve or reject them. Leave balances are updated in real time.
Firestore Integration: The app uses Firestore to store timetable and leave data, ensuring efficient data management and retrieval.
Installation and Setup
To set up the project on your local machine:

Clone the repository:

bash

Copy code
git clone https://github.com/your-repo/faculty-timetable-management.git

cd faculty-timetable-management
Install dependencies:

bash
Copy code

npm install

Set up Firebase:

Add your Firebase project credentials in the firebaseConfig.js file located in the root of the project.
Run the application:

bash
Copy code
npx expo start

Usage

Admin Upload: Log in as an admin user and navigate to the "Upload Timetable" screen to upload a CSV file containing faculty timetable data.
Faculty View: Faculty members can log in and view their weekly timetables.
Admin View: Admin users can view timetables for all faculty members by navigating through the list of faculties and selecting specific dates.
Leave Application: Faculty members can apply for leaves, and admins (HOD, HR, Principal) can approve or reject the applications.
