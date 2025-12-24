require('dotenv').config();
const oci = require('../client/ociClient');

module.exports = async (fileName, uploadId, parts) => {

    try {
        await oci.getClient().commitMultipartUpload({
            namespaceName: process.env.OCI_NAMESPACE,
            bucketName: process.env.OCI_BUCKETNAME,
            objectName: fileName,
            uploadId,
            commitMultipartUploadDetails: {
                partsToCommit: parts
            }
        });
        console.log("File Commit sucsess")
    } catch (error) {
        console.log("error during file Commit",error)
    }

}