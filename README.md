# Faculty Timetable Management System

The **Faculty Timetable Management System** is a mobile application developed using **React Native** and **Firebase**. It is designed to efficiently manage faculty timetables and leave applications, providing an organized and user-friendly experience for both faculty members and administrative users.

## Key Features

- **Faculty Timetable Upload**: Administrators can upload weekly timetables in CSV format, which are parsed and stored in the Firestore database.
  
- **Individual Faculty View**: Faculty members can log in to view their own weekly timetables and select specific dates for detailed views.

- **Admin Timetable View**: Admin users (HR, HOD, Principal) can view all faculty timetables, browse faculty lists, and select specific dates to view detailed schedules.

- **Role-Based Access**: Access rights are assigned based on user roles (admin or faculty), ensuring that only authorized users can manage or view specific timetables.

- **Leave Application and Management**: Faculty members can apply for various types of leaves (Casual, Medical, Maternity), while HODs and HR personnel can approve or reject these requests. The system tracks leave history in Firestore.

- **Date Filtering**: Only upcoming and valid dates are displayed for timetable views, allowing users to focus on future schedules.

## Technology Stack

- **React Native Expo**: Core framework for building the mobile application.
  
- **Firebase Firestore**: Real-time storage for timetable and leave data.
  
- **Firebase Authentication**: Secure user sign-in for both faculty and admin users.
  
- **Firebase Storage**: For uploading and storing CSV files containing timetables.
  
- **Document Picker**: Used for selecting CSV files to upload.

## Leave Application Process

### Faculty Leave Application

1. Faculty members log in and submit leave requests, choosing from predefined leave types.
2. Each request includes details such as start date, end date, reason, and type of leave.

### Admin Leave Management

1. HODs, HR personnel, and Principals are notified of pending requests.
2. They can view details and have the authority to approve or reject applications.
3. Leave balances are updated automatically based on approved or rejected applications.

### Leave Types

- **Casual Leave**: Limited days per year.
- **Medical Leave**: Available with required proof.
- **Maternity Leave**: Special leave for maternity conditions.

## Project Structure

The project includes the following key components:

- `SignInScreen`: Secure login for users (faculty and admins).
  
- `FacultyDashboard`: Displays the faculty's timetable and access to leave applications.
  
- `AdminDashboard`: Admin management of timetables and leave requests.
  
- `UploadTimetable`: Feature for admins to upload CSV files of timetables.
  
- `FacultyTimetable`: Weekly timetable display for individual faculty members.
  
- `AdminTimetable`: Admin view of all timetables with selection options.
  
- `LeaveApplicationScreen`: Submission of leave requests by faculty members.
  
- `LeaveManagementScreen`: Admin view for managing leave applications.

## Features in Development

- **Notification System**: Notify faculties about upcoming schedules and leave application statuses.
  
- **UI/UX Enhancements**: Ongoing improvements for better user experience.

## How It Works

1. **File Upload**: Admins upload a CSV file containing timetable data using the file picker; this data is parsed and saved in Firestore under subcollections for each faculty member.
   
2. **Timetable Viewing**: Users can navigate through a clean interface; faculties see their own timetables while admins can browse all faculty schedules.

3. **Leave Management**: Faculty apply for leaves via the Leave Application screen; admins manage these requests with real-time updates to leave balances.

4. **Firestore Integration**: The app utilizes Firestore for efficient data management and retrieval.

## Installation and Setup

To set up the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/faculty-timetable-management.git
   cd faculty-timetable-management

2. Install dependencies:

npm install

3. Set up Firebase:
Add your Firebase project credentials in the firebaseConfig.js file located in the root of the project.
Run the application:
bash
npx expo start

## Usage
Admin Upload: Log in as an admin user to navigate to the "Upload Timetable" screen to upload a CSV file containing timetable data.
Faculty View: Faculty members log in to view their weekly timetables.
Admin View: Admin users can manage timetables across all faculty members by navigating through lists and selecting specific dates.
Leave Application: Faculty members submit leave requests while admins manage approvals or rejections accordingly.
