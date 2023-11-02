const xrpl = require('xrpl');

const nfts = require('./burnNFTs.json')
const { walletSeed, node } = require('./config.json');


const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let xrpClient;

xconnect().then(function () { createOffers() });

async function createOffers() {

    

    var mintingWallet = xrpl.Wallet.fromSeed(walletSeed);

    for (nft in nfts) {
        //console.log(nft);

        var destination = "";
        
        txt = `Burning ${nft}`;

        var offerID = await burnNFT(xrpClient, nft,mintingWallet);

        console.log(offerID)

        console.log(txt);
    }

  //  await delay(10000)
}

async function xconnect() {

    if (typeof xrpClient !== 'undefined' && xrpClient !== null) { if (xrpClient.isConnected) return; }
    console.log('connecting to **XRPL** '+node);

    xrpClient = new xrpl.Client(node)

    await xrpClient.connect()

}

async function burnNFT(client, nftID,  nftWallet) {

        var offer = {
            "TransactionType": "NFTokenBurn",
            "Account": nftWallet.classicAddress,
            "NFTokenID": nftID,
        }

        var nftBurnPrep = await client.autofill(offer)


        var nftBurnSigned = nftWallet.sign(nftBurnPrep);
        var nftBurnResult = await client.submitAndWait(nftBurnSigned.tx_blob);

        if (nftBurnResult.result.meta.TransactionResult == "tesSUCCESS") {
            for (a in nftBurnResult.result.meta.AffectedNodes) {
                if ("CreatedNode" in nftBurnResult.result.meta.AffectedNodes[a]) {
                    if (nftBurnResult.result.meta.AffectedNodes[a].CreatedNode.LedgerEntryType == "NFTokenOffer") {
                        var nftOfferIndex = nftBurnResult.result.meta.AffectedNodes[a].CreatedNode.LedgerIndex;

                        return nftOfferIndex;
                    }
                }
            }
        } else {
            console.log(nftBurnResult.result)
        }
    

    return null;
}