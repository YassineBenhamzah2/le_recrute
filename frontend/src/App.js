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
          <Route path='/profile' element={<ProfileScreen />} exact />
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

          <Route path='/admin/dashboard' element={<AdminDashboardScreen />} />
          <Route
            path='/admin/candidatures'
            element={<AdminCandidaturesScreen />}
          />
          <Route
            path='/admin/utilisateurs'
            element={<AdminUtilisateursScreen />}
          />
          <Route path='/admin/offres' element={<AdminOffresScreen />} />
          <Route path='/admin/entreprises' element={<AdminEntreprisesScreen />} />

          <Route
            path='/controlleurs/dashboard'
            element={<ControlleurDashboard />}
          />

          <Route
            path='/controlleurs/candidatures/control1'
            element={<ControlleursCandidaturesScreen />}
          />
          <Route
            path='/controlleurs/candidatures/informations/:id'
            element={<CandidaturesInformationsScreen />}
          />
          <Route
            path='/controlleurs/candidatures/diplomes/:id'
            element={<CandidaturesDiplomesScreen />}
          />

          <Route
            path='/controlleurs/candidatures/experiences/:id'
            element={<CandidaturesExperiencesScreen />}
          />

          <Route
            path='/controlleurs/candidatures/validations/:id'
            element={<CandidatureVlidationScreen />}
          />

          <Route
            path='/controlleurs/candidatures/control2'
            element={<ControlleursCandidatures2Screen />}
          />

          <Route
            path='/maitre-ouvrage/candidatures'
            element={<MaitreCandidatures />}
          />
        </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </Router>
  );
};

export default App;
