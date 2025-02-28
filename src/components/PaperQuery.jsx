import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BaseLayoutContext } from './BaseLayout'

import {fetchPaperMetadata, isValidDOI, handleCrossRefError} from './../util/paper';

const PaperQuery = () => {
    const N_RECENT_PAPERS=10;

    // All state declarations in one place at the top
    const {recentPapers, setRecentPapers} =  useContext(BaseLayoutContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [papers, setPapers] = useState([]);
    const [searchError, setSearchError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handle search input change
    const handleSearchChange = (e) => {
	setSearchQuery(e.target.value);
	setSearchError('');
    };

    // Handle search submission
    const handleSearch = async (e) => {
	e.preventDefault();
	
	if (!searchQuery.trim()) {
	    setPapers([]);
	    return;
	}

	// If it looks like a DOI, fetch metadata from CrossRef
	if (isValidDOI(searchQuery.trim())) {
	    const doi = searchQuery.trim()
	    
	    setIsLoading(true);
	    let fetchedPaper = {};
	    setSearchError('');
	    try{
		fetchedPaper=await fetchPaperMetadata(doi);
	    } catch(error) {
		setSearchError(handleCrossRefError(error, doi));
	    }
	    setIsLoading(false);
	    setPapers([fetchedPaper]);
	    const  newRecentPapers = [fetchedPaper, ...recentPapers.filter(paper => paper[doi] !== fetchedPaper.doi)].slice(0,N_RECENT_PAPERS);
	    setRecentPapers(newRecentPapers);

	} else {
	    
	    // Search in title, authors, and journal - really want to do this via google scholar or something
	    /*
	      const found = paperDatabase.filter(paper =>
	      paper.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
	      paper.authors.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
	      paper.journal.toLowerCase().includes(searchQuery.toLowerCase().trim())
	      );
	      setPapers(found);
	      if (found.length === 0) {
	      setSearchError('No papers found matching your search');
	      }
	    */
	    setSearchError('No papers found matching your search');
	}
    };

    return(
	<div>
	    {/* Search Bar */}
	    <div className="mb-6">
		<form onSubmit={handleSearch} className="relative">
		    <input
			type="text"
			value={searchQuery}
			onChange={handleSearchChange}
			placeholder="Search by DOI, title, or author..."
			className="w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
			disabled={isLoading}
		    />
		    <button 
			type="submit" 
			className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
			disabled={isLoading}
		    >
			{isLoading ? (
			    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
			) : (
			    <Search className="w-4 h-4" />
			)}
		    </button>
		</form>
		{searchError && (
		    <p className="mt-2 text-red-600 text-sm">{searchError}</p>
		)}
	    </div>


	    {/* Paper Query */}
	    <div className="space-y-4">
		{papers.map(paper => (
		    <Link 
			to={{pathname:`/paper/${encodeURIComponent(paper.id)}`, state:{paper:paper}}} 
			key={paper.id} 
			className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
		    >
			<div className="flex justify-between">
			    <div className="flex-grow">
				<h2 className="text-lg font-semibold text-gray-800 text-left">{paper.title}</h2>
				<div className="mt-2 text-sm text-gray-600 text-left">
				    <p>{paper.authors}</p>
				    <p className="mt-1">
					{paper.journal} • Published: {paper.publishDate}
				    </p>
				    <p className="mt-1 text-gray-500">DOI: {paper.id}</p>
				</div>
			    </div>

			    <div className="ml-4 flex items-start">
				<div className="text-sm text-blue-600">
				    <span className="font-medium">{paper.commentCount}</span>
				    <span className="ml-1">{paper.commentCount === 1 ? 'comment' : 'comments'}</span>
				</div>
			    </div>				
			</div>
		    </Link>
		))}
	    </div>
	</div>
    );
}

export default PaperQuery;
