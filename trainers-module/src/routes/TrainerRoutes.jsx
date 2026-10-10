// src/routes/TrainerRoutes.jsx
//
// Drop these <Route> entries into your app's main router (e.g. inside
// the <Routes> block in App.jsx). Uses react-router-dom v6.
//
// import TrainerRoutes from "./routes/TrainerRoutes";
// <Routes>
//   {TrainerRoutes}
//   ...other routes
// </Routes>

import { Route } from "react-router-dom";
import TrainersListPage from "../pages/Trainers/TrainersListPage";
import TrainerProfilePage from "../pages/Trainers/TrainerProfilePage";
import TrainerEditProfilePage from "../pages/Trainers/TrainerEditProfilePage";
import CourseDetailPage from "../pages/Courses/CourseDetailPage";

const TrainerRoutes = (
  <>
    <Route path="/trainers" element={<TrainersListPage />} />
    <Route path="/trainers/:trainerId" element={<TrainerProfilePage />} />
    <Route path="/trainers/:trainerId/edit" element={<TrainerEditProfilePage />} />
    <Route path="/courses/:courseId" element={<CourseDetailPage />} />
  </>
);

export default TrainerRoutes;
