import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import {fetchPaperMetadata, handleCrossRefError} from './../util/paper';

import "zapthreads";

const PaperDetail = () => {
    // Get DOI from URL params and decode it
    const { id: encodedDoi } = useParams();

    const doi = encodedDoi ? decodeURIComponent(encodedDoi) : null;

    const [paper, setPaper] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch paper metadata
    useEffect(() => {
	const fetchPaper = async () => {
	    setIsLoading(true);
	    setError(null);
	    const fetchedPaper = await fetchPaperMetadata(doi);
	    setPaper(fetchedPaper);
	};

	if (doi) {
	    fetchPaper();
	}
    }, [doi]);


    console.log(window.location.href);
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4">

		{/* Paper details */}
		<div className="bg-white rounded-lg shadow p-6 mb-6">
		    <h1 className="text-2xl font-bold text-gray-800 mb-4 text-left">{paper.title}</h1>
		    <div className="text-gray-600 mb-4 text-left">
			<p className="mb-2">{paper.authors}</p>
			<p>{paper.journal} • Published: {paper.publishDate}</p>
			<p className="text-gray-500">DOI: {paper.doi}</p>
		    </div>
		</div>

		<h2 className="text-2xl font-bold text-gray-800 mb-4 text-left">Comments</h2>	
		<div className="bg-white rounded-lg shadow p-6">
		    <zap-threads
		    relays="wss://relay.damus.io"
		    anchor={window.location.href}
		    disable="likes,zaps"
		    />

		</div>
	</div>
	
	</div>
    );
};

export default PaperDetail;
