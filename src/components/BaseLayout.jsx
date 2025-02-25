import { LogIn } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { createContext, useState } from 'react';

export const BaseLayoutContext = createContext();

const BaseLayout = () => {
    const [recentPapers, setRecentPapers] = useState([]);

    return (
	<BaseLayoutContext.Provider value={{ recentPapers, setRecentPapers }}>
		<div className="min-h-screen bg-gray-50">
		    {/* Header with login */}
		    <header className="bg-white shadow">
			<div className="grid grid-cols-12 gap-6 px-4 py-3 items-center">
			    <div className="col-span-1 col-start-1">
				<Link to="/">
				    <h1 className="text-xl font-bold text-gray-800">PubNostr</h1>
				</Link>
			    </div>

			    <div className="col-start-10 col-end-110">
				<Link to="/about">
				    <h2 className="text-lg text-gray-800">About</h2>
				</Link>
			    </div>

			    <div className="col-start-11 col-end-11">
				<Link to="/faq">
				    <h2 className="text-lg text-gray-800">FAQ</h2>
				</Link>
			    </div>


			    <div className="col-start-12 col-end-12">
				<button className="bg-blue-600 text-white rounded-md hover:bg-blue-700">
				    <LogIn className="w-4 h-4" />
				    Login
				</button>
			    </div>
			    
			</div>
		    </header>

		    {/* Main content area */}
		    <div className="px-4 py-6">
			<div className="grid grid-cols-12 gap-6">
			    {/* Main content */}
			    <main className="col-span-9">
				<Outlet />
			    </main>
			    {/* Right sidebar */}
			    <aside className="col-span-3">
				<div className="bg-white p-4 rounded-lg shadow">
				    <h3 className="font-semibold text-base text-gray-800 mb-3">Recent Papers</h3>
				    {recentPapers.map(paper => (
					<Link
					    to={`/paper/${encodeURIComponent(paper.id)}`}
					    key={paper.id}
					    className="block text-sm py-2">{paper.title}</Link>))}
				</div>
			    </aside>
			</div>
		    </div>
		</div>
	    </BaseLayoutContext.Provider>
	    );
	    };

	    export default BaseLayout;
