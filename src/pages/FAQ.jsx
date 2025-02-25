const FAQ = () => {
    return (
	<div className="bg-white rounded-lg shadow p-6 mb-6">
	    <div className="font-semibold text-gray-800 mb-3">

		<h2>What is does this site do?</h2>
		<p className="font-normal">PubNostr aims to be a <a href="http://pubpeer.com">PubPeer</a> workalike based on <a href = "https://nostr.com/">Nostr</a>. Something better is needed, I really don't yet know if the  Nostr-verse will really really work here, but I hope it does.</p>
		    <br />
		    
		<h2>What's really wrong with PubPeer?</h2>
		    <p className="font-normal">Pubpeer has a number of deficiences. I long stopped using it (the interface has barely changed since its inception) and it stopped being fun. Here is a short list of some of its biggest problems:</p>
		    <br />
		    <ul className="font-normal">
			<li><i>Moderation is slow and opaque</i> - Pubpeer doesn't have much junk, but I've had prefectly sensible comments just disappear and never get any sort of understanding why. You need moderation to do something like what PubPeer tries to do, but the policy should look extremely liberal.</li>
			<br />
			<li><i>Not very social</i> - Analyzing academic publications is fun, it naturally brings about lots of fun side discussion etc.  There is no mechanism to really do this on PubPeer, making it a bit more a social network facilitating the natural branching of conversation in other channels/DMs etc. There are some great commentors on PubPeer, for instance, that it would be great to be easier ot interact with/follow etc.</li>
						<br />
			<li><i>No personalized view</i> - When you go to PubPeer you just get a list of the papers with recently approved comments. This is good as it is nice to see interesting comments on papers from fields that are distal to one's own, but it would make more sense to be able to have a feed that was enriched in user specific interests like specific papers, journals and commentors.</li>
						<br />
			<li><i>Centralized</i> - You have to trust PubPeer to keep your insitutional email private etc. A decenteralized, crytpgraphically based system seems like a much better idea that provides stronger assurance to users and enable them to speak with greater freedom.</li>
		    </ul>

	    <br />

	    </div>
	</div>
    );
}

export default FAQ;
