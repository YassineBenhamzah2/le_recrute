import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import ABBSreen from './screens/ABBSreen';
import AboutUsScreen from './screens/AboutUsScreen';
import AdminCandidaturesScreen from './screens/admin/AdminCandidaturesScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUtilisateursScreen from './screens/admin/AdminUtilisateursScreen';
import AdminOffresScreen from './screens/admin/AdminOffresScreen';
import AdminEntreprisesScreen from './screens/admin/AdminEntreprisesScreen';
import CandidatureScreen from './screens/CandidatureScreen';
import CandidaturesDiplomesScreen from './screens/controlleurs/CandidaturesDiplomesScreen';
import CandidaturesExperiencesScreen from './screens/controlleurs/CandidaturesExperiencesScreen';
import CandidaturesInformationsScreen from './screens/controlleurs/CandidaturesInformationsScreen';
import CandidatureVlidationScreen from './screens/controlleurs/CandidatureValidationScreen';
import ControlleursCandidatures2Screen from './screens/controlleurs/ConrolleursCandidatures2Screen';
import ControlleurDashboard from './screens/controlleurs/ControlleurDashboard';
import ControlleursCandidaturesScreen from './screens/controlleurs/ControlleursCandidatures';
import DiplomesScreen from './screens/DiplomesScreen';
import ExperiencesScreen from './screens/ExperiencesScreen';
import HomeScreen from './screens/HomeScreen';
import InformationsPersonnellesScreen from './screens/InformationsPersonnellesScreen';
import LoginScreen from './screens/LoginScreen';
import MaitreCandidatures from './screens/maitreOuvrage/MaitreCandidatures';
import PosteDetailsScreen from './screens/PosteDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import VerificationScreen from './screens/VerificationScreen';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <ToastProvider autoDismissTimeout='5000'>
        <ErrorBoundary>
          <Routes>
            <Route path='/' element={<HomeScreen />} exact />
            <Route path='/about-us' element={<AboutUsScreen />} exact />
            <Route path='/verification' element={<VerificationScreen />} exact />
            <Route path='/login' element={<LoginScreen />} exact />
            <Route path='/register' element={<RegisterScreen />} exact />
            <Route path='/poste/:poste' element={<PosteDetailsScreen />} exact />
            <Route
              path='/profile'
              element={
                <ProtectedRoute allowedRoles={['candidat', 'admin', 'maitreOuvrage', 'controleur']}>
                  <ProfileScreen />
                </ProtectedRoute>
              }
              exact
            />
            <Route path='/al-barid-bank' element={<ABBSreen />} exact />
            <Route
              path='/poste/:poste/informations-personnelles'
              element={<InformationsPersonnellesScreen />}
            />
            <Route
              path='/poste/:poste/diplomes'
              element={<DiplomesScreen />}
              exact
            />
            <Route
              path='/poste/:poste/experiences'
              element={<ExperiencesScreen />}
            />
            <Route
              path='/poste/:poste/candidature/:id'
              element={<CandidatureScreen />}
            />

            {/* ESPACE ADMINISTRATEUR (STRICTEMENT RÉSERVÉ AUX ADMINS) */}
            <Route
              path='/admin/dashboard'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin/candidatures'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCandidaturesScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin/utilisateurs'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUtilisateursScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin/offres'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOffresScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin/entreprises'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEntreprisesScreen />
                </ProtectedRoute>
              }
            />

            {/* ESPACE CONTRÔLEURS EHC (STRICTEMENT RÉSERVÉ AUX CONTRÔLEURS) */}
            <Route
              path='/controlleurs/dashboard'
              element={
                <ProtectedRoute allowedRoles={['controleur']}>
                  <ControlleurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/controlleurs/candidatures/control1'
              element={
                <ProtectedRoute allowedRoles={['controleur']}>
                  <ControlleursCandidaturesScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/controlleurs/candidatures/informations/:id'
              element={
                <ProtectedRoute allowedRoles={['controleur']}>
                  <CandidaturesInformationsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/controlleurs/candidatures/diplomes/:id'
              element={
                <ProtectedRoute allowedRoles={['controleur']}>
                  <CandidaturesDiplomesScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/controlleurs/candidatures/experiences/:id'
              element={
                <ProtectedRoute allowedRoles={['controleur']}>
                  <CandidaturesExperiencesScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/controlleurs/candidatures/validations/:id'
              element={
                <ProtectedRoute allowedRoles={['controleur']}>
                  <CandidatureVlidationScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path='/controlleurs/candidatures/control2'
              element={
                <ProtectedRoute allowedRoles={['controleur']}>
                  <ControlleursCandidatures2Screen />
                </ProtectedRoute>
              }
            />

            {/* ESPACE MAÎTRE D'OUVRAGE / RESPONSABLE RH ENTREPRISE (STRICTEMENT RÉSERVÉ AUX RH) */}
            <Route
              path='/maitre-ouvrage/candidatures'
              element={
                <ProtectedRoute allowedRoles={['maitreOuvrage']}>
                  <MaitreCandidatures />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </Router>
  );
};

export default App;
