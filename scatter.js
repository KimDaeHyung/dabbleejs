//import * as Eos from 'eosjs';


document.addEventListener('scatterLoaded', scatterExtension => {
    // Scatter will now be available from the window scope.
    // At this stage your app's connection to the Scatter web extension is encrypted
    // and ready for use.
    const scatter = window.scatter;
})

function gfScatterLogin(){

		
		const network = {
    blockchain:'eos',
    host:'mainnet.eoscalgary.io',
    port:80,
    protocol:'https',
    chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
};
//const account = scatter.identity.accounts.find(account => account.blockchain === 'eos')
		const requiredFields = {
    		accounts:[ { blockchain:'eos', chainId:'aca....' } ]
		};
		const eos = scatter.eos( network, Eos, eosOptions, 'https' );
		eos.contract('hello').then(contract => {
    		contract.hi(...args)
		});
 
		scatter.getIdentity().then(identity => {
    		//...
		}).catch(error => {
    		//...
		});
	}
window.scatter = null;
