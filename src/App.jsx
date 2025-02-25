import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BaseLayout from './components/BaseLayout';
import PaperQuery from './components/PaperQuery';
import PaperDetail from './components/PaperDetail';
import FAQ from './pages/FAQ';
import About from './pages/About';
import { ErrorBoundary } from "react-error-boundary";


function App() {
    return (

	<Router>
	    <Routes>
		<Route path="/" element={<BaseLayout />}>
		    <Route index element={<PaperQuery />} /> 
		    <Route path="/paper/:id" element={<PaperDetail />} />
		    <Route path="/faq" element={<FAQ />} /> 
		    <Route path="/about" element={<About />} /> 
		</Route>
	    </Routes>
	</Router>

    );
}

export default App;
