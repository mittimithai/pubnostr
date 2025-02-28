const getPaperFromCache = (doi) => {
    try {
	const paperData = JSON.parse(localStorage.getItem(doi) || 'null');
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
export const handleCrossRefError = (error, doi) => {
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
export const isValidDOI = (doi) => {
    // This is a basic check - you might want to use a more sophisticated regex
    return doi.startsWith('10.') && doi.includes('/');
};


// Fetch paper metadata from CrossRef with timeout and caching
export const fetchPaperMetadata = async (doi) => {
    let fetchedPaper = null;
    const cachedPaper = getPaperFromCache(doi);

    if (cachedPaper) {
	fetchedPaper = cachedPaper;
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
	fetchedPaper = {
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
	cachePaper(doi, fetchedPaper);
    }
    return(fetchedPaper);    
};
