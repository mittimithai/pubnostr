import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { NoComment } from 'react-nocomment'

const PaperDetail = () => {
    // Get DOI from URL params and decode it
    const { id: encodedDoi } = useParams();
    console.log('Encoded DOI from params:', encodedDoi);
    
    const doi = encodedDoi ? decodeURIComponent(encodedDoi) : null;
    console.log('Decoded DOI:', doi);
    
    const [paper, setPaper] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Fetch paper metadata
    useEffect(() => {
	const fetchPaper = async () => {
	    setIsLoading(true);
	    setError(null);
	    try {
		const response = await fetch(
		    `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
		    {
			headers: {
			    'User-Agent': 'PubNostr (mailto:your-email@example.com)'
			}
		    }
		);

		if (!response.ok) {
		    throw new Error('Failed to fetch paper details');
		}

		const data = await response.json();
		const work = data.message;

		setPaper({
		    doi: doi,
		    title: work.title[0],
		    journal: work['container-title']?.[0] || 'Journal not specified',
		    publishDate: work.published?.['date-parts']?.[0]?.[0] || 'Date not specified',
		    authors: work.author?.map(a => `${a.given} ${a.family}`).join(', ') || 'Authors not specified',
		    abstract: work.abstract || null
		});
	    } catch (error) {
		console.error('Error fetching paper:', error);
		setError(error.message);
	    } finally {
		setIsLoading(false);
	    }
	};

	if (doi) {
	    fetchPaper();
	}
    }, [doi]);

    const handleAddComment = async () => {
	if (!newCommentContent.trim()) return;
	
	setIsSubmitting(true);
	try {
	    // TODO: Get privkey from user authentication
	    await addComment(newCommentContent, null);
	    setNewCommentContent('');
	} catch (error) {
	    console.error('Error adding comment:', error);
	} finally {
	    setIsSubmitting(false);
	}
    };

    if (isLoading) {
	return (
	    <div className="min-h-screen bg-gray-50 py-6">
		<div className="container mx-auto px-4">
		<div className="flex justify-center items-center h-64">
		<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
		</div>
		</div>
	);
    }

    if (error) {
	return (
	    <div className="min-h-screen bg-gray-50 py-6">
		<div className="container mx-auto px-4">
		<div className="bg-red-50 border border-red-200 rounded-lg p-4">
		<p className="text-red-600">Error loading paper: {error}</p>
		<Link to="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
		<ArrowLeft className="w-4 h-4 mr-2" />
		Return to search
            </Link>
		</div>
		</div>
		</div>
	);
    }

    if (!paper) {
	return (
	    <div className="min-h-screen bg-gray-50 py-6">
		<div className="container mx-auto px-4">
		<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
		<p className="text-yellow-600">Paper not found</p>
		<Link to="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
		<ArrowLeft className="w-4 h-4 mr-2" />
		Return to search
            </Link>
		</div>
		</div>
		</div>
	);
    }

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
	    <NoComment relays={[
		'wss://nostr.drss.io',
		'wss://nostr-relay.freeberty.net',
		'wss://nostr.unknown.place',
		'wss://nostr-relay.untethr.me',
		'wss://relay.damus.io'
	    ]} />       
            </div>
	    </div>
	    
	    </div>
    );
};

export default PaperDetail;
