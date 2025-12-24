require('dotenv').config()
const oci = require('../client/ociClient');
module.exports = async (fileName) => {
    try {
        const response = await oci.getClient().createPreauthenticatedRequest({
      namespaceName:process.env.OCI_NAMESPACE,
      bucketName:process.env.OCI_BUCKETNAME,
            createPreauthenticatedRequestDetails: {
                name: `${fileName}_PAR`,
                objectName: fileName, 
                accessType: "ObjectRead",
                timeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        });
        return response;
    } catch (error) {
        console.log('ohhhh Error During PAR Creation',error);
    }
}