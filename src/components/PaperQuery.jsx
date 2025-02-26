import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BaseLayoutContext } from './BaseLayout'

const PaperQuery = () => {
    const N_RECENT_PAPERS=10;
    const {recentPapers, setRecentPapers} =  useContext(BaseLayoutContext);
    
    // All state declarations in one place at the top
    const [searchQuery, setSearchQuery] = useState('');
    const [papers, setPapers] = useState([]);
    const [searchError, setSearchError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const getPaperFromCache = (doi) => {
	try {
	    const paperData = JSON.parse(localStorage.getItem(doi) || '{}');
	    if (!paperData) return null;
	    return paperData;
	} catch (error) {
	    console.error('Error reading from cache:', error);
	    return null;
	}
    };

    const cachePaper = (doi, paperData) => {
	try {
	    localStorage.setItem(doi, JSON.stringify(paperData));
	} catch (error) {
	    console.error('Error writing to cache:', error);
	}
    };

    // Improved error handling for CrossRef API
    const handleCrossRefError = (error, doi) => {
	console.error('CrossRef API error:', error);
	
	if (error.name === 'AbortError') {
	    return 'Request timed out. Please try again.';
	}
	
	if (!navigator.onLine) {
	    return 'No internet connection. Please check your connection and try again.';
	}

	if (error.message === 'DOI not found') {
	    return `Could not find paper with DOI: ${doi}. Please verify the DOI is correct.`;
	}

	if (error.message.includes('rate limit')) {
	    return 'Too many requests. Please wait a moment and try again.';
	}

	return 'An error occurred while fetching the paper information. Please try again later.';
    };

    // Basic DOI validation
    const isValidDOI = (doi) => {
	// This is a basic check - you might want to use a more sophisticated regex
	return doi.startsWith('10.') && doi.includes('/');
    };

    // Handle search input change
    const handleSearchChange = (e) => {
	setSearchQuery(e.target.value);
	setSearchError('');
    };

    // Fetch paper metadata from CrossRef with timeout and caching
    const fetchPaperMetadata = async (doi) => {
	try {
	    setIsLoading(true);
	    setSearchError('');

	    // Check cache first

	    let fetchedPaper = null;
	    const cachedPaper = getPaperFromCache(doi);
	    if (cachedPaper) {
		fetchedPaper = cachedPaper;
		setPapers([fetchedPaper]);
	    } else {
		// Set up timeout for the fetch
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		const response = await fetch(
		    `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
		    {
			signal: controller.signal,
			headers: {
			    // Add email for CrossRef API tracking (better rate limits)
			    'User-Agent': 'PubNostr (mailto:your-email@example.com)'
			}
		    }
		);

		clearTimeout(timeout);

		if (!response.ok) {
		    throw new Error(response.status === 404 ? 'DOI not found' : 
				    `HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const work = data.message;

		// Validate required fields
		if (!work.title || !work.title[0]) {
		    throw new Error('Invalid paper data: missing title');
		}

		// Create paper object from CrossRef data
		const newPaper = {
		    id: doi,
		    title: work.title[0],
		    journal: work['container-title']?.[0] || 'Journal not specified',
		    publishDate: work.published?.['date-parts']?.[0]?.[0] || 'Date not specified',
		    authors: work.author?.map(a => `${a.given} ${a.family}`).join(', ') || 'Authors not specified',
		    commentCount: 0,
		    // Add more metadata that might be useful
		    type: work.type || 'unknown',
		    url: work.URL || null,
		    abstract: work.abstract || null
		};

		// Cache the paper data
		cachePaper(doi, newPaper);
		fetchedPaper = newPaper;
	    }
	    setIsLoading(false);
	    setPapers([fetchedPaper]);
	    console.log(fetchedPaper);
	    const  newRecentPapers = [fetchedPaper, ...recentPapers.filter(paper => paper[doi] !== newPaper.doi)].slice(0,N_RECENT_PAPERS);
	    setRecentPapers(newRecentPapers);
	    
	    
	} catch (error) {
	    setSearchError(handleCrossRefError(error, doi));
	} finally {
	    setIsLoading(false);
	}
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
	    await fetchPaperMetadata(searchQuery.trim());
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
			to={`/paper/${encodeURIComponent(paper.id)}`} 
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
