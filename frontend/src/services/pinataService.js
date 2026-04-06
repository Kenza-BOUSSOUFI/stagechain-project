import { PinataSDK } from "pinata";

// Obtenir le JWT depuis les variables d'environnement
const pinataJwt = process.env.REACT_APP_PINATA_JWT;

if (!pinataJwt) {
    console.error("REACT_APP_PINATA_JWT is not defined in the environment.");
}

const pinata = new PinataSDK({
  pinataJwt: pinataJwt,
  pinataGateway: "gateway.pinata.cloud" // URL de passerelle IPFS par défaut (vous pouvez utiliser la vôtre si vous en avez une)
});

/**
 * Uploader un fichier binaire (PDF, Image, etc.) vers IPFS
 * @param {File} file Objet de fichier provenant d'un input type="file"
 * @returns {Promise<string>} Le CID du fichier uploadé
 */
export const uploadFileToIPFS = async (file) => {
  try {
    console.log("Uploading file to IPFS...");
    const upload = await pinata.upload.file(file);
    console.log("File uploaded successfully! CID:", upload.cid);
    return upload.cid;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};

/**
 * Uploader un objet JSON descriptif (metadata) vers IPFS
 * @param {Object} jsonData Objet JSON contenant des métadonnées
 * @returns {Promise<string>} Le CID du JSON uploadé
 */
export const uploadJSONToIPFS = async (jsonData) => {
  try {
    console.log("Uploading JSON metadata to IPFS...");
    const upload = await pinata.upload.json(jsonData);
    console.log("JSON metadata uploaded successfully! CID:", upload.cid);
    return upload.cid;
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw error;
  }
};
