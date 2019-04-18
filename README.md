# Quadratic Voting Dapp
- UNIX time converter: https://www.epochconverter.com 
- hex to text converter: http://www.unit-conversion.info/texttools/hexadecimal/
- Ropsten contract: https://ropsten.etherscan.io/address/0x66a7f62d9b29f7dc267163ee39b6da4d47915bf5#code, or https://oneclickdapp.com/vienna-parking/


# Dev Setup and Usage
#### If you do not have truffle and ganache-cli installed already, run:
1. ```npm install -g truffle```
2. ```npm install -g ganache-cli```

### Once truffle and ganache-cli are installed, run:
1. `git clone https://github.com/nward13/QuadraticVotingDapp.git`
2. `cd ./QuadraticVotingDapp`
3. `npm install`

## To run tests:
1. `ganache-cli`  
In a separate terminal window:  
2. `truffle test`

## To run dev server:
1. `ganache-cli`  
In a separate terminal window: 
2. `truffle migrate --compile-all --reset`
3. `npm run start`

# Project Basics

Quadratic voting is an alternative to the one-person-one-vote system in which votes can be purchased, either with real currency or with an artificially scarce "voting credit". The price of the votes is equal to the square of the total number of votes purchased. The main advantage of quadratic voting over a one-person-one-vote system is the ability to prevent "tyranny of the majority", in which a large number of people care little about an issue but overpower a minority group that cares very strongly about the same issue. In many situations, one-person-one-vote can lead to a suboptimal outcome for everyone involved. Because voters cannot indicate how strongly they feel about a choice (only direction can be indicated, not magnitude), they are often incentivized to vote for the option they dislike the least in order to make their vote "count". The effect of this can be seen in the two-party democratic system in the U.S. Essentially, quadratic voting strives for a balance in which people give ground on issues that they care less about in exchange for a stronger voice on the issues they care more about.

Governance is an area of particular importance for blockchain applications for several reasons. For one, blockchain is an emerging technology with tremendous potential to effect positive change in the world, but successfully harnessing this technology requires great care in these early stages of development to design a system which empowers everyone to work towards the greater good. Blockchain also provides an exciting opportunity to reinvent the process of governance. This is a rare possibility given the immense institutional inertia of political systems. This smart contract provides a potential implementation of quadratic voting on the Ethereum blockchain using a commit/reveal system. I would love to hear any feedback about design decisions, security vulnerabilities, possible improvements, or interesting applications. The code is free and available to anyone who wishes to use it, but this is still very much a work in progress and I make no guarantees about the robustness or security. I am in the process of transforming the contract logic into a library for use as a governance system within other smart contracts.

## How to explore the DApp
The home page will prompt you to download MetaMask if you are not already running a Web3-enabled browser. Connect MetaMask to Localhost 8545 (the default port for ganache-cli and the development port configured for this project). The basic flow of an election is:

#### Election Admin:
1. Create a poll on the homepage using "Make a Poll." The start time and close time determine the timing for the phases of the poll. The cost of the first vote determines how much voters have to pay for votes (total cost for votes = (# of votes committed ^ 2) * first vote cost). When voters commit votes they will have to provide this amount as a deposit. When they reveal their votes, they will be refunded an amount equal to the total paid in by committed voters divided by the total number of votes committed. This means that every voter receives the same refund per vote, regardless of how many votes they committed. Any voter who does not reveal their vote will lose their deposit. After the election is completed, the remaining deposits will be sent to the charity address.
2. After refreshing the page, you will see the poll under "Polls Created/Administrated." Follow the "Manage Poll" link to see the poll admin page. You can always reach this page by going to localhost:3000/admin/{ID-of-the-poll} where {ID-of-the-poll} is 1, 2, 3, etc.
3. Add Candidates to the poll. These can be simple choices such as "yes/no" or actual candidates, and you can add up to 255 candidates to a poll.
4. Approve voters to vote in the poll. Only approved voters will be able to commit and reveal votes. You can approve your own address.
5. Once voters are approved, the poll will move through the commit and reveal phases without any intervention on the part of the admin (as long as there are voters participating). Once the reveal phase is ended, the admin can run the Complete Poll function from the admin page to send the un-returned deposits to the charity address. It should be noted, however, that anyone has the ability to call this function after the reveal phase has ended, and, regardless of whether or not it is called, no voter will be able to reveal votes after the reveal phase deadline (defined as closeTime + (closeTime - startTime)).

#### Approved Voters:
1. Once your address is added to the list of approved voters for an election, refreshing the homepage will add the poll to your list of "Polls Approved to Vote In." Follow the link to the voter page for the election. You can always reach this page by going to localhost:3000/voter/{ID-of-the-poll} where {ID-of-the-poll} is 1, 2, 3, etc.
2. The next step is to hash your vote. On a production blockchain, you would either want to hash this locally on a trusted and very secure third party application (which my basic front-end is certainly not) or (the better option) offline on your own machine. The commitment hash is designed to keep your vote secret, and is the keccak256 hash of the poll ID, the number of votes you want to commit, the ID of the candidate you want to vote for (1, 2, 3, etc.), and a secret salt. This salt is important to ensuring your vote remains secret, so it should be kept secret until the reveal phase and should never be reused. However, it also should not contain any sensitive information, as it will be revealed in the reveal phase of the poll. The function provided on the voter page offers the option to auto-generate a salt (which simply takes the keccak256 of your public key, and is not secure for a production blockchain, but is good enough for testing purposes). After you fill in the rest of the data and submit, your hash will appear and can be copied-and-pasted into the Commit Vote function. If you want to hash your own commitment, there is a function provided in QuadraticVoting.sol that will help you check that you are correctly matching the keccak256 hash locally (there can be some issues with matching data type encodings, and it is very frustrating to not be able to reveal votes because your hash doesn't match). This function is for development only, and will be removed in the future.
3. Once your commitment hash is created and the poll has entered the commit phase (phase changes are initiated by most function calls to the contract, so if it is past the poll start time but the phase still reads 'Created' you will still be able to commit a vote), you can commit your vote using the hash and the number of votes you want to commit (this must be the same number of votes you used to create your commitment hash). The deposit required to commit the votes will be shown and automatically added to the MetaMask transaction.
4. After committing your votes, wait for the poll to enter the reveal phase. Again, phase changes are initiated by most function calls to the contract, so the reveal phase time is more important than the nominal poll status. You can reveal your vote by entering the ID of the candidate that you committed a vote for and the salt that you used in the commitment hash (the auto-generate salt option here creates the same salt as the auto-generate option in the hash function). After revealing your vote, your vote will be tallied and you will be refunded.  
`Refund = (total deposited by all voters / total # of votes committed by all voters) * # of votes that you committed`  
Note that this will not necessarily be the amount that you originally deposited. Voters that purchase larger numbers of votes will be refunded less per vote than those that commit small numbers. This is an intentional design of the system, and is discussed later in this README. Also note that the denominator is not the total number of votes revealed, so if users do not reveal committed votes, their deposits will be transferred to the charity address.


## Design Decisions
This system was loosely modeled after the Colony voting system discussed in these three great Medium posts:

https://blog.colony.io/towards-better-ethereum-voting-protocols-7e54cb5a0119 (1)

https://blog.colony.io/token-weighted-voting-implementation-part-1-72f836b5423b (2)

https://blog.colony.io/token-weighted-voting-implementation-part-2-13e490fe1b8a (3)

However, there are several significant differences in the implementation, the most obvious of which is the fact that Colony has created a token-weighted voting system which has very different implementation requirements. Ultimately, every blockchain voting system faces the challenge that there is no notion of an individual on the blockchain. The benefits of token-weighted voting are touched on in article (1) above. Token-weighted systems avoid vulnerability to Sybil attacks (when one user creates many "identities" to achieve some advantage in a peer-to-peer system) by determining the weight or importance of a vote based on the user's stake or token balance. This, in turn, brings up the challenge of ensuring that voters do not transfer tokens to other voters during voting, essentially double-counting the weight of the same coins. The colony approach combats this by using a partial lock on voting accounts. 

In a quadratic voting system, account locking is not needed because the balance of an account does not matter, only how much the account chooses to commit to the vote. However, the potential for a Sybil attack is once again an issue, as a user could create a large number of addresses to purchase every vote at the initial vote price (avoiding the quadratic scaling of vote cost). Most solutions to this so far involve "whitelisting" accounts in some form or another, which is not always ideal but can be acceptable in many situations, and is ultimately what I decided to use. Below is a discussion of the solution used in this implementation as well as other potential solutions.

### Avoiding Sybil Attacks
A Sybil attack in a quadratic voting system would essentially mean that one individual, contract, cyborg, etc. can create multiple accounts and place one vote from each of them, purchasing every vote at the entry price instead of paying more for each additional vote. I considered several different approaches to the challenge of voter verification, including a token curated registry and issuing ERC-721 "right-to-vote" tokens. Each approach has its own unique properties that could be ideal in certain applications and would be fun to play around with in the future. I am particularly interested in exploring the idea of ERC-721 tokens and the implications of such a system (think secondary markets for right-to-vote tokens combined with markets to buy and sell votes from those with the right to vote). Ultimately, I settled temporarily on a simple address whitelisting system in which the creator of each election can add addresses to the approved voters list, and votes are only accepted from these addresses. This is definitely not a perfect solution in many contexts, and I am working on implementing a zkSNARK-based alternative.

#### Address Whitelisting
In this (currently implemented) solution, the election administrator adds the addresses of every approved voter to the contract before the vote commitment phase. This was selected mostly for simplicity, but it leaves slightly more power in the hands of the election administrator and also leaves the vote more susceptible to vote-buying schemes (see Vote Buying section for more info on this).

#### zkSNARK-based whitelisting
This solution is not yet implemented, but I am working on adding it because it has a few distinct advantages over simple address whitelisting. Basically, the election administrator would add a merkle tree to the contract that contains a hash of some data with a "secret voter id". The secret voter id would be some value that is unique to the approved voters, known by both the voter and the election administrator, and not likely to be known by anyone else. An example would be a hash of a voter's social security number and birthday in a national election. **NOTE: Blockchain-based voting is not ready for applications in national elections, and there are many reasons to believe that it will never be a good choice for elections of that kind of scale and importance. This example is included for simplicity.

Once the merkle tree of approved voters is added to the contract, a voter would us a Zero-Knowledge Succinct Non-Interactive Argument of Knowledge (zkSNARK) to verify that they indeed have the secret voter id data of a leaf in the tree (i.e. I would prove that I know both my social security number and birthday without revealing either of them on-chain).

This still leaves quite a bit of power in the hands of the election admin, but some potential for abuse of this centralized power is eliminated because it is impossible for an outside observer to determine which voters have or have not been approved to vote. This also increases voter anonymity and helps make vote-buying mechanisms far more difficult to set up. Voters can vote from any address as long as they have the secret voter id data, making it possible to create a new Ethereum address for every vote to avoid any votes being associated with the identity of an individual. This also interrupts the ability of vote-buying systems to identify the voters in an election and to verify that they voted the desired way. For more info on vote-buying in quadratic voting systems, see the Vote Buying section below.

### Vote Storage
In the Colony voting system featured in the articles above, a double-linked list is used to store votes. I would highly suggest checking out the discussion of this data structure in the above articles, as they used some really interesting features such as requiring users to calculate where their vote should be inserted off-chain in order to save on gas costs and avoid running into the block-gas limit when inserting votes. This linked list is especially important because the contract must check if a user has an unrevealed vote every time they attempt to send a transaction or another address attempts to send a transaction to them. In our implementation, there is no token-locking, and thus less of a need for super-efficient searching through individual votes. I chose to store all votes in a double mapping from the voter's address => the ID of the poll => the Vote struct itself. Polls are stored in a simple mapping from the ID of the poll => the poll struct.

### Voting with ETH
I played around with a few different ideas for voting value, but I settled on creating a contract that accepts ETH in exchange for votes. Alternatives would include integrating with existing ERC-20 tokens or issuing new tokens to approved voters within an organization. The refund for each of these would depend on the exact implementation. For example, if a new token was created solely for voting in a series of elections, there would be no need to refund them. If integrated with a particular token contract, the refund could be strategically designed to suit the goals of the contract. In theoretical discussions of quadratic voting systems, both voting with actual currency and using artificial voting tokens usually come up. The most apparent objection to directly using fiat currency (or, in this case, ETH) is that it is literally buying votes, giving an obvious advantage to the wealthy. I would argue that votes are 'bought' in every political system, it's just a matter of how well disguised the purchases are. Additionally, a direct currency-for-votes quadratic voting system actually has the potential to distribute political leverage far more equally across socio-economic strata. Because of the quadratic scaling of vote cost, directly buying a large number of votes quickly becomes extremely expensive and can be overcome by many voters buying votes at the entry price. Also, the refund system serves as a way to redistribute any money that comes into the political system. In this particular implementation,  
`Refund = (total deposited by all voters / total # of votes committed by all voters) * # of votes that you committed` 
 The more votes you place, the less you are refunded as a percentage of the total paid.

### Refunding
Because the contract accepts ETH in exchange for votes, each account that reveals their vote (see commit/reveal section for more info on this) receives a refund that is guaranteed to be greater than or equal to the cost of one vote. This stems from the fact that fractional votes can be submitted, but the vote minimum is one. Refunding each vote-revealer the same amount incentivizes submitting at least one vote and serves as a form of redistributing power in a large-scale system. The refund received per vote committed is equal to the total paid into the election during the vote committing period divided by the total number of votes committed.  
`Total Refund = (total deposited by all voters / total # of votes committed by all voters) * # of votes that you committed`  
The more votes you place, the less you are refunded as a percentage of the total paid. Additionally, the remaining funds from voters who commit votes but do not reveal them are sent to a charity address designated by the poll creator. This address could also be a pool for the benefit of whatever organization was participating in the election, or (unfortunately) a personal fund for the creator. However, I would like to implement some sort of popular verification of the charity address in the future. Another option would be to wait until the reveal phase of the election is ended and refund everyone more ETH (total paid in / total votes revealed rather than committed). The downside of this is loss of liquidity for voters. Essentially, everyone who committed and revealed votes would need to wait for the reveal phase to end before receiving their refund.

### Power Held by the Election Creator (planned change)
I made a concerted effort to limit the power of the election creator, but the current limitations of identity on the blockchain and the importance of preventing Sybil attacks in a quadratic voting system require some level of centralization. The election creator is essentially in charge of creating an election with pre-specified characteristics and approving voters to vote in the election. The phases of the election are self-policing and can not be influenced by the election creator after the poll has been created. Each voting function runs a poll-phase modifier to check if the election is currently in the correct phase, and if it is not, the phase is changed. The downside of this is slightly more gas costs every time a use runs a function. The upside is the election creator does not have the ability to modify the timing of the election phases in an attempt to influence the outcome or prevent voters from claiming their refund by making the reveal phase as short as possible. I decided that the additional decentralization provided by this design was a worthy trade-off for voters.

### Commit/Reveal
The commit/reveal system is well-discussed in articles (1) and (2) above. Essentially, a user submits a hash of some information about the election, their vote, and a secret or salt during the commit phase. This way, no one else knows how others voted before they cast their own vote. In a partial-lock voting system, commit/reveal also serves the purpose of allowing people to maintain liquidity of their tokens between the time they vote and the end of the election, but this is not the case in this system (which unfortunately creates an incentive to vote as late as possible in the commit phase). In the reveal phase, voters who committed a vote reveal the salt that they used and the vote that they committed. Everyone else can verify that the hash matches their committed vote, and that they actually voted the way that they claim. Additionally, votes are counted as they are revealed instead of all at once at the end of the election. This prevents problems with the block gas limit when counting votes.

### Circuit Breaker system
In the event of an emergency with the contract, a circuit-breaker system is implemented that allows most of the contract functions to be stopped. However, this would give the owner of the contract the power to freeze the funds of any un-revealed voters in any election. To prevent this, while the contract is stopped, the withdraw() function is available. This function works very similarly to the revealVote function, but can be run at any time and does not tally votes but allows voters to claim their refund in the event of an emergency that requires the contract to be stopped.

### Vote Buying
Disclaimer: Calling this a design decision is a bit of a misnomer, because there is no specific piece of code in this contract that solves the problem yet. However, I think the susceptibility of blockchain-based voting (esp. quadratic voting) systems to the development of vote-buying markets is worth discussing a bit. The issue of vote buying is still largely unexplored in the blockchain space. While it has certainly been considered and investigated, I believe there are a lot of unknowns about how it will play out in the long run. It is extremely important that developers try to predict as well as possible how the incentive structures of the environments we create will evolve over time. However, this is obviously easier said than done, and getting it right will require the collaboration of many different groups. In the context of quadratic voting systems, vote buying is especially concerning, because the costs for an attacker are significantly lower than in other voting systems. As a small scale example, if I wanted to vote twice in an election, I could afford to pay someone else double the cost of their vote to place a second vote for me, because that is what it would cost for me to buy a second vote from my own address. The discrepancy only increases with the more votes an attacker wants to buy, and this is before you factor in the potential gain from influencing the election that inspires vote-buying in a one-person-one-vote system. 

For an interesting discussion on vote-buying on the blockchain, see Phil Daian's article here:
http://hackingdistributed.com/2018/07/02/on-chain-vote-buying/

For more general discussions about the downfalls of blockchain-based voting and on-chain governance, see Vitalik Buterin's article here:
https://vitalik.ca/general/2018/03/28/plutocracy.html

and Vlad Zamfir's article here:
https://medium.com/@Vlad_Zamfir/against-on-chain-governance-a4ceacd040ca

## Future Additions
This contract is still a work in progress. The near-future plans include improving the voter whitelisting process using zkSNARKS, further limiting the power of election creators and the contract owner, and implementing a secondary voting process by which approved voters in an election can anonymously vote on whether the election creator has created fair terms for the poll and decide whether to participate as a group.


Thank you for checking out this project! Please feel free contact me with any questions, comments, suggestions, or criticisms.

-Nick
